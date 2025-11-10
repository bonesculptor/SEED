interface Protocol {
  id: number;
  protocol_type: string;
  metadata: any;
  content: any;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'protocol' | 'entity' | 'relationship';
  protocolType?: string;
  x?: number;
  y?: number;
  color?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export class GraphService {
  private protocols: Protocol[] = [];

  setProtocols(protocols: Protocol[]) {
    this.protocols = protocols;
  }

  generateProtocolGraph(): GraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    this.protocols.forEach((protocol, index) => {
      const nodeId = `protocol-${protocol.protocol_type}-${protocol.id}`;

      nodes.push({
        id: nodeId,
        label: protocol.metadata?.name || `${protocol.protocol_type.toUpperCase()} #${protocol.id}`,
        type: 'protocol',
        protocolType: protocol.protocol_type,
        color: this.getProtocolColor(protocol.protocol_type)
      });

      if (protocol.protocol_type === 'hcp' && protocol.content?.identity) {
        const identityNodeId = `identity-${protocol.id}`;
        nodes.push({
          id: identityNodeId,
          label: protocol.content.identity.name || 'Person',
          type: 'entity',
          color: '#60a5fa'
        });
        edges.push({
          id: `${nodeId}-identity`,
          source: nodeId,
          target: identityNodeId,
          label: 'has identity',
          type: 'relationship'
        });
      }

      if (protocol.protocol_type === 'bcp' && protocol.content?.customer_segments) {
        protocol.content.customer_segments.forEach((segment: string, idx: number) => {
          const segmentNodeId = `segment-${protocol.id}-${idx}`;
          nodes.push({
            id: segmentNodeId,
            label: segment,
            type: 'entity',
            color: '#34d399'
          });
          edges.push({
            id: `${nodeId}-segment-${idx}`,
            source: nodeId,
            target: segmentNodeId,
            label: 'serves',
            type: 'relationship'
          });
        });
      }

      if (protocol.protocol_type === 'mcp' && protocol.content?.capabilities) {
        protocol.content.capabilities.slice(0, 3).forEach((capability: string, idx: number) => {
          const capNodeId = `capability-${protocol.id}-${idx}`;
          nodes.push({
            id: capNodeId,
            label: capability,
            type: 'entity',
            color: '#a78bfa'
          });
          edges.push({
            id: `${nodeId}-cap-${idx}`,
            source: nodeId,
            target: capNodeId,
            label: 'has capability',
            type: 'relationship'
          });
        });
      }

      if (protocol.protocol_type === 'dcp' && protocol.content?.data_sources) {
        protocol.content.data_sources.forEach((source: any, idx: number) => {
          const sourceNodeId = `datasource-${protocol.id}-${idx}`;
          nodes.push({
            id: sourceNodeId,
            label: source.type || `Source ${idx + 1}`,
            type: 'entity',
            color: '#fb923c'
          });
          edges.push({
            id: `${nodeId}-source-${idx}`,
            source: nodeId,
            target: sourceNodeId,
            label: 'uses data from',
            type: 'relationship'
          });
        });
      }

      if (protocol.protocol_type === 'tcp' && protocol.content?.test_cases) {
        const testCount = protocol.content.test_cases.length;
        const testNodeId = `tests-${protocol.id}`;
        nodes.push({
          id: testNodeId,
          label: `${testCount} Test Cases`,
          type: 'entity',
          color: '#f87171'
        });
        edges.push({
          id: `${nodeId}-tests`,
          source: nodeId,
          target: testNodeId,
          label: 'includes',
          type: 'relationship'
        });
      }
    });

    this.detectCrossProtocolRelationships(edges);

    return { nodes, edges };
  }

  private detectCrossProtocolRelationships(edges: GraphEdge[]) {
    const hcpProtocols = this.protocols.filter(p => p.protocol_type === 'hcp');
    const bcpProtocols = this.protocols.filter(p => p.protocol_type === 'bcp');
    const mcpProtocols = this.protocols.filter(p => p.protocol_type === 'mcp');
    const dcpProtocols = this.protocols.filter(p => p.protocol_type === 'dcp');
    const tcpProtocols = this.protocols.filter(p => p.protocol_type === 'tcp');

    hcpProtocols.forEach(hcp => {
      bcpProtocols.forEach(bcp => {
        if (this.areRelated(hcp, bcp)) {
          edges.push({
            id: `hcp-${hcp.id}-bcp-${bcp.id}`,
            source: `protocol-hcp-${hcp.id}`,
            target: `protocol-bcp-${bcp.id}`,
            label: 'participates in',
            type: 'cross-protocol'
          });
        }
      });

      mcpProtocols.forEach(mcp => {
        edges.push({
          id: `hcp-${hcp.id}-mcp-${mcp.id}`,
          source: `protocol-hcp-${hcp.id}`,
          target: `protocol-mcp-${mcp.id}`,
          label: 'delegates to',
          type: 'cross-protocol'
        });
      });
    });

    bcpProtocols.forEach(bcp => {
      dcpProtocols.forEach(dcp => {
        edges.push({
          id: `bcp-${bcp.id}-dcp-${dcp.id}`,
          source: `protocol-bcp-${bcp.id}`,
          target: `protocol-dcp-${dcp.id}`,
          label: 'consumes data',
          type: 'cross-protocol'
        });
      });
    });

    mcpProtocols.forEach(mcp => {
      tcpProtocols.forEach(tcp => {
        edges.push({
          id: `mcp-${mcp.id}-tcp-${tcp.id}`,
          source: `protocol-mcp-${mcp.id}`,
          target: `protocol-tcp-${tcp.id}`,
          label: 'validated by',
          type: 'cross-protocol'
        });
      });

      dcpProtocols.forEach(dcp => {
        edges.push({
          id: `mcp-${mcp.id}-dcp-${dcp.id}`,
          source: `protocol-mcp-${mcp.id}`,
          target: `protocol-dcp-${dcp.id}`,
          label: 'processes',
          type: 'cross-protocol'
        });
      });
    });
  }

  private areRelated(protocol1: Protocol, protocol2: Protocol): boolean {
    return true;
  }

  private getProtocolColor(type: string): string {
    const colors: Record<string, string> = {
      'hcp': '#3b82f6',
      'bcp': '#10b981',
      'mcp': '#8b5cf6',
      'dcp': '#f59e0b',
      'tcp': '#ef4444'
    };
    return colors[type] || '#6b7280';
  }

  calculateLayout(graphData: GraphData, width: number, height: number): GraphData {
    const { nodes, edges } = graphData;

    const protocolNodes = nodes.filter(n => n.type === 'protocol');
    const entityNodes = nodes.filter(n => n.type === 'entity');

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    protocolNodes.forEach((node, index) => {
      const angle = (index / protocolNodes.length) * 2 * Math.PI;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    entityNodes.forEach((node) => {
      const sourceEdge = edges.find(e => e.target === node.id);
      if (sourceEdge) {
        const sourceNode = nodes.find(n => n.id === sourceEdge.source);
        if (sourceNode && sourceNode.x !== undefined && sourceNode.y !== undefined) {
          const offset = Math.random() * 100 + 50;
          const angle = Math.random() * 2 * Math.PI;
          node.x = sourceNode.x + offset * Math.cos(angle);
          node.y = sourceNode.y + offset * Math.sin(angle);
        }
      }
    });

    return { nodes, edges };
  }

  exportGraphAsDOT(graphData: GraphData): string {
    let dot = 'digraph ProtocolGraph {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    graphData.nodes.forEach(node => {
      const color = node.color || '#cccccc';
      dot += `  "${node.id}" [label="${node.label}", fillcolor="${color}", style=filled];\n`;
    });

    dot += '\n';

    graphData.edges.forEach(edge => {
      const label = edge.label ? ` [label="${edge.label}"]` : '';
      dot += `  "${edge.source}" -> "${edge.target}"${label};\n`;
    });

    dot += '}\n';
    return dot;
  }
}

export const graphService = new GraphService();
