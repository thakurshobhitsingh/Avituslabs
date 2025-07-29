import { onPlayersOnline, cleanPlayerOnline } from './socket';
import { usePlayersOnlineStore } from './userStore';

// let socketPlayerCount: number = 0;

const handleSocketPlayerCount = ({key, count}: {key: string, count: string}) => {
  // console.log("key:", key, "counts:", count);
  const countNum = parseInt(count);
  if (!isNaN(countNum)) {
    // socketPlayerCount = countNum;
    const { playersOnline, setPlayersOnline } = usePlayersOnlineStore.getState();
    setPlayersOnline({
      ...playersOnline,
      [key]: 300 + countNum
    });
  } else {
    const { playersOnline, setPlayersOnline } = usePlayersOnlineStore.getState();
    const updatedPlayersOnline = { ...playersOnline };
    // console.log("updatedPlayersOnline:", updatedPlayersOnline);
    
    Object.entries(playersOnline).forEach(([k, v]) => {
      if (v === 0) {
        updatedPlayersOnline[k] = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
      }
    });
    
    setPlayersOnline(updatedPlayersOnline);
  }
};

export const initializePlayerCount = () => {
  onPlayersOnline(handleSocketPlayerCount);
};

export const cleanupPlayerCount = () => {
  cleanPlayerOnline();
  // socketPlayerCount = 0;
};