import { io, Socket } from "socket.io-client";

const socket: Socket = io("wss://porback.avituslabs.xyz/");
// const socket: Socket = io("http://localhost:3000/");

export const onCrashUpdate = (cb: (data: { multiplier: string, st: string, ct: string}) => void) => {
  socket.on("crash:update", cb);
};

export const onCrashNewGame = (cb: () => void) => {
  socket.on("crash:newGame", cb);
};

export const onCrashStart = (cb: () => void) => {
  socket.on("crash:start", cb);
};

export const onCrash = (cb: () => void) => {
  socket.on("crash:crash", cb);
};

export const onPlayersOnline = (cb: (data: { key: string, count: string }) => void) => {
  socket.on("players:online", cb);
};

export const onCashoutSuccess = (cb: (data: { username: string,userId: number; reward: number; cashedOutAt: number }) => void) => {
  socket.on("crash:cashoutSuccess", cb);
};
export const crashMultiplier = (cb: (data: { crashPoint: number }) => void) => {
  socket.on("crash:crash", (data) => {
    // Log data to verify it's coming in correctly
    // console.log("Received crash data:", data);
    cb(data);
  });
};

export const emitPlaceBet = (payload: {
  userId: number;
  username: string;
  amount: number;
  autoCashout?: number;
}) => {
  socket.emit("crash:placeBet", payload);
};

export const emitCashout = (userId: number) => {
  socket.emit("crash:cashout", { userId });
};

export const initializeCrashSocket = (userId: number) => {
  socket.emit("crash:join", { userId });
};

// Cleanup
export const cleanupCrashSocket = () => {
  socket.off("crash:update");
  socket.off("crash:newGame");
  socket.off("crash:start");
  socket.off("crash:crash");
  socket.off("crash:cashoutSuccess");
};

export const cleanPlayerOnline = () => {
    socket.off("players:online");
}
export const cleanCrashData = () =>{
  socket.off("crash:crash");
}
export const cleanCashout = () =>{
  socket.off("crash:cashoutSuccess");
}