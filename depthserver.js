import fs from "fs";
import https from "https";
import WebSocket from "ws";

const server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/fullchain.pem'),
});

const wss = new WebSocket.Server({ server, path: "/depthmanager" });

wss.on("connection", ws => {
  console.log("New secure connection");

  ws.on("message", msg => {
    for (const client of wss.clients)
      if (client !== ws && client.readyState === WebSocket.OPEN)
        client.send(msg);
  });

  ws.on("close", () => console.log("Client disconnected"));
});

server.listen(3006, () => {
  console.log("✅ Secure WSS server running on port 3006");
});
