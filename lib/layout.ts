import dagre from "dagre";
import {
  DiagramGraph,
  DiagramNode,
  DiagramEdge,
  PositionedGraph,
  PositionedNode,
  NODE_STYLES,
} from "@/types/diagram";

/**
 * Computes automatic layout for a graph using Dagre
 * @param graph - The abstract graph with nodes and edges
 * @returns PositionedGraph with computed x, y coordinates
 */
export function getAutoLayout(graph: DiagramGraph): PositionedGraph {
  // Create a new directed graph
  const g = new dagre.graphlib.Graph();

  // Set graph options
  g.setGraph({
    rankdir: "TB", // Top to bottom
    align: "UL", // Upper left alignment
    nodesep: 80, // Horizontal separation between nodes
    ranksep: 100, // Vertical separation between ranks
    marginx: 40,
    marginy: 40,
  });

  // Default edge config
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  graph.nodes.forEach((node) => {
    const style = NODE_STYLES[node.type];
    g.setNode(node.id, {
      label: node.label,
      width: style.width,
      height: style.height,
    });
  });

  // Add edges to the graph
  graph.edges.forEach((edge) => {
    g.setEdge(edge.from, edge.to, {
      label: edge.label || "",
    });
  });

  // Run the layout algorithm
  dagre.layout(g);

  // Extract positioned nodes
  const positionedNodes: PositionedNode[] = graph.nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      x: nodeWithPosition.x,
      y: nodeWithPosition.y,
    };
  });

  return {
    nodes: positionedNodes,
    edges: graph.edges,
  };
}

/**
 * Validates that all edge references point to existing nodes
 */
export function validateGraph(graph: DiagramGraph): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const nodeIds = new Set(graph.nodes.map((n) => n.id));

  graph.edges.forEach((edge) => {
    if (!nodeIds.has(edge.from)) {
      errors.push(`Edge ${edge.id}: 'from' node ${edge.from} does not exist`);
    }
    if (!nodeIds.has(edge.to)) {
      errors.push(`Edge ${edge.id}: 'to' node ${edge.to} does not exist`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
