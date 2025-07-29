import { usePrivy } from "@privy-io/react-auth";

const url = "https://porback.avituslabs.xyz";
// const url = "http://localhost:3000";

export const useIsUserConnected = () => {
  const { ready, authenticated, user } = usePrivy();

  return ready && authenticated && user !== null;
};
export async function updateUserSocial({
  userId,
  twitterUsername,
  discordUsername,
  customUsername,
}: {
  userId: number;
  twitterUsername?: string;
  discordUsername?: string;
  customUsername? : string;
}) {
  const response = await fetch(`${url}/user/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      twitterUsername,
      discordUsername,
      customUsername,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to update profile");

  return data;
}

export const checkUser = async (username: string) => {
  try {
    const response = await fetch(`${url}/user/userData`);
    const userDataList = await response.json();

    const existingUser = userDataList?.users?.find(
      (u: any) => u.username.toLowerCase() === username.toLowerCase()
    );

    const isNewUser = !existingUser;
    // console.log("isNewUser:", isNewUser);
    return isNewUser;
  } catch (err) {
    // console.error("Error checking user:", err);
    return false;
  }
};

export const userAuth = async ( token :string , username:string, referredBy?:string) =>{
    try{
        const payload: any = { username };
        if (referredBy) payload.referredBy = referredBy.toUpperCase();
        const response = await fetch(`${url}/auth/auth`,{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
            
        })
        const result = await response.json();
        // console.log("Backend sync result:", result);
        return result;
    } catch (error) {
        // console.error("❌ Backend sync failed:", error);
        return { success: false};
    }
};

export const userStats = async (username: string) =>{
    try{
        const response = await fetch(`${url}/user/stats/${username}`);
        const stats = await response.json();
        // console.log("data lelo");
        return stats;
    }catch(err){
        // console.log()
        return {success: false}
    }
}

export const fetchWeeklyStats = async ( username : string) => {
  try {
    if (!username) return;
    const res = await fetch(`${url}/stats/weekly/${username}`);
    const data = await res.json();
    const formatted = data.chartData.map((entry: any) => ({
      day: entry.day,
      points: entry.points,
    }));
    // setWeeklyData(formatted);
    return formatted;
  } catch (error) {
    // console.error("Failed to fetch weekly stats:", error);
  }
};
export const fetchTasks = async (username : string) => {
  const res = await fetch(`${url}/user/quests/${username}`);
  const data = await res.json();
  return data;
  // setTasks(data.all || []);
};
export const submitQuest = async (username: string, questType: string, link: string) => {
  const res = await fetch(`${url}/quest/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, questType, link }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Submission failed");
  }

  return data;
};



export async function fetchProgress(username: string) {
  if (!username) throw new Error("Username missing!");

  const response = await fetch(`${url}/stats/progress/${username}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to fetch progress");
  }

  const data = await response.json();
  return {
    displayedEligibility: parseFloat(data.displayedEligibility),
    completedTasks: parseInt(data.completedTasks),
  };
}