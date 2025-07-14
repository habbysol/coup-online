import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket } from "net";

//Record to keep store rooms and their player IDs
const rooms: Record<string, string[]> = {};

type NextSocketWithIO = Socket & {
  server: HTTPServer & {
    io?: IOServer;
  };
};

let io: IOServer | null = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket as NextSocketWithIO;

  if (!socket.server.io) {
    console.log("🚀 Initializing new Socket.IO server...");
    io = new IOServer(socket.server, {
      path: "/api/socketio",
    });

    socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("create-room", () => {
        console.log(`🆕 Room creation requested by socket ${socket.id}`);

        //Generate unique room ID and add the socket to the room
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        socket.join(roomId);
        //Creates the room with this socket as the first player
        rooms[roomId] = [socket.id];

        const playersInRoom = rooms[roomId];
        io!.to(roomId).emit("room-players", { players: playersInRoom });
        console.log("📤 Emitting room-players:", playersInRoom);

        socket.emit("room-created", { roomId });
      });

      socket.on("join-room", ({ roomId }) => {
        console.log(`🔗 Socket ${socket.id} wants to join room ${roomId}`);

        // Check if the room exists
        if (!rooms[roomId]) {
          socket.emit("error", { message: "Room not found." });
          return;
        }

        // ✅ Check if the player is already in the room
        if (rooms[roomId].includes(socket.id)) {
          socket.emit("error", { message: "You're already in this room." });
          return;
        }

        // Join the room and update state
        socket.join(roomId);
        rooms[roomId].push(socket.id);

        // 1. Confirm to the player who just joined
        socket.emit("joined-room", { roomId });

        // 2. Notify others
        socket.to(roomId).emit("player-joined", { playerId: socket.id });

        // 3. Broadcast player list
        const playersInRoom = rooms[roomId];
        io!.to(roomId).emit("room-players", { players: playersInRoom });
      });

      console.log("⚡🔌 Client connected:", socket.id);

      socket.emit("player-joined", { playerId: socket.id });
    });
  } else {
    console.log("✅ Socket.IO already running");
  }

  res.end();
}
