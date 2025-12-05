"use client";

import { useState, useEffect } from "react";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export default function ApiKeyInput({
  apiKey,
  onApiKeyChange,
}: ApiKeyInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState("");

  // Load API key from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("openai_api_key");
    if (saved) {
      onApiKeyChange(saved);
    }
  }, [onApiKeyChange]);

  const handleSave = () => {
    if (tempKey.trim()) {
      localStorage.setItem("openai_api_key", tempKey.trim());
      onApiKeyChange(tempKey.trim());
      setIsEditing(false);
      setTempKey("");
    }
  };

  const handleClear = () => {
    localStorage.removeItem("openai_api_key");
    onApiKeyChange("");
    setIsEditing(false);
    setTempKey("");
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return "••••••••";
    return key.substring(0, 7) + "..." + key.substring(key.length - 4);
  };

  if (!isEditing && apiKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-300">
          API Key: {maskApiKey(apiKey)}
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
        >
          Edit
        </button>
        <button
          onClick={handleClear}
          className="px-2 py-1 text-xs bg-red-700 hover:bg-red-600 rounded"
        >
          Clear
        </button>
      </div>
    );
  }

  if (!isEditing && !apiKey) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium"
      >
        Set OpenAI API Key
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="password"
        value={tempKey}
        onChange={(e) => setTempKey(e.target.value)}
        placeholder="sk-proj-..."
        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm w-64 focus:outline-none focus:border-blue-500"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") {
            setIsEditing(false);
            setTempKey("");
          }
        }}
        autoFocus
      />
      <button
        onClick={handleSave}
        disabled={!tempKey.trim()}
        className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm"
      >
        Save
      </button>
      <button
        onClick={() => {
          setIsEditing(false);
          setTempKey("");
        }}
        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
      >
        Cancel
      </button>
    </div>
  );
}
