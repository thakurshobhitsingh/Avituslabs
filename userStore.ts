import { create } from 'zustand';
import { fetchTasks } from './userauth';

type UserData = {
  id: number;
  username: string;
  referralCode: string;
  referredBy: string;
  points: number;
  createdAt: string;
  customUsername?: string;
  twitterUsername?: string;
  discordUsername?: string;

};

type ReferData = {
    referralCount: number,
    referralPoints: number
}
type UserState = {
  userData: UserData | null;
  referData: ReferData | null;
  setUserData: (data: UserData) => void;
  setReferalData: (data: ReferData) => void;
  clearReferalData: () => void;
  clearUserData: () => void;
  referralCode: string;
  setReferralCode: (code: string) => void;
};

export const useUserStore = create<UserState>((set) => ({
  userData: null,
  referData:null,
  setReferalData: (data) => set({referData: data}),
  setUserData: (data) => set({ userData: data }),
  clearReferalData: () => set({referData: null}),
  clearUserData: () => set({ userData: null }),
  referralCode: "", // 🌱 NEW: default empty
  setReferralCode: (code) => set({ referralCode: code }), // 🌱 NEW: setter
}));


export type Submission = {
  id: number;
  questType: string;
  link: string;
  status: boolean;
  submittedAt: string;
  pointsAwarded: number | null;
};
type TaskStore = {
  tasks: Submission[];
  fetchTasksFromServer: (username: string) => Promise<void>;
  clearTasks: () => void;
};
export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  fetchTasksFromServer: async (username) => {
    const data = await fetchTasks(username);
    set({ tasks: data.all || [] });
  },
  clearTasks: () => set({ tasks: [] }),
}));

type PlayersOnlineStore = {
  playersOnline: { [key: string]: number };
  setPlayersOnline: (players: { [key: string]: number }) => void;
};
export const usePlayersOnlineStore = create<PlayersOnlineStore>((set) => ({
  playersOnline: {
    'crash': 0 
  },
  setPlayersOnline: (players) => set({ playersOnline: players }),
}));

type isTaskStore = {
  isTaskStore: boolean;
  setIsTaskStore: (isTaskStore: boolean) => void;
};
export const useIsTaskStore = create<isTaskStore>((set) => ({
  isTaskStore: false,
  setIsTaskStore: (isTaskStore) => set({ isTaskStore }),
}));