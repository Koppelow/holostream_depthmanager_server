// signaling-server.js
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import url from "url";

const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

let clients = new Map(); // Map of id → socket
let nextId = 1;

server.on("upgrade", (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;
  if (pathname === "/depthmanager") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws) => {
  const id = `client-${nextId++}`;
  clients.set(id, ws);
  console.log(`Client connected: ${id}`);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`[${id}]`, data.type);

      // Basic relay logic:
      // Unity sends offer → Python gets it
      // Python sends answer → Unity gets it
      for (const [peerId, peerWs] of clients.entries()) {
        if (peerId !== id && peerWs.readyState === WebSocket.OPEN) {
          peerWs.send(message);
        }
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  });

  ws.on("close", () => {
    console.log(`Client disconnected: ${id}`);
    clients.delete(id);
  });
});

const PORT = 9999;
server.listen(PORT, () => {
  console.log(`✅ Signaling server running at ws://localhost:${PORT}/depthmanager`);
});
