import { useEffect, useRef } from 'react';

export default function Graph() {
    const container = useRef(null);

    useEffect(() => {
        if (!container.current) return;

        import('3d-force-graph').then(({ default: ForceGraph3D }) => {
            fetch('/nodes.json')
                .then(res => res.json())
                .then(data => {
                    const Graph = ForceGraph3D()(container.current);
                    Graph.showNavInfo(false);
                    Graph.graphData(data)
                        .backgroundColor('#0000')
                        .nodeColor(() => '#cccccc')
                        .nodeRelSize(5)
                        .linkColor(() => '#999999')
                        .linkWidth(1.5)
                        .linkDirectionalParticles(0)
                        .d3Force('charge').strength(-15)
                        .d3VelocityDecay(1)
                        .d3AlphaDecay(1)
                        .cameraPosition({ x: 0, y: 0, z: 2500 });
                })
        })
    }, []);

    return (
        <div
            ref={container}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '-30px',
            }}
        />
    );
}
