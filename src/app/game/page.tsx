"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./hooks/useSocket";

export default function GamePage() {
  const socket = useSocket();
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !socket.connected) return;

    console.log("✅ Connected to server:", socket.id);

    if (socket.id) {
      setSocketId(socket.id);

      socket.emit("create-room");

      //Uncomment to expose socket globally for debugging (in DevTools console)
      //socket.emit("join-room", { roomId: "grab from DevTools" });
      //(window as any).socket = socket;
    }

    // TEMP: Test joining a hardcoded room from browser console
    // Uncomment and replace ROOM_ID_HERE to test
    //socket.emit("join-room", { roomId: "B07AU0" });

    socket.on("player-joined", (data) => {
      console.log("🎉 Player joined:", data);
    });

    socket.on("joined-room", (data) => {
      console.log("✅ Joined room:", data.roomId);
    });

    socket.on("room-created", (data) => {
      console.log("📦 Room created with ID:", data.roomId);
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
