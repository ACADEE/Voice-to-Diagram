"use client";

import { Editor } from "@tldraw/tldraw";
import { useState } from "react";

interface ExportControlsProps {
  editor: Editor | null;
}

export default function ExportControls({ editor }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPNG = async () => {
    if (!editor) return;

    setIsExporting(true);
    try {
      const shapeIds = editor.getCurrentPageShapeIds();
      if (shapeIds.size === 0) {
        alert("No shapes to export");
        return;
      }

      const blob = await editor.getSvgString(Array.from(shapeIds), {
        background: true,
        darkMode: false,
        padding: 40,
      });

      if (!blob) {
        throw new Error("Failed to generate SVG");
      }

      // Convert SVG to PNG using canvas
      const img = new Image();
      const svgBlob = new Blob([blob.svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = blob.width * 2; // 2x for better quality
        canvas.height = blob.height * 2;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              const link = document.createElement("a");
              link.href = URL.createObjectURL(pngBlob);
              link.download = `diagram-${Date.now()}.png`;
              link.click();
            }
          });
        }

        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export PNG");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToSVG = async () => {
    if (!editor) return;

    setIsExporting(true);
    try {
      const shapeIds = editor.getCurrentPageShapeIds();
      if (shapeIds.size === 0) {
        alert("No shapes to export");
        return;
      }

      const svg = await editor.getSvgString(Array.from(shapeIds), {
        background: true,
        darkMode: false,
        padding: 40,
      });

      if (!svg) {
        throw new Error("Failed to generate SVG");
      }

      const blob = new Blob([svg.svg], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `diagram-${Date.now()}.svg`;
      link.click();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export SVG");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    if (!editor) return;

    setIsExporting(true);
    try {
      const shapes = Array.from(editor.getCurrentPageShapeIds()).map((id) =>
        editor.getShape(id)
      );

      const data = {
        timestamp: new Date().toISOString(),
        shapes: shapes,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `diagram-${Date.now()}.json`;
      link.click();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export JSON");
    } finally {
      setIsExporting(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">Export:</span>
      <button
        onClick={exportToPNG}
        disabled={isExporting}
        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-sm"
      >
        PNG
      </button>
      <button
        onClick={exportToSVG}
        disabled={isExporting}
        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-sm"
      >
        SVG
      </button>
      <button
        onClick={exportToJSON}
        disabled={isExporting}
        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-sm"
      >
        JSON
      </button>
    </div>
  );
}
