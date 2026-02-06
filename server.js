require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const app = require('./app');
const connectDB = require("./config/db");

connectDB();

// MongoDB Connection
mongoose.connect(process.env.MONGODB)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// HTTP Server
const server = http.createServer(app);

// WebSocket Server for live data
const wss = new WebSocket.Server({ server });

// Broadcast helper function
wss.broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Listen for connections
wss.on('connection', (ws) => {
  console.log('🔵 WebSocket client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
    // Optionally broadcast received message to all clients
    wss.broadcast({ type: 'update', message });
  });

  ws.on('close', () => console.log('🔴 WebSocket client disconnected'));
});

// 🕒 Emit live data every 2 seconds
setInterval(() => {
  const data = {
    type: 'liveUpdate',
    timestamp: new Date().toISOString(),
    message: 'Server heartbeat - live data',
  };
  wss.broadcast(data);
}, 2000);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

// Export WebSocket server for controllers if needed
module.exports = { server, wss };
