import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime";
const MODEL = "gpt-4o-realtime-preview-2024-12-17";
const PORT = 8080;

// Tool definition for generate_diagram
const GENERATE_DIAGRAM_TOOL = {
  type: "function",
  name: "generate_diagram",
  description:
    "Create or update a software architecture diagram as a graph. Do NOT generate coordinates. Only provide nodes and edges.",
  parameters: {
    type: "object",
    properties: {
      mode: {
        type: "string",
        enum: ["create", "update"],
        description:
          "Whether to create a new diagram or modify the existing one",
      },
      nodes: {
        type: "array",
        description: "List of nodes in the diagram",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the node",
            },
            label: {
              type: "string",
              description: "Display name for the node",
            },
            type: {
              type: "string",
              enum: [
                "service",
                "database",
                "queue",
                "api",
                "frontend",
                "external",
                "generic",
              ],
              description: "Type of the node",
            },
            group: {
              type: "string",
              description: "Optional group/cluster name",
            },
          },
          required: ["id", "label", "type"],
        },
      },
      edges: {
        type: "array",
        description: "List of connections between nodes",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the edge",
            },
            from: {
              type: "string",
              description: "Source node ID",
            },
            to: {
              type: "string",
              description: "Target node ID",
            },
            label: {
              type: "string",
              description: "Optional label for the connection",
            },
            direction: {
              type: "string",
              enum: ["uni", "bi"],
              description: "Direction of the connection",
            },
          },
          required: ["id", "from", "to"],
        },
      },
    },
    required: ["mode", "nodes", "edges"],
  },
};

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OpenAI Realtime WebSocket Relay Server\n");
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

console.log(`WebSocket relay server starting on port ${PORT}...`);

wss.on("connection", (clientWs: WebSocket, req: http.IncomingMessage) => {
  console.log("Client connected");

  // Extract API key from query string
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const apiKey = url.searchParams.get("api_key");

  if (!apiKey) {
    console.error("No API key provided");
    clientWs.close(1008, "API key required");
    return;
  }

  // Connect to OpenAI Realtime API
  const openaiWs = new WebSocket(`${OPENAI_REALTIME_URL}?model=${MODEL}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Beta": "realtime=v1",
    },
  });

  let isOpenAIConnected = false;

  openaiWs.on("open", () => {
    console.log("Connected to OpenAI Realtime API");
    isOpenAIConnected = true;

    // Send session update with tool definition
    const sessionUpdate = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        instructions:
          "You are a helpful assistant that creates software architecture diagrams. " +
          "When the user describes a system, use the generate_diagram function to create a structured graph representation. " +
          "Do NOT generate coordinates - only provide nodes and edges. " +
          "Support conversational updates like 'add a database', 'remove the queue', 'rename the API service'. " +
          "Always use the generate_diagram function to visualize the architecture.",
        voice: "alloy",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1",
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
        tools: [GENERATE_DIAGRAM_TOOL],
        tool_choice: "auto",
        temperature: 0.8,
      },
    };

    openaiWs.send(JSON.stringify(sessionUpdate));
    console.log("Session configured with generate_diagram tool");
  });

  openaiWs.on("message", (data: Buffer) => {
    // Forward OpenAI messages to client
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });

  openaiWs.on("error", (error: Error) => {
    console.error("OpenAI WebSocket error:", error);
    clientWs.close(1011, "OpenAI connection error");
  });

  openaiWs.on("close", (code: number, reason: Buffer) => {
    console.log(`OpenAI disconnected: ${code} ${reason.toString()}`);
    clientWs.close(code, reason.toString());
  });

  // Forward client messages to OpenAI
  clientWs.on("message", (data: Buffer) => {
    if (isOpenAIConnected && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(data);
    }
  });

  clientWs.on("close", () => {
    console.log("Client disconnected");
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
  });

  clientWs.on("error", (error: Error) => {
    console.error("Client WebSocket error:", error);
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
  });
});

server.listen(PORT, () => {
  console.log(`✓ WebSocket relay server running on http://localhost:${PORT}`);
  console.log(
    `  Connect with: ws://localhost:${PORT}?api_key=YOUR_OPENAI_API_KEY`
  );
});
