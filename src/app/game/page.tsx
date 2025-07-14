"use client";

import { useEffect, useState } from 'react';
import { useSocket } from "./hooks/useSocket";

export default function GamePage() {
  const socket = useSocket();
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !socket.connected) return;

    console.log("✅ Connected to server:", socket.id);

    if (socket.id) {
    setSocketId(socket.id);
  }

    socket.on("player-joined", (data) => {
      console.log("🎉 Player joined:", data);
    });

    return () => {
      socket.off("player-joined");
    };
  }, [socket]);

  return (
    <div className="text-white p-4">
      <h1 className="text-2xl font-bold">Coup Online</h1>
      <p>{socketId ? `Connected to server: ${socketId}` : "Connecting..."}</p>
    </div>
  );
}
