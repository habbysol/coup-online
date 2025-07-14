import { Server as IOServer } from "socket.io";
import type { NextApiResponse } from "next";
import type { Socket } from "net";

// Extend the default socket type to include `.server.io`
type NextSocketWithIO = Socket & {
  server: {
    io?: IOServer;
  };
};

let io: IOServer | null = null;

export function getSocketServer(res: NextApiResponse & { socket: NextSocketWithIO }) {
    
  if (!res.socket.server.io) {

    const ioServer = new IOServer(res.socket.server as any, {
      path: "/api/socketio",
    });

    res.socket.server.io = ioServer;
    io = ioServer;

    ioServer.on("connection", (socket) => {

      console.log("🔌 New client connected:", socket.id);

      // More listeners can be added here
    });
  }
}
