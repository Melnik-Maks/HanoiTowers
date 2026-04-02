"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function useTournamentSocket(tournamentId: string) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
    });

    socket.emit("tournament:join-room", tournamentId);
    const onUpdate = () => setTick((value) => value + 1);

    socket.on("tournament:updated", onUpdate);

    return () => {
      socket.off("tournament:updated", onUpdate);
      socket.disconnect();
    };
  }, [tournamentId]);

  return tick;
}
