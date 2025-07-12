import { useEffect, useRef, useCallback, useState } from 'react';
import ForceGraph3D from '3d-force-graph';
import * as d3 from 'd3-force-3d';

export interface Node {
  id: string | number;
  name?: string;
  val?: number;
  fraud?: boolean;
  color?: string;
  [key: string]: any;
}

export interface Link {
  source: string | number | Node;
  target: string | number | Node;
  color?: string;
  width?: number;
  [key: string]: any;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface ForceGraphProps {
  graphData?: GraphData;
  width?: number;
  height?: number;
  showNavInfo?: boolean;
  backgroundColor?: string;
  nodeRelSize?: number;
  d3ChargeStrength?: number;
  d3VelocityDecay?: number;
  d3AlphaDecay?: number;
  cameraPosition?: { x?: number; y?: number; z?: number };
  cameraLookAt?: { x: number; y: number; z: number };
  cameraTransitionMs?: number;
  containerStyle?: React.CSSProperties;
}

export default function ForceGraph({
  graphData,
  width,
  height,
  showNavInfo = false,
  backgroundColor = '#0000',
  nodeRelSize = 6,
  d3ChargeStrength = -125,
  d3VelocityDecay = 0.4,
  d3AlphaDecay = 0.07,
  cameraPosition = { x: 0, y: 3000, z: 100 },
  cameraLookAt,
  cameraTransitionMs = 0,
  containerStyle,
}: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [internalGraphData, setInternalGraphData] = useState<GraphData | undefined>(undefined);
  const [loadingInternalData, setLoadingInternalData] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const currentGraphData = graphData || internalGraphData;

  const updateGraphDimensions = useCallback(() => {
    if (graphRef.current) {
      const currentWidth = width ?? window.innerWidth;
      const currentHeight = height ?? window.innerHeight;
      graphRef.current.width(currentWidth).height(currentHeight);
    }
  }, [width, height]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    if (!graphData && !internalGraphData && !loadingInternalData && !internalError) {
      setLoadingInternalData(true);
      fetch('/nodes.json')
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data: GraphData) => {
          setInternalGraphData(data);
          setLoadingInternalData(false);
        })
        .catch(err => {
          setInternalError(`Error al cargar datos: ${err.message}`);
          console.error("Error al cargar graphData:", err);
          setLoadingInternalData(false);
        });
    }

    try {
      const Graph = new (ForceGraph3D as any)(container);
      graphRef.current = Graph;

      Graph.showNavInfo(showNavInfo)
        .backgroundColor(backgroundColor)
        .nodeColor((node: Node) => node.fraud ? '#27c0ff' : '#c2c6c7')
        .nodeRelSize(nodeRelSize)
        .linkColor((link: Link) => {
          const getNode = (n: any) =>
            typeof n === 'object' ? n : currentGraphData?.nodes.find(nd => nd.id === n);
          const source = getNode(link.source);
          const target = getNode(link.target);
          return source?.fraud || target?.fraud ? '#27c0ff' : '#d3d3d3';
        })
        .linkWidth((link: Link) => {
          const getNode = (n: any) =>
            typeof n === 'object' ? n : currentGraphData?.nodes.find(nd => nd.id === n);
          const source = getNode(link.source);
          const target = getNode(link.target);
          return source?.fraud || target?.fraud ? 4 : 0.5;
        })
        .linkDirectionalParticles((link: Link) => {
          const getNode = (n: any) =>
            typeof n === 'object' ? n : currentGraphData?.nodes.find(nd => nd.id === n);
          const source = getNode(link.source);
          const target = getNode(link.target);
          return source?.fraud || target?.fraud ? 8 : 0;
        })
        .linkDirectionalParticleWidth(() => 2)
        .linkDirectionalParticleColor(() => '#27c0ff')
        .d3Force('charge', d3.forceManyBody().strength(d3ChargeStrength))
        .d3VelocityDecay(d3VelocityDecay)
        .d3AlphaDecay(d3AlphaDecay)
        .d3Force('spherical', d3.forceRadial(100, 0, 0, 0).strength(0.35));

      if (cameraPosition) {
        Graph.cameraPosition(cameraPosition, cameraLookAt, cameraTransitionMs);
      }

      updateGraphDimensions();

      if (currentGraphData) {
        Graph.graphData(currentGraphData);
      }
    } catch (error) {
      console.error("Error al inicializar ForceGraph3D:", error);
    }

    return () => {
      if (graphRef.current) {
        graphRef.current = null;
        if (containerRef.current) containerRef.current.innerHTML = '';
      }
    };
  }, [
    graphData,
    showNavInfo,
    backgroundColor,
    nodeRelSize,
    d3ChargeStrength,
    d3VelocityDecay,
    d3AlphaDecay,
    cameraPosition,
    cameraLookAt,
    cameraTransitionMs,
    updateGraphDimensions,
    internalGraphData,
    loadingInternalData,
    internalError
  ]);

  useEffect(() => {
    if (graphRef.current && currentGraphData) {
      graphRef.current.graphData(currentGraphData);
    }
  }, [currentGraphData]);

  useEffect(() => {
    window.addEventListener('resize', updateGraphDimensions);
    return () => window.removeEventListener('resize', updateGraphDimensions);
  }, [updateGraphDimensions]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          ...containerStyle,
        }}
      />
      <div className="fixed lg:right-36 right-20 lg:mt-[18rem] z-10 mt-52 max-w-xs p-6 dark:bg-black/40 opacity-80 bg-[#f9fafb] backdrop-blur-md rounded-xl space-y-3">
        <div className="text-md font-semibold text-black/80 dark:text-white">
          Cantidad de Transacciones
        </div>
        {Object.entries({
          "No fraudulentas": 988970,
          "Fraudulentas": 11030,
        }).map(([label, count]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: label === "Fraudulentas" ? "#27c0ff" : "#c2c6c7" }}
              />
              <span className="text-black/80 dark:text-zinc-100">{label}</span>
            </div>
            <span className="text-black/60 dark:text-zinc-400 font-medium">{count}</span>
          </div>
        ))}
      </div>
    </>
  );
}
