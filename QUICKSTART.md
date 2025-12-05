# Quick Start Guide

## 🚀 Get Started in 3 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Both Servers
```bash
npm run dev:all
```

This starts:
- **Frontend**: http://localhost:3000
- **WebSocket Relay**: ws://localhost:8080

### 3. Open Browser
Navigate to: http://localhost:3000

### 4. Set API Key
- Click **"Set OpenAI API Key"**
- Paste your key (get one at https://platform.openai.com/api-keys)
- Click **"Save"**

### 5. Test the Diagram
Click **"Add Test Diagram"** to see a sample architecture

### 6. Try Voice Mode
1. Click **"Connect"** (status turns green)
2. Click **"🎤 Start Recording"**
3. Say: *"Create a web app with React frontend, Node.js backend, and PostgreSQL database"*
4. Watch your diagram appear! ✨

## 🎯 Example Voice Commands

**Create a diagram:**
> "Create a microservices architecture with an API gateway, auth service, user service, PostgreSQL database, and Redis cache. Connect the frontend to the gateway, gateway to both services, and services to the database."

**Update existing diagram:**
> "Add a message queue"
> "Connect the user service to the queue"
> "Remove the Redis cache"
> "Rename the auth service to authentication service"

## 📤 Export Your Diagram

Click **PNG**, **SVG**, or **JSON** in the top toolbar

## ⚠️ Troubleshooting

**Can't connect?**
- Ensure both servers are running (`npm run dev:all`)
- Check that port 8080 is available

**No microphone?**
- Grant browser permissions
- Check browser console for errors

**Need help?**
See the full [README.md](./README.md) for detailed documentation.

---

**That's it! Happy diagramming! 🎨**
