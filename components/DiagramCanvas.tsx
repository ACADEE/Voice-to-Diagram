"use client";

import { useEffect, useRef, useState } from "react";
import { Tldraw, Editor, TLShape, createShapeId } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import {
  DiagramGraph,
  PositionedGraph,
  PositionedNode,
  NODE_STYLES,
} from "@/types/diagram";
import { getAutoLayout, validateGraph } from "@/lib/layout";
import ApiKeyInput from "./ApiKeyInput";
import VoiceControls from "./VoiceControls";
import ExportControls from "./ExportControls";

export default function DiagramCanvas() {
  const editorRef = useRef<Editor | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [currentGraph, setCurrentGraph] = useState<DiagramGraph | null>(null);

  // Handle editor mount
  const handleMount = (editor: Editor) => {
    editorRef.current = editor;
    console.log("Tldraw editor mounted");
  };

  // Inject diagram into Tldraw
  const injectDiagram = (graph: DiagramGraph) => {
    if (!editorRef.current) {
      console.error("Editor not ready");
      return;
    }

    // Validate graph
    const validation = validateGraph(graph);
    if (!validation.valid) {
      console.error("Invalid graph:", validation.errors);
      return;
    }

    // Compute layout
    const positionedGraph = getAutoLayout(graph);
    setCurrentGraph(graph);

    // Inject into Tldraw with undo-safe transaction
    renderDiagram(positionedGraph);
  };

  // Render diagram in Tldraw
  const renderDiagram = (graph: PositionedGraph) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Clear existing shapes (optional - comment out to preserve)
    // editor.deleteShapes(editor.getCurrentPageShapeIds());

    // Prepare all shapes to create
    const shapesToCreate: any[] = [];
    const nodeShapeMap = new Map<string, string>();

    // Prepare node shapes
    graph.nodes.forEach((node: PositionedNode) => {
      const shapeId = createShapeId();
      nodeShapeMap.set(node.id, shapeId);

      const style = NODE_STYLES[node.type];

      // Create the geo shape (rectangle)
      shapesToCreate.push({
        id: shapeId,
        type: "geo",
        x: node.x - style.width / 2,
        y: node.y - style.height / 2,
        props: {
          geo: "rectangle",
          w: style.width,
          h: style.height,
          color: getColorFromHex(style.fill),
          fill: "solid",
          size: "m",
        },
      });

      // Create a text shape for the label
      const textId = createShapeId();
      shapesToCreate.push({
        id: textId,
        type: "text",
        x: node.x - style.width / 2 + 10,
        y: node.y - 10,
        props: {
          text: node.label,
          size: "m",
          color: "black",
          w: style.width - 20,
          autoSize: false,
          textAlign: "middle",
        },
      });
    });

    // Prepare arrow shapes for edges
    graph.edges.forEach((edge) => {
      const fromShapeId = nodeShapeMap.get(edge.from);
      const toShapeId = nodeShapeMap.get(edge.to);

      if (!fromShapeId || !toShapeId) {
        console.warn(`Missing shape for edge ${edge.id}`);
        return;
      }

      const arrowId = createShapeId();

      shapesToCreate.push({
        id: arrowId,
        type: "arrow",
        x: 0,
        y: 0,
        props: {
          start: {
            type: "binding",
            boundShapeId: fromShapeId,
            normalizedAnchor: { x: 0.5, y: 0.5 },
            isExact: false,
          },
          end: {
            type: "binding",
            boundShapeId: toShapeId,
            normalizedAnchor: { x: 0.5, y: 0.5 },
            isExact: false,
          },
          text: edge.label || "",
          arrowheadEnd: edge.direction === "bi" ? "arrow" : "arrow",
          arrowheadStart: edge.direction === "bi" ? "arrow" : "none",
        },
      });
    });

    // Create all shapes at once (undo-safe)
    editor.createShapes(shapesToCreate);

    // Zoom to fit after a short delay to ensure shapes are rendered
    setTimeout(() => {
      editor.zoomToFit({ animation: { duration: 300 } });
    }, 100);
  };

  // Helper to convert hex color to Tldraw color
  const getColorFromHex = (hex: string): string => {
    const colorMap: Record<string, string> = {
      "#3b82f6": "blue",
      "#10b981": "green",
      "#f59e0b": "orange",
      "#8b5cf6": "violet",
      "#ec4899": "red",
      "#6b7280": "grey",
      "#60a5fa": "light-blue",
    };
    return colorMap[hex] || "blue";
  };

  // Test function to add sample shapes
  const addTestShapes = () => {
    const testGraph: DiagramGraph = {
      nodes: [
        { id: "api", label: "API Gateway", type: "api" },
        { id: "service1", label: "Auth Service", type: "service" },
        { id: "service2", label: "User Service", type: "service" },
        { id: "db1", label: "PostgreSQL", type: "database" },
        { id: "queue", label: "Message Queue", type: "queue" },
        { id: "frontend", label: "React App", type: "frontend" },
      ],
      edges: [
        { id: "e1", from: "frontend", to: "api", label: "HTTPS" },
        { id: "e2", from: "api", to: "service1" },
        { id: "e3", from: "api", to: "service2" },
        { id: "e4", from: "service1", to: "db1" },
        { id: "e5", from: "service2", to: "db1" },
        { id: "e6", from: "service2", to: "queue" },
      ],
    };

    injectDiagram(testGraph);
  };

  // Handle diagram updates from voice
  const handleDiagramUpdate = (graph: DiagramGraph) => {
    injectDiagram(graph);
  };

  return (
    <div className="relative w-full h-screen flex flex-col">
      {/* Top toolbar */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Voice-to-Diagram</h1>
          <button
            onClick={addTestShapes}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
          >
            Add Test Diagram
          </button>
        </div>

        <div className="flex items-center gap-4">
          <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} />
          <VoiceControls
            apiKey={apiKey}
            onDiagramUpdate={handleDiagramUpdate}
          />
          <ExportControls editor={editorRef.current} />
        </div>
      </div>

      {/* Tldraw canvas */}
      <div className="flex-1 relative">
        <Tldraw onMount={handleMount} />
      </div>
    </div>
  );
}
