import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface GraphNode {
  id: string;
  type: string;
  label: string;
  data: any;
  level: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  metadata?: any;
}

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
}

interface PositionedNode extends GraphNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export default function GalaxyGraphView({ nodes, edges, onNodeClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [positionedNodes, setPositionedNodes] = useState<PositionedNode[]>([]);
  const animationRef = useRef<number>();

  const getNodeColor = (type: string): string => {
    const colors: Record<string, string> = {
      patient: '#3b82f6',
      practitioner: '#8b5cf6',
      encounter: '#10b981',
      condition: '#ef4444',
      medication: '#f97316',
      procedure: '#06b6d4',
      observation: '#14b8a6',
      document: '#64748b'
    };
    return colors[type] || '#94a3b8';
  };

  useEffect(() => {
    if (nodes.length === 0) return;

    const positioned: PositionedNode[] = nodes.map((node, idx) => {
      const levelRadius = node.level * 80;
      const nodesInLevel = nodes.filter(n => n.level === node.level).length;
      const angleStep = (Math.PI * 2) / Math.max(nodesInLevel, 1);
      const nodeIndexInLevel = nodes.filter(n => n.level === node.level).indexOf(node);
      const angle = nodeIndexInLevel * angleStep;

      const heightVariation = (Math.random() - 0.5) * 50;

      return {
        ...node,
        x: Math.cos(angle) * levelRadius,
        y: Math.sin(angle) * levelRadius,
        z: (node.level - 4) * 40 + heightVariation,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.2
      };
    });

    setPositionedNodes(positioned);
  }, [nodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || positionedNodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const animate = () => {
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradientBg = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width / 2);
      gradientBg.addColorStop(0, 'rgba(59, 130, 246, 0.05)');
      gradientBg.addColorStop(0.5, 'rgba(139, 92, 246, 0.03)');
      gradientBg.addColorStop(1, 'rgba(10, 14, 26, 0)');
      ctx.fillStyle = gradientBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const updatedNodes = positionedNodes.map(node => {
        let newX = node.x + node.vx;
        let newY = node.y + node.vy;
        let newZ = node.z + node.vz;
        let newVx = node.vx;
        let newVy = node.vy;
        let newVz = node.vz;

        const distance = Math.sqrt(newX * newX + newY * newY + newZ * newZ);
        const targetDistance = node.level * 80;

        if (distance > targetDistance + 20 || distance < targetDistance - 20) {
          const pullStrength = 0.02;
          const pullX = -newX * pullStrength;
          const pullY = -newY * pullStrength;
          const pullZ = -newZ * pullStrength;

          newVx += pullX;
          newVy += pullY;
          newVz += pullZ;
        }

        newVx *= 0.98;
        newVy *= 0.98;
        newVz *= 0.98;

        return { ...node, x: newX, y: newY, z: newZ, vx: newVx, vy: newVy, vz: newVz };
      });

      setPositionedNodes(updatedNodes);

      edges.forEach(edge => {
        const sourceNode = updatedNodes.find(n => n.id === edge.source);
        const targetNode = updatedNodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
          const source3D = project3D(sourceNode, centerX, centerY);
          const target3D = project3D(targetNode, centerX, centerY);

          ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(source3D.x, source3D.y);
          ctx.lineTo(target3D.x, target3D.y);
          ctx.stroke();
        }
      });

      const sortedNodes = [...updatedNodes].sort((a, b) => {
        const aRot = rotate3D(a);
        const bRot = rotate3D(b);
        return aRot.z - bRot.z;
      });

      sortedNodes.forEach(node => {
        const rotated = rotate3D(node);
        const projected = project3D({ ...node, x: rotated.x, y: rotated.y, z: rotated.z }, centerX, centerY);

        const scale = projected.scale;
        const radius = 8 * scale * zoom;

        const color = getNodeColor(node.type);

        const gradient = ctx.createRadialGradient(
          projected.x, projected.y, 0,
          projected.x, projected.y, radius
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.7, color + 'dd');
        gradient.addColorStop(1, color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (scale > 0.5 && node.label) {
          const fontSize = Math.max(10, 12 * scale * zoom);
          ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';

          const label = String(node.label).replace(/([A-Z])/g, ' $1').trim().slice(0, 40);

          ctx.strokeStyle = 'rgba(10, 14, 26, 0.9)';
          ctx.lineWidth = 4;
          ctx.strokeText(label, projected.x, projected.y + radius + 16 * scale);

          ctx.fillStyle = 'rgba(255, 255, 255, 1)';
          ctx.fillText(label, projected.x, projected.y + radius + 16 * scale);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [positionedNodes, rotation, zoom, edges]);

  const rotate3D = (node: { x: number; y: number; z: number }) => {
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);

    let y = node.y * cosX - node.z * sinX;
    let z = node.y * sinX + node.z * cosX;

    let x = node.x * cosY + z * sinY;
    z = -node.x * sinY + z * cosY;

    return { x, y, z };
  };

  const project3D = (
    node: { x: number; y: number; z: number },
    centerX: number,
    centerY: number
  ) => {
    const perspective = 600;
    const scale = perspective / (perspective + node.z);

    return {
      x: centerX + node.x * scale * zoom,
      y: centerY + node.y * scale * zoom,
      scale
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;

    setRotation(prev => ({
      x: prev.x + dy * 0.005,
      y: prev.y + dx * 0.005
    }));

    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;

    for (const node of positionedNodes) {
      const rotated = rotate3D(node);
      const projected = project3D({ ...node, x: rotated.x, y: rotated.y, z: rotated.z }, centerX, centerY);
      const radius = 8 * projected.scale * zoom;

      const distance = Math.sqrt((x - projected.x) ** 2 + (y - projected.y) ** 2);

      if (distance < radius * 1.5) {
        onNodeClick?.(node);
        break;
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isFullscreen]);

  return (
    <div className={`relative bg-slate-900 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[600px]'}`}>
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
          className="p-2 bg-slate-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-slate-700 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.3, prev * 0.8))}
          className="p-2 bg-slate-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-slate-700 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setRotation({ x: 0, y: 0 }); setZoom(1); }}
          className="p-2 bg-slate-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-slate-700 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-slate-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-slate-700 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 text-white text-xs">
        <div className="font-semibold mb-2">Controls:</div>
        <div>Drag to rotate</div>
        <div>Scroll to zoom</div>
        <div>Click nodes for details</div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      />

      {positionedNodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          No graph data available
        </div>
      )}
    </div>
  );
}
