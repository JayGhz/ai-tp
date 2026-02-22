import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const ForceGraph: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const [boxPos, setBoxPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, lastX: 0, lastY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      lastX: boxPos.x,
      lastY: boxPos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setBoxPos({
        x: dragRef.current.lastX + dx,
        y: dragRef.current.lastY + dy
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setClearAlpha(0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "0";
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }
    );

    const composer = new EffectComposer(renderer, renderTarget);
    const renderPass = new RenderPass(scene, camera);
    renderPass.clear = true;
    renderPass.clearAlpha = 0;
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,
      0.4,
      0.1
    );
    bloomPass.clear = false;
    bloomPass.renderToScreen = false;
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    outputPass.renderToScreen = true;
    composer.addPass(outputPass);

    scene.add(new THREE.AmbientLight(0x111111));
    const pointLight = new THREE.PointLight(0x88ccff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2();

    const interactionRadius = 1.5;
    const maxGlowIntensity = 5;
    const baseGlowIntensity = 0.5;
    const dispersalForce = 0.08;
    const returnForce = 0.02;
    const dampingFactor = 0.95;
    const rotationSpeed = 0.0025;

    let particles: any[] = [];
    let radarPulses: any[] = [];

    const loadNodes = async () => {
      try {
        const res = await fetch("/nodes.json");
        const data = await res.json();
        const geometry = new THREE.SphereGeometry(0.015, 6, 6);
        const radius = 2;

        data.nodes.forEach((node: any) => {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta);
          const z = radius * Math.cos(phi);
          const pos = new THREE.Vector3(x, y, z);
          const baseColor = node.fraud ? 0xff4c58 : 0x27c0ff;

          const mat = new THREE.MeshStandardMaterial({
            color: baseColor,
            emissive: new THREE.Color(baseColor),
            metalness: 0.5,
            roughness: 0.2,
            toneMapped: false,
          });

          const mesh = new THREE.Mesh(geometry, mat);
          mesh.position.copy(pos);
          group.add(mesh);

          const particle = {
            mesh,
            pos: pos.clone(),
            original: pos.clone(),
            velocity: new THREE.Vector3(),
            quaternion: new THREE.Quaternion(),
            baseColor: new THREE.Color(baseColor),
            isFraud: node.fraud,
          };

          particles.push(particle);

          if (node.fraud) {
            const ringGeo = new THREE.PlaneGeometry(0.6, 0.6);

            const radarMat = new THREE.ShaderMaterial({
              uniforms: {
                uColor: { value: new THREE.Color(0xff4c58).multiplyScalar(0.6) },
                uOpacity: { value: 0.0 },
                uRadius: { value: 0.0 },
              },
              transparent: true,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
              vertexShader: `
                            varying vec2 vUv;
                            void main() {
                              vUv = uv;
                              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                            }
                          `,
              fragmentShader: `
                            uniform vec3 uColor;
                            uniform float uOpacity;
                            uniform float uRadius;
                            varying vec2 vUv;
                            void main() {
                              float dist = distance(vUv, vec2(0.5));
                              float alpha = smoothstep(uRadius, 0.0, dist);
                              gl_FragColor = vec4(uColor, alpha * uOpacity);
                            }
                          `,
            });
            const pulse = new THREE.Mesh(ringGeo, radarMat);
            pulse.position.copy(pos);
            pulse.rotation.x = -Math.PI / 2;
            group.add(pulse);

            radarPulses.push({
              mesh: pulse,
              nodeRef: particle,
              radius: 0.0,
              opacity: 0.5,
              speed: 0.008 + Math.random() * 0.005,
            });
          }
        });
      } catch (e) {
        console.error("nodes.json load error:", e);
      }
    };


    const update = () => {
      raycaster.setFromCamera(mousePos, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const mouse3D = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, mouse3D);

      particles.forEach((p) => {
        const d = mouse3D.distanceTo(p.pos);
        const inRange = d < interactionRadius;
        const force = inRange ? dispersalForce * (1 - d / interactionRadius) : 0;

        if (inRange) {
          const dir = p.pos.clone().sub(mouse3D).normalize();
          p.velocity.add(dir.multiplyScalar(force * (1 + Math.random() * 0.2)));

          const intensity = THREE.MathUtils.lerp(
            maxGlowIntensity,
            baseGlowIntensity,
            d / interactionRadius
          );
          p.mesh.material.emissive = p.baseColor.clone().multiplyScalar(intensity);
        } else {
          p.mesh.material.emissive = p.baseColor.clone().multiplyScalar(baseGlowIntensity);
        }

        const distOrig = p.pos.distanceTo(p.original);
        const returnVec = p.original
          .clone()
          .sub(p.pos)
          .normalize()
          .multiplyScalar(returnForce * distOrig);
        p.velocity.add(returnVec);
        p.velocity.multiplyScalar(dampingFactor);
        p.pos.add(p.velocity);
        p.mesh.position.copy(p.pos);

        if (p.velocity.length() > 0.001) {
          p.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            p.velocity.clone().normalize()
          );
          p.mesh.quaternion.slerp(p.quaternion, 0.1);
        }
      });

      radarPulses.forEach((pulse) => {
        pulse.radius += pulse.speed;
        pulse.opacity -= pulse.speed * 1.2;

        if (pulse.opacity <= 0) {
          pulse.radius = 0.0;
          pulse.opacity = 0.5;
        }

        pulse.mesh.material.uniforms.uRadius.value = pulse.radius;
        pulse.mesh.material.uniforms.uOpacity.value = pulse.opacity;
        pulse.mesh.position.copy(pulse.nodeRef.pos);
        pulse.mesh.lookAt(camera.position);
      });

      group.rotation.y += rotationSpeed;

    };

    const animate = () => {
      requestAnimationFrame(animate);
      update();
      controls.update();

      const isDarkMode = document.documentElement.classList.contains("dark");
      if (isDarkMode) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      renderTarget.setSize(window.innerWidth, window.innerHeight);
    };

    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);

    loadNodes().then(() => {
      animate();
      setLoading(false);
    });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      controls.dispose();
      composer.dispose();
      renderTarget.dispose();
    };
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full" />

      <div
        ref={mountRef}
        className={`canvas-container transition-opacity duration-[1200ms] ease-out ${loading ? "opacity-0" : "opacity-100"
          }`}
        style={{
          width: "100%",
          height: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          overflow: "hidden",
          zIndex: 0,
        }}
      />

      <div 
        className={`fixed lg:right-28 sm:mt-20 sm:right-8 right-20 lg:mt-[18rem] z-10 mt-52 max-w-xs p-6 backdrop-blur-md rounded-xl space-y-3 opacity-80 bg-[#f9fafb] dark:bg-black/20 hidden sm:block select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ transform: `translate(${boxPos.x}px, ${boxPos.y}px)` }}
        onMouseDown={handleMouseDown}
      >
        <div className="lg:text-lg text-sm font-semibold dark:text-white/90 text-black/80">
          Cantidad de Transacciones
        </div>

        {Object.entries({
          "No fraudulentas": 988970,
          "Fraudulentas": 11030,
        }).map(([label, count]) => {
          const isFraudulent = label === "Fraudulentas";
          return (
            <div
              key={label}
              className="flex items-center justify-between text-xs lg:text-sm"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 mr-1 rounded-full"
                  style={{
                    backgroundColor: isFraudulent ? "#ff4c58" : "#27c0ff",
                  }}
                />
                <span className="dark:text-white/80 text-black/80">{label}</span>
              </div>
              <span className="dark:text-white/60 text-black/60 ml-16 font-medium">
                {count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ForceGraph;
