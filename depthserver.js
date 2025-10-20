// secure-signaling-server.js
import https from "https";
import fs from "fs";
import WebSocket, { WebSocketServer } from "ws";

const server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/fullchain.pem'),
});

const wss = new WebSocketServer({ server, path: "/depthmanager" });

wss.on("connection", ws => {
  console.log("New secure connection");
  ws.on("message", msg => {
    // Relay messages to other clients
    for (const client of wss.clients)
      if (client !== ws && client.readyState === WebSocket.OPEN)
        client.send(msg);
  });
});

server.listen(3006, () => {
  console.log("✅ Secure WSS server running on port 9999");
});
