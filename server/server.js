
// import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from "cors";
import http from "http";
import { connectDB } from './lib/db.js';
import { Server } from 'socket.io';
import userRoutes from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';

const app = express();
const server = http.createServer(app);

// --- Socket.IO Setup ---
export const io = new Server(server, {
  cors: {
    origin: "*", // You can restrict this to your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

export const userSocketMap = {};

// Socket connection handler
// const userSocketMap = {}; // Move this to a higher scope if not already

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("🔌 User connected:", userId);

  if (userId) {
    // 🧠 If the user logs in from another tab/browser, this will override the old socket
    userSocketMap[userId] = socket.id;

    // 📡 Emit the updated list of online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // 📴 Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", userId);

    // 🔍 Only remove if this is the current socket for this user
    if (userId && userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});


// --- Middlewares ---
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// --- Test Route ---
app.get("/", (req, res) => {
  res.send("✅ Server is up. Use /api/status to check status.");
});

app.get("/api/status", (req, res) => {
  res.send("✅ Server is live");
});

// --- Routes ---
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRouter);

// --- Start Server ---
const startServer = async () => {
  try {
    await connectDB(); // MongoDB connection

    if(process.env.NODE_ENV !== "production")
    {
      const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
    }
  } catch (error) {
    console.error("❌ Error starting server:", error.message);
  }
};

startServer();

//for vercel
export default server;
