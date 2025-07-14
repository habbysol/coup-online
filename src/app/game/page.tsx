"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./hooks/useSocket";

export default function GamePage() {
  const socket = useSocket();
  const [socketId, setSocketId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [roomJoined, setRoomJoined] = useState(false);

  useEffect(() => {
    if (!socket || !socket.connected) return;

    console.log("✅ Connected to server:", socket.id);

    if (socket.id) {
      setSocketId(socket.id);

      //socket.emit("create-room");

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

    socket.on("joined-room", ({ roomId }) => {
      console.log("✅ Joined room:", roomId);
      setRoomId(roomId);
      setRoomJoined(true);
      setJoinMessage(`Successfully joined room: ${roomId}`);
    });

    socket.on("error", ({ message }) => {
      console.warn("❌ Error:", message);
      setJoinMessage(`Error: ${message}`);
    });

    socket.on("room-players", ({ players }) => {
      console.log("🧑‍🤝‍🧑 Players in room:", players);
      setPlayers(players);
    });

    socket.on("room-created", ({ roomId }) => {
      console.log("📦 Room created with ID:", roomId);
      setRoomId(roomId);
      setRoomJoined(true); // ✅ trigger UI display of room ID and player list
    });

    return () => {
      socket.off("player-joined");
      socket.off("room-players");
      socket.off("room-created");
      socket.off("joined-room");
      socket.off("error");
    };
  }, [socket]);

  console.log("🧪 roomId:", roomId);
  console.log("🧪 players:", players);

  return (
    //Create Room Button and Room Code Display
    <div className="text-white p-4">
      <h1 className="text-2xl font-bold">Coup Online</h1>
      <p>{socketId ? `Connected to server: ${socketId}` : "Connecting..."}</p>
      <button
        onClick={() => socket?.emit("create-room")}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Create Room
      </button>
      {roomJoined && roomId && (
        <p className="mt-2 text-lg text-yellow-300">✅ Room Code: {roomId}</p>
      )}

      {/* Input for joining a room */}
      <div className="mt-8">
        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomCodeInput}
          onChange={(e) => {
            const value = e.target.value
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "")
              .slice(0, 6);
            setRoomCodeInput(value);
          }}
          className="p-2 border border-gray-400 rounded text-white bg-gray-800"
        />

        <button
          onClick={() => socket?.emit("join-room", { roomId: roomCodeInput })}
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Join Room
        </button>

        {joinMessage && (
          <p className="mt-2 text-sm text-yellow-300">{joinMessage}</p>
        )}

        {/* List Players that are in the room */}
      </div>
      {roomId && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Players in Room:</h2>
          {players.length > 0 ? (
            <ul className="list-disc ml-6 mt-2">
              {players.map((playerId) => (
                <li key={playerId} className="text-sm text-white">
                  {playerId}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-300">Waiting for players...</p>
          )}
        </div>
      )}
    </div>
  );
}
