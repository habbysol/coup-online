import { Server as IOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket } from 'net';

type NextSocketWithIO = Socket & {
  server: HTTPServer & {
    io?: IOServer;
  };
};

let io: IOServer | null = null;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const socket = res.socket as NextSocketWithIO;

  if (!socket.server.io) {
    console.log('🚀 Initializing new Socket.IO server...');
    io = new IOServer(socket.server, {
      path: '/api/socketio',
    });

    socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('⚡🔌 Client connected:', socket.id);

      socket.emit('player-joined', { playerId: socket.id });
    });
  } else {
    console.log('✅ Socket.IO already running');
  }

  res.end();
}
