// Type definitions for diagram nodes, edges, and graphs

export type DiagramNodeType =
  | "service"
  | "database"
  | "queue"
  | "api"
  | "frontend"
  | "external"
  | "generic";

export interface DiagramNode {
  id: string;
  label: string;
  type: DiagramNodeType;
  group?: string;
  metadata?: Record<string, any>;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  direction?: "uni" | "bi";
}

export interface DiagramGraph {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface PositionedNode extends DiagramNode {
  x: number;
  y: number;
}

export interface PositionedGraph {
  nodes: PositionedNode[];
  edges: DiagramEdge[];
}

// OpenAI Realtime function call types
export interface GenerateDiagramParams {
  mode: "create" | "update";
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface RealtimeFunctionCall {
  type: "function_call";
  name: string;
  call_id: string;
  arguments: string; // JSON stringified GenerateDiagramParams
}

// Node styling based on type
export interface NodeStyle {
  fill: string;
  stroke: string;
  width: number;
  height: number;
}

export const NODE_STYLES: Record<DiagramNodeType, NodeStyle> = {
  service: {
    fill: "#3b82f6",
    stroke: "#1e40af",
    width: 160,
    height: 80,
  },
  database: {
    fill: "#10b981",
    stroke: "#047857",
    width: 140,
    height: 100,
  },
  queue: {
    fill: "#f59e0b",
    stroke: "#d97706",
    width: 140,
    height: 70,
  },
  api: {
    fill: "#8b5cf6",
    stroke: "#6d28d9",
    width: 160,
    height: 80,
  },
  frontend: {
    fill: "#ec4899",
    stroke: "#be185d",
    width: 160,
    height: 80,
  },
  external: {
    fill: "#6b7280",
    stroke: "#374151",
    width: 140,
    height: 70,
  },
  generic: {
    fill: "#60a5fa",
    stroke: "#2563eb",
    width: 140,
    height: 70,
  },
};
