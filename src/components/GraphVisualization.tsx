import React, { useEffect, useRef, useState } from 'react';
import { Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { GraphData, GraphNode, GraphEdge, graphService } from '../services/graphService';

interface Props {
  graphData: GraphData;
  width?: number;
  height?: number;
}

export function GraphVisualization({ graphData, width = 800, height = 600 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    drawGraph();
  }, [graphData, zoom, pan, hoveredNode]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    drawEdges(ctx, graphData.edges, graphData.nodes);
    drawNodes(ctx, graphData.nodes);

    ctx.restore();
  };

  const drawEdges = (ctx: CanvasRenderingContext2D, edges: GraphEdge[], nodes: GraphNode[]) => {
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);

      if (source && target && source.x !== undefined && source.y !== undefined &&
          target.x !== undefined && target.y !== undefined) {

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (edge.type === 'cross-protocol') {
          ctx.strokeStyle = '#6b7280';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
        } else {
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
        }

        ctx.stroke();

        if (edge.label) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;

          ctx.fillStyle = '#1f2937';
          ctx.font = '10px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          const textWidth = ctx.measureText(edge.label).width;
          ctx.fillRect(midX - textWidth/2 - 3, midY - 8, textWidth + 6, 16);

          ctx.fillStyle = '#64748b';
          ctx.fillText(edge.label, midX, midY);
        }

        drawArrow(ctx, source.x, source.y, target.x, target.y);
      }
    });

    ctx.setLineDash([]);
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 10;
    const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
    const nodeRadius = 30;

    const endX = toX - nodeRadius * Math.cos(angle);
    const endY = toY - nodeRadius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - Math.PI / 6),
      endY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + Math.PI / 6),
      endY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();
  };

  const drawNodes = (ctx: CanvasRenderingContext2D, nodes: GraphNode[]) => {
    nodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) return;

      const isHovered = hoveredNode === node.id;
      const radius = node.type === 'protocol' ? 35 : 25;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + (isHovered ? 3 : 0), 0, 2 * Math.PI);
      ctx.fillStyle = node.color || '#6b7280';
      ctx.fill();

      if (isHovered) {
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = node.type === 'protocol' ? 'bold 11px system-ui' : '10px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const maxWidth = radius * 1.8;
      const labelText = node.label ? String(node.label) : 'Unknown';
      const words = labelText.split(' ');
      let lines: string[] = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);

      if (lines.length > 2) {
        lines = [lines[0], lines[1].substring(0, 8) + '...'];
      }

      const lineHeight = 12;
      const startY = node.y - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, node.x, startY + index * lineHeight);
      });
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const clickedNode = graphData.nodes.find(node => {
      if (node.x === undefined || node.y === undefined) return false;
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      const radius = node.type === 'protocol' ? 35 : 25;
      return distance <= radius;
    });

    if (clickedNode) {
      console.log('Clicked node:', clickedNode);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const hoveredNode = graphData.nodes.find(node => {
      if (node.x === undefined || node.y === undefined) return false;
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      const radius = node.type === 'protocol' ? 35 : 25;
      return distance <= radius;
    });

    setHoveredNode(hoveredNode?.id || null);

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleExport = () => {
    const dot = graphService.exportGraphAsDOT(graphData);
    const blob = new Blob([dot], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `protocol-graph-${Date.now()}.dot`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden transition-colors">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white dark:bg-dark-hover border border-slate-200 dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-dark-surface transition-colors shadow-sm"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-slate-700 dark:text-dark-text" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white dark:bg-dark-hover border border-slate-200 dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-dark-surface transition-colors shadow-sm"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-slate-700 dark:text-dark-text" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white dark:bg-dark-hover border border-slate-200 dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-dark-surface transition-colors shadow-sm"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4 text-slate-700 dark:text-dark-text" />
        </button>
        <button
          onClick={handleExport}
          className="p-2 bg-white dark:bg-dark-hover border border-slate-200 dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-dark-surface transition-colors shadow-sm"
          title="Export as DOT"
        >
          <Download className="w-4 h-4 text-slate-700 dark:text-dark-text" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">Protocol Relationship Graph</h3>
            <p className="text-sm text-slate-600 dark:text-dark-muted">
              {graphData.nodes.length} nodes, {graphData.edges.length} connections
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-dark-muted">
            Drag to pan • Scroll to zoom
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="border border-slate-200 dark:border-dark-border rounded-lg cursor-move bg-slate-50 dark:bg-dark-bg transition-colors"
          style={{ width: '100%', maxWidth: width }}
        />

        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-600 dark:text-dark-muted">Human Context</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-600 dark:text-dark-muted">Business Context</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-slate-600 dark:text-dark-muted">Machine Context</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-slate-600 dark:text-dark-muted">Data Context</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-600 dark:text-dark-muted">Test Context</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-slate-400" style={{ width: '20px', borderTop: '2px dashed' }}></div>
            <span className="text-slate-600 dark:text-dark-muted">Cross-protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
}
