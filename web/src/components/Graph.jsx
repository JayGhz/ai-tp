import { useEffect, useRef, useCallback } from 'react';

export default function Graph() {
    const container = useRef(null);
    const graphRef = useRef(null);

    const updateGraphDimensions = useCallback(() => {
        if (graphRef.current) {
            graphRef.current.width(window.innerWidth);
            graphRef.current.height(window.innerHeight);
        }
    }, []);

    useEffect(() => {
        if (!container.current) return;

        import('3d-force-graph').then(({ default: ForceGraph3D }) => {
            fetch('/nodes.json')
                .then(res => res.json())
                .then(data => {
                    const Graph = ForceGraph3D()(container.current);
                    graphRef.current = Graph;
                    
                    Graph.showNavInfo(false);
                    Graph.graphData(data)
                        .backgroundColor('#0000')
                        .nodeColor(() => '#cccccc')
                        .nodeRelSize(5)
                        .linkColor(() => '#999999')
                        .linkWidth(1.5)
                        .linkDirectionalParticles(0)
                        .d3Force('charge').strength(-10)
                        .d3VelocityDecay(1)
                        .d3AlphaDecay(1)
                        .cameraPosition({ x: 0, y: 0, z: 2500 });
                    
                    updateGraphDimensions();
                })
        })
    }, [updateGraphDimensions]);

    useEffect(() => {
        window.addEventListener('resize', updateGraphDimensions);
        return () => window.removeEventListener('resize', updateGraphDimensions);
    }, [updateGraphDimensions]);

    return (
        <div
            ref={container}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'visible',
                maxWidth: 'none'
            }}
        />
    );
}
