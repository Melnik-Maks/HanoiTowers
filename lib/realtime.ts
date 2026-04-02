import type { Server as SocketIOServer } from "socket.io";

declare global {
  var __tournamentIO: SocketIOServer | undefined;
}

export function getSocketServer() {
  return global.__tournamentIO;
}

export function emitTournamentUpdate(
  tournamentId: string,
  event: string,
  payload: Record<string, unknown>,
) {
  const io = getSocketServer();
  if (!io) {
    return;
  }

  io.to(`tournament:${tournamentId}`).emit(event, payload);
}
