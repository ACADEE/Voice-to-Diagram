# Voice-to-Diagram

A web application that converts voice descriptions into software architecture diagrams using OpenAI Realtime API, Tldraw, and Dagre layout engine.

## Features

- 🎤 **Voice Input**: Speak naturally to describe your architecture
- 🤖 **AI-Powered**: OpenAI Realtime API with streaming audio and function calling
- 📊 **Auto Layout**: Dagre automatically arranges your diagrams
- 🎨 **Interactive Canvas**: Tldraw provides a rich editing experience
- 🔄 **Conversational Updates**: Add, remove, or rename components naturally
- 💾 **Export Options**: Save as PNG, SVG, or JSON
- 🔐 **Secure API Keys**: Keys stored locally in browser localStorage

## Architecture

```
User Voice → Microphone → WebSocket Relay → OpenAI Realtime API
                                ↓
                        Function Call (generate_diagram)
                                ↓
                        Dagre Layout Engine
                                ↓
                        Tldraw Canvas Rendering
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Diagram**: Tldraw (canvas), Dagre (layout)
- **AI/Voice**: OpenAI Realtime API, Web Audio API
- **Server**: Node.js WebSocket relay (ws library)

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key with Realtime API access
- Modern browser with microphone access

## Installation

1. **Clone the repository**
   ```bash
   cd Voice-to-Diagram
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Running the Application

You need to run **two servers** simultaneously:

### Option 1: Run both servers together (recommended)

```bash
npm run dev:all
```

This starts:
- Next.js frontend on `http://localhost:3000`
- WebSocket relay on `ws://localhost:8080`

### Option 2: Run servers separately

**Terminal 1 - Next.js Frontend:**
```bash
npm run dev
```

**Terminal 2 - WebSocket Relay:**
```bash
npm run relay
```

## Usage

1. **Open the application**
   - Navigate to `http://localhost:3000`

2. **Set your OpenAI API Key**
   - Click "Set OpenAI API Key" button in the top toolbar
   - Enter your API key (format: `sk-proj-...`)
   - Click "Save" (stored in localStorage)

3. **Test the diagram feature**
   - Click "Add Test Diagram" to see a sample architecture
   - This demonstrates the Dagre layout and Tldraw rendering

4. **Connect to voice mode**
   - Click "Connect" to establish WebSocket connection
   - Status indicator will turn green when connected

5. **Start speaking**
   - Click "🎤 Start Recording"
   - Speak your architecture description
   - Example: "Create a web application with a React frontend, API gateway, two microservices for auth and users, a PostgreSQL database, and a message queue"

6. **Watch the magic**
   - The AI transcribes your speech
   - Calls the `generate_diagram` function
   - Dagre computes optimal layout
   - Tldraw renders the diagram automatically

7. **Make updates conversationally**
   - "Add a Redis cache"
   - "Remove the message queue"
   - "Rename the API gateway to Load Balancer"
   - "Connect the auth service to the cache"

8. **Export your diagram**
   - Click "PNG" for raster image
   - Click "SVG" for vector graphics
   - Click "JSON" for diagram data

## Node Types

The system recognizes these node types:

| Type | Description | Color |
|------|-------------|-------|
| `service` | Microservice/backend service | Blue |
| `database` | Database systems | Green |
| `queue` | Message queues | Orange |
| `api` | API gateways/endpoints | Violet |
| `frontend` | Frontend applications | Pink |
| `external` | External services | Gray |
| `generic` | Generic components | Light Blue |

## Project Structure

```
Voice-to-Diagram/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Main page
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   └── api/
│       └── realtime/        # API route placeholder
├── components/              # React components
│   ├── DiagramCanvas.tsx   # Main Tldraw canvas
│   ├── VoiceControls.tsx   # Voice recording & WebSocket
│   ├── ApiKeyInput.tsx     # API key management
│   └── ExportControls.tsx  # Export functionality
├── lib/                     # Utility functions
│   └── layout.ts           # Dagre layout engine
├── types/                   # TypeScript types
│   └── diagram.ts          # Diagram type definitions
├── server/                  # Standalone servers
│   └── realtime.ts         # WebSocket relay server
└── package.json            # Dependencies & scripts
```

## How It Works

### 1. Voice Capture

The `VoiceControls` component uses Web Audio API to:
- Capture microphone input at 24kHz
- Convert Float32 audio to PCM16 format
- Stream audio chunks to WebSocket

### 2. WebSocket Relay

The relay server (`server/realtime.ts`):
- Proxies WebSocket connections to OpenAI
- Injects the `generate_diagram` tool definition
- Keeps API keys secure (never sent to browser)
- Forwards messages bidirectionally

### 3. OpenAI Realtime API

The AI assistant:
- Transcribes speech using Whisper
- Understands architecture descriptions
- Calls `generate_diagram` function with structured JSON
- Returns only nodes and edges (NO coordinates)

### 4. Dagre Layout

The `getAutoLayout` function:
- Receives abstract graph (nodes + edges)
- Computes optimal X/Y coordinates
- Applies spacing and alignment rules
- Returns positioned graph

### 5. Tldraw Rendering

The `DiagramCanvas` component:
- Creates shapes in Tldraw store
- Wraps updates in batch transactions (undo-safe)
- Binds arrows to shapes automatically
- Applies color coding based on node types

## Tool Definition

The AI uses this function schema:

```typescript
{
  name: "generate_diagram",
  description: "Create or update a software architecture diagram",
  parameters: {
    mode: "create" | "update",
    nodes: [
      { id: string, label: string, type: NodeType, group?: string }
    ],
    edges: [
      { id: string, from: string, to: string, label?: string }
    ]
  }
}
```

## Key Design Decisions

### ✅ No Coordinate Hallucination
- AI generates **logical structure only**
- Dagre computes all coordinates
- Prevents layout inconsistencies

### ✅ Undo-Safe Updates
- All diagram changes wrapped in `editor.batch()`
- Preserves Tldraw's undo/redo stack
- User can revert AI changes

### ✅ Secure API Keys
- Keys never sent to browser directly
- Relay server handles OpenAI authentication
- localStorage used for browser-side storage

### ✅ Conversational Mode
- AI maintains context across turns
- Supports incremental updates
- Natural language modifications

## Environment Variables

The application uses browser localStorage for the API key. No `.env` file needed.

To set the API key programmatically:
```javascript
localStorage.setItem('openai_api_key', 'sk-proj-...')
```

## Troubleshooting

### "Connection error" when clicking Connect
- Ensure the relay server is running (`npm run relay`)
- Check that port 8080 is not in use
- Verify your API key is valid

### "Microphone access denied"
- Grant microphone permissions in browser
- Check browser console for errors
- Try HTTPS if on remote server

### Diagram not appearing
- Check browser console for errors
- Verify graph validation passed
- Ensure nodes have valid types
- Check that edges reference existing node IDs

### WebSocket connection fails
- Confirm both servers are running
- Check firewall settings
- Verify API key format (starts with `sk-`)

## Development

### Adding New Node Types

1. Update `DiagramNodeType` in `types/diagram.ts`
2. Add styling to `NODE_STYLES`
3. Update tool description in `server/realtime.ts`

### Customizing Layout

Modify `getAutoLayout` in `lib/layout.ts`:
- Change `rankdir` for different flow directions
- Adjust `nodesep` and `ranksep` for spacing
- Add custom layout algorithms

### Extending Function Calls

Add more AI tools in `server/realtime.ts`:
- Define new function schemas
- Handle in `handleFunctionCall` in `VoiceControls.tsx`
- Update UI accordingly

## Performance

- **Latency**: ~500ms-2s from speech to diagram
- **Audio streaming**: Real-time with 4096 sample buffer
- **WebSocket**: Binary frames for efficiency
- **Dagre**: O(n²) layout computation (fast for <100 nodes)

## Limitations

- Requires OpenAI Realtime API access (beta)
- Microphone required for voice input
- WebSocket relay must be self-hosted
- Browser must support Web Audio API

## Future Enhancements

- [ ] Support for grouped/clustered diagrams
- [ ] Multiple diagram tabs/pages
- [ ] Collaborative editing
- [ ] Custom node shapes
- [ ] AI-suggested architecture improvements
- [ ] Export to Mermaid/PlantUML formats
- [ ] Voice commands for canvas control (zoom, pan)

## License

MIT

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Tldraw](https://tldraw.com/)
- [Dagre](https://github.com/dagrejs/dagre)
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)

---

**Happy diagramming! 🎨🎤**
