import { io } from "socket.io-client";

export function initializeSocket() {
  const socket = io("http://localhost:5000", {
    withCredentials: true,
  });

  return socket;
}
