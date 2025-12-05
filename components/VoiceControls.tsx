"use client";

import { useState, useRef, useEffect } from "react";
import { DiagramGraph, GenerateDiagramParams } from "@/types/diagram";

interface VoiceControlsProps {
  apiKey: string;
  onDiagramUpdate: (graph: DiagramGraph) => void;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export default function VoiceControls({
  apiKey,
  onDiagramUpdate,
}: VoiceControlsProps) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Connect to WebSocket relay
  const connect = async () => {
    if (!apiKey) {
      setError("Please set your OpenAI API key first");
      return;
    }

    try {
      setStatus("connecting");
      setError("");

      const ws = new WebSocket(`ws://localhost:8080?api_key=${apiKey}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to relay server");
        setStatus("connected");
      };

      ws.onmessage = async (event) => {
        try {
          let data = event.data;

          // Handle Blob data (convert to text first)
          if (data instanceof Blob) {
            data = await data.text();
          }

          const message = JSON.parse(data);
          handleRealtimeMessage(message);
        } catch (err) {
          console.error("Failed to parse message:", err, "Data:", event.data);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("Connection error - check console");
        setStatus("error");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        if (event.code === 1006) {
          setError("Connection lost - abnormal closure");
        } else if (event.code === 1008) {
          setError("Policy violation - check API key");
        } else if (event.reason) {
          setError(`Disconnected: ${event.reason}`);
        }

        setStatus("disconnected");
        stopRecording();
      };
    } catch (err) {
      console.error("Connection failed:", err);
      setError("Failed to connect");
      setStatus("error");
    }
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopRecording();
    setStatus("disconnected");
    setTranscript("");
  };

  // Handle messages from OpenAI Realtime API
  const handleRealtimeMessage = (message: any) => {
    // Log ALL messages for debugging
    if (message.type !== "input_audio_buffer.speech_started" &&
        message.type !== "input_audio_buffer.speech_stopped") {
      console.log("📥 Realtime message:", message.type, message);
    }

    switch (message.type) {
      case "session.created":
      case "session.updated":
        console.log("✅ Session ready");
        break;

      case "conversation.item.input_audio_transcription.completed":
        // User's speech transcription
        console.log("📝 Transcription:", message.transcript);
        setTranscript((prev) => prev + " " + message.transcript);
        break;

      case "response.function_call_arguments.delta":
        // Function arguments streaming
        console.log("🔧 Function args delta:", message.delta);
        break;

      case "response.function_call_arguments.done":
        // Complete function call received
        console.log("✅ Function call done:", message.name);
        handleFunctionCall(message);
        break;

      case "response.done":
        console.log("✅ Response completed");
        break;

      case "error":
        console.error("❌ Realtime API error - Full message:", JSON.stringify(message, null, 2));
        console.error("❌ Error object:", message.error);
        console.error("❌ Error type:", typeof message.error);
        const errorMsg = message.error?.message || message.error?.type || message.error?.code || "Unknown error";
        setError(`API Error: ${errorMsg}`);
        break;

      default:
        // Log unknown message types
        if (!message.type.includes("audio")) {
          console.log("⚠️ Unknown message type:", message.type);
        }
    }
  };

  // Handle function calls from the AI
  const handleFunctionCall = (message: any) => {
    try {
      const callId = message.call_id;
      const functionName = message.name;
      const args = message.arguments;

      console.log("Function call:", functionName, args);

      if (functionName === "generate_diagram") {
        const params: GenerateDiagramParams = JSON.parse(args);
        console.log("Generating diagram:", params);

        // Create graph from params
        const graph: DiagramGraph = {
          nodes: params.nodes,
          edges: params.edges,
        };

        // Update the diagram
        onDiagramUpdate(graph);

        // Send function result back to AI
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const response = {
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: callId,
              output: JSON.stringify({
                success: true,
                message: "Diagram updated successfully",
              }),
            },
          };
          wsRef.current.send(JSON.stringify(response));

          // Trigger a response
          wsRef.current.send(
            JSON.stringify({
              type: "response.create",
            })
          );
        }
      }
    } catch (err) {
      console.error("Failed to handle function call:", err);
      setError("Failed to process diagram");
    }
  };

  // Start recording microphone
  const startRecording = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("WebSocket not connected");
      return;
    }

    try {
      console.log("Requesting microphone access...");

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("Microphone access granted");
      mediaStreamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      // Create processor for PCM16 audio (buffer size 2048 for better performance)
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      let isProcessing = false;

      processor.onaudioprocess = (e) => {
        // Prevent overlapping processing
        if (isProcessing) return;

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          isProcessing = true;

          try {
            const inputData = e.inputBuffer.getChannelData(0);

            // Convert Float32 to Int16 (PCM16)
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }

            // Send audio to Realtime API
            const audioMessage = {
              type: "input_audio_buffer.append",
              audio: arrayBufferToBase64(pcm16.buffer),
            };

            wsRef.current.send(JSON.stringify(audioMessage));
          } catch (err) {
            console.error("Error processing audio:", err);
          } finally {
            isProcessing = false;
          }
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
      console.log("Recording started successfully");
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError(`Microphone error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
    console.log("Recording stopped");
  };

  // Convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Status color
  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-sm text-gray-300 capitalize">{status}</span>
      </div>

      {/* Connect/Disconnect button */}
      {status === "disconnected" || status === "error" ? (
        <button
          onClick={connect}
          disabled={!apiKey}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-sm font-medium"
        >
          Connect
        </button>
      ) : (
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium"
        >
          Disconnect
        </button>
      )}

      {/* Recording button */}
      {status === "connected" && (
        <button
          onClick={toggleRecording}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            isRecording
              ? "bg-red-600 hover:bg-red-700 animate-pulse"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isRecording ? "🎤 Recording..." : "🎤 Start Recording"}
        </button>
      )}

      {/* Error display */}
      {error && (
        <div className="text-sm text-red-400 max-w-xs truncate">{error}</div>
      )}

      {/* Transcript display */}
      {transcript && (
        <div className="text-sm text-gray-300 max-w-md truncate">
          {transcript}
        </div>
      )}
    </div>
  );
}
