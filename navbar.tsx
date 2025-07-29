import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef, useState } from "react";
import ReferralInput from "./inputreferal";
import {
  checkUser,
  updateUserSocial,
  userAuth,
  userStats,
} from "../helpers/userauth";
import { useTaskStore, useUserStore } from "@/helpers/userStore";
import useSWR from "swr";
import { useLocation, useNavigate } from "react-router-dom";

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

export const getPhotourl = (user: any) =>
  user?.twitter?.profilePictureUrl ??
  "https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d80db9971f10a9757c99_Symbol.svg";

export const getDisplayName = (user: any) => {
  const name =
    user?.twitter?.username ??
    user?.discord?.username ??
    (user?.wallet?.address
      ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
      : user?.email?.address);
  return name?.split("#")[0] ?? "User";
};
export const formatDisplayName = (name: string | undefined) => {
  if (!name) return null;
  return name.split("#")[0];
};
// const fetchPoints = async (username: string) => {
//   // Your logic for fetching points here
//   try {
//     const response = await userStats(username); // Example API call
//     console.log("fetching");
//     return response.user?.points;
//   } catch (error) {
//     console.error("Error fetching points:", error);
//     throw error; // SWR will handle the error appropriately
//   }
// };

export default function Navbar() {
  const { ready, authenticated, login, logout, user, getAccessToken } =
    usePrivy();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [userInfo, setUserInfo] = useState<{
    token: string;
    displayName: string;
  } | null>(null);
  const [hasHandledAuth, setHasHandledAuth] = useState(false);
    const location = useLocation();
  const navigate = useNavigate();
  // const storedReferralCode = useUserStore((state) => state.referralCode);
  // const [userData, setUserData] = useState<UserData | null>(null);
  // const userData = useUserStore((state) => state.userData);
  const clearTasks = useTaskStore((state) => state.clearTasks);
  const fetchPointsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // const [userpoints , setPoints] = useState<number | null>(null);
  const photourl = getPhotourl(user);
  const displayName = getDisplayName(user);

  const sendProfileInfo = async (currentUserData: UserData | null) => {
    const discordUsername = user?.discord?.username ?? "username";
    const twitterUsername = user?.twitter?.username ?? "username";
    const userId = currentUserData?.id;

    const shouldUpdateDiscord =
      discordUsername !== "username" && !currentUserData?.discordUsername;
    const shouldUpdateTwitter =
      twitterUsername !== "username" && !currentUserData?.twitterUsername;

    // console.log(displayName);
    if (userId && (shouldUpdateDiscord || shouldUpdateTwitter)) {
      try {
        await updateUserSocial({
          userId,
          discordUsername: shouldUpdateDiscord ? discordUsername : undefined,
          twitterUsername: shouldUpdateTwitter ? twitterUsername : undefined,
          customUsername: displayName,
        });
      } catch (err) {
        // console.error("Error updating social info:", err);
      }
    }
  };

  // const fetchStats = async () => {
  //   try {
  //     const response = await userStats(displayName);
  //     console.log("✅ Zustand store update from Navbar", response.user);
  //     if (response.user) {
  //       useUserStore.getState().setUserData(response.user);
  //       // setUserData(response.user);
  //       return response.user;
  //     }
  //   } catch (err) {
  //     console.error("⚠️ Error fetching user stats:", err);
  //   }
  //   return null;
  // };

  const runPostAuthLogic = async () => {
    const token = await getAccessToken();
    if (!token) return;

    const isNewUser = await checkUser(displayName);

    if (isNewUser) {
      setUserInfo({ token, displayName });
      setShowReferralModal(true);
      
      // Wait briefly to ensure Zustand is hydrated
      // setTimeout(async () => {
      //   const referral = useUserStore.getState().referralCode;
      //   // console.log("✅ Using referral after hydration:", referral);

      //   if (referral) {
      //     await userAuth(token, displayName, referral);
      //     const fetchedUser = await fetchStatsAndUpdateStore(displayName);
      //     await sendProfileInfo(fetchedUser);
      //   } else {
      //     // const fetchedUser = await fetchStatsAndUpdateStore(displayName);
      //     // await sendProfileInfo(fetchedUser);
      //   }
      // }, 100);
    } else{
      const fetchedUser = await fetchStatsAndUpdateStore(displayName);
      await sendProfileInfo(fetchedUser)
    }
  };

  const handleConnectClick = async () => {
    if (!ready) return;

    if (!authenticated) {
      try {
        await login();
      } catch (err) {
        // console.error('❌ Privy login failed:', err);
        // alert('Could not log in. Please try again.');
      }
    } else {
      runPostAuthLogic();
      setDropdownOpen((prev) => !prev);
    }
  };

  const handleReferralSubmit = async () => {
    if (!userInfo) return;
    const finalReferralCode = referralCode;
    await userAuth(userInfo.token, userInfo.displayName, finalReferralCode);
    setShowReferralModal(false);
    const fetchedUser = await fetchStatsAndUpdateStore(userInfo.displayName);
    await sendProfileInfo(fetchedUser);
  };

  const handleReferralSkip = async () => {
    if (!userInfo) return;
    await userAuth(userInfo.token, userInfo.displayName, undefined);
    setShowReferralModal(false);
    const fetchedUser = await fetchStatsAndUpdateStore(userInfo.displayName);
    await sendProfileInfo(fetchedUser);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    useUserStore.getState().clearUserData();
    useUserStore.getState().clearReferalData();
    // setUserData(null);
    // setPoints(0);
    clearTasks();
    if (fetchPointsIntervalRef.current) {
      clearInterval(fetchPointsIntervalRef.current);
      fetchPointsIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (authenticated && !hasHandledAuth) {
      runPostAuthLogic();
      setHasHandledAuth(true);
    }
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || !user) return;

    const name = getDisplayName(user);
    if (!name || name === "User") return;

    let cancelled = false;

    const fetchPoints = async () => {
      if (cancelled) return;
      try {
        const response = await userStats(name);
        if (cancelled) return;

        if (response.user) {
          useUserStore.getState().setUserData(response.user);
          // setUserData(response.user);
          // console.log("fetching");
          if (response.user.points !== undefined) {
            // setPoints(response.user.points);
          }
        }
      } catch (error) {
        if (!cancelled) {
          // console.error("⚠️ Error fetching points:", error);
        }
      }
    };

    fetchPoints();
    // fetchPointsIntervalRef.current = setInterval(fetchPoints, 3000);

    return () => {
      cancelled = true;
      if (fetchPointsIntervalRef.current) {
        clearInterval(fetchPointsIntervalRef.current);
        fetchPointsIntervalRef.current = null;
      }
    };
  }, [authenticated, user]);

  const fetchStatsAndUpdateStore = async (username: string) => {
    try {
      const response = await userStats(username);
      if (response.user) {
        useUserStore.getState().setUserData(response.user);
        useUserStore.getState().setReferalData(response.referralStats);
        // console.log("✅ SWR fetched + updated Zustand:", response.user.points);
        return response.user;
      }
      return null;
    } catch (err) {
      // console.error("⚠️ SWR fetch error:", err);
      throw err;
    }
  };

  const { data: userFromSWR } = useSWR(
    authenticated && user ? displayName : null,
    fetchStatsAndUpdateStore,
    {
      refreshInterval: 8000,
      revalidateOnFocus: false,
      refreshWhenHidden: false,
      refreshWhenOffline:false,
    }
  );

  const points = userFromSWR?.points ?? 0;
    const handleClick = () => {
    if (location.pathname === "/") {
      const el = document.querySelector("#submit-section");
      el?.scrollIntoView({ behavior: "smooth", block: "start"});
    } else {
      sessionStorage.setItem("scrollToSubmit", "true");
      navigate("/");
    }
  };
  return (
    <>
      <nav className="flex flex-row justify-between items-center px-6 py-4 bg-black fixed right-0 left-0 top-0 z-40">
        {/* Left: Logo */}
        <div className="flex items-center">
          {/* <span className="h-6 w-6">
            <img src="/assets/avitusLogo.svg" alt="Avitus Logo" />
          </span> */}
        </div>
        {/* Center: Points */}
          <div className="flex items-center justify-center space-x-2 bg-[#131312] p-2 rounded-md ">
            {/* Coin balance section */}
            <div className="flex items-center bg-[#1f1f1f] px-3 py-1.5 rounded-md">
              <img
                src="/assets/avituscoin.svg"
                alt="AVTS Coin"
                className="w-[18px] h-[18px] mr-2"
              />
              <span className="text-white text-sm font-semibold">
                {points.toLocaleString('en-US') ?? 0}
              </span>
            </div>

            {/* Add more button */}
            <button onClick={handleClick} className="flex gap-1 items-center hover:opacity-90 transition-opacity px-3 py-1.5 rounded-md text-sm font-medium bg-[#FFDA341A]">
              <img src="/assets/addmore.svg" alt="Add Icon" />
              <p className="bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent">Add more</p>
            </button>

          </div>

        {/* Right: Profile/Connect */}
        <div className="relative flex items-center gap-4 justify-end">
          <button
            onClick={() => {
              if (!authenticated) {
                handleConnectClick();
              } else {
                setDropdownOpen((prev) => !prev);
              }
            }}
            disabled={!ready}
            className="text-[15px] font-medium text-[#FBFCFC] px-4 py-2 rounded-md border-2 border-[#1A1918] bg-[#1A1918] hover:bg-[#131312] transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            {authenticated ? (
              <>
                <img
                  src={photourl}
                  alt="profile"
                  className="rounded-full h-[22px] w-[22px] mr-2"
                />
                <span className="text-[15px] font-medium text-white mr-2">
                  {displayName}
                </span>
                <svg
                  className={`w-4 h-4 ml-1 transition-transform duration-200 ease-in-out ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            ) : (
              "Connect"
            )}
          </button>
          {authenticated && dropdownOpen && (
            <div className="absolute right-0 mt-22 bg-[#222220] border-2 border-[#1A1918] rounded-md shadow-lg z-50 animate-fade-in">
              <button
                onClick={handleLogout}
                className="flex flex-row gap-2 text-center px-4 py-2 text-white text-[14px] hover:bg-gray-700 transition-colors duration-200 rounded-md"
              >
                Logout
                <img src="/assets/logout.svg" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {showReferralModal && (
        <ReferralInput
          onClose={handleReferralSkip}
          onSubmit={handleReferralSubmit}
          referralCode={referralCode}
          setReferralCode={setReferralCode}
        />
      )}
    </>
  );
}
