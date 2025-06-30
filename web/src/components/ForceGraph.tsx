import { useEffect, useRef, useCallback, useState } from 'react';
import ForceGraph3D from '3d-force-graph';
import * as d3 from 'd3-force-3d';

export interface Node {
    id: string | number;
    name?: string;
    val?: number;
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

export interface ForceGraphInstance {
    width: (px?: number) => ForceGraphInstance;
    height: (px?: number) => ForceGraphInstance;
    showNavInfo: (show: boolean) => ForceGraphInstance;
    graphData: (data: GraphData) => ForceGraphInstance;
    backgroundColor: (color: string) => ForceGraphInstance;
    nodeColor: (color: string | ((node: Node) => string)) => ForceGraphInstance;
    nodeRelSize: (size: number) => ForceGraphInstance;
    linkColor: (color: string | ((link: Link) => string)) => ForceGraphInstance;
    linkWidth: (width: number) => ForceGraphInstance;
    linkDirectionalParticles: (num: number) => ForceGraphInstance;
    d3Force: (forceName: string, force?: any) => ForceGraphInstance;
    d3VelocityDecay: (decay: number) => ForceGraphInstance;
    d3AlphaDecay: (decay: number) => ForceGraphInstance;
    cameraPosition: (
        position?: { x?: number; y?: number; z?: number },
        lookAt?: { x: number; y: number; z: number },
        ms?: number
    ) => ForceGraphInstance;
}

export interface ForceGraphProps {
    graphData?: GraphData;
    width?: number;
    height?: number;
    showNavInfo?: boolean;
    backgroundColor?: string;
    nodeColor?: string | ((node: Node) => string);
    nodeRelSize?: number;
    linkColor?: string | ((link: Link) => string);
    linkWidth?: number;
    linkDirectionalParticles?: number;
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
    nodeColor = () => '#cccccc',
    nodeRelSize = 6,
    linkColor = () => '#999999',
    linkWidth = 1.25,
    linkDirectionalParticles = 0,
    d3ChargeStrength = -15,
    d3VelocityDecay = 0.4,
    d3AlphaDecay = 0.07,
    cameraPosition = { x: 0, y: 2000, z: 100 },
    cameraLookAt,
    cameraTransitionMs = 0,
    containerStyle,
}: ForceGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<ForceGraphInstance | null>(null);
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
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data: GraphData) => {
                    setInternalGraphData(data);
                    setLoadingInternalData(false);
                })
                .catch(err => {
                    setInternalError(`Error al cargar datos por defecto: ${err.message}`);
                    console.error("Error fetching default graph data:", err);
                    setLoadingInternalData(false);
                });
        }

        try {
            const Graph = new (ForceGraph3D as any)(container) as ForceGraphInstance;
            graphRef.current = Graph;

            Graph.showNavInfo(showNavInfo)
                .backgroundColor(backgroundColor)
                .nodeColor(nodeColor)
                .nodeRelSize(nodeRelSize)
                .linkColor(linkColor)
                .linkWidth(linkWidth)
                .linkDirectionalParticles(linkDirectionalParticles)
                .d3Force('charge', d3.forceManyBody().strength(d3ChargeStrength))
                .d3VelocityDecay(d3VelocityDecay)
                .d3AlphaDecay(d3AlphaDecay);


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
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }
            }
        };
    }, [
        graphData, // Se re-ejecuta si la prop graphData cambia
        showNavInfo, backgroundColor, nodeColor, nodeRelSize, linkColor, linkWidth,
        linkDirectionalParticles, d3ChargeStrength, d3VelocityDecay, d3AlphaDecay,
        cameraPosition, cameraLookAt, cameraTransitionMs, updateGraphDimensions,
        internalGraphData, loadingInternalData, internalError // Dependencias para la carga interna
    ]);

    // Efecto separado para actualizar graphData cuando currentGraphData cambia DESPUÉS de la inicialización
    useEffect(() => {
        if (graphRef.current && currentGraphData) {
            graphRef.current.graphData(currentGraphData);
        }
    }, [currentGraphData]); // Solo se ejecuta si los datos activos cambian

    useEffect(() => {
        window.addEventListener('resize', updateGraphDimensions);
        return () => window.removeEventListener('resize', updateGraphDimensions);
    }, [updateGraphDimensions]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                top: `${window.innerHeight * 0.46}px`, // Makes top position responsive to screen height
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'visible',
                maxWidth: 'none',
                ...containerStyle,
            }}
        />
    );
}