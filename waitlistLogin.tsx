import { FC, useEffect, useState } from "react";
// adjust path
import { useUserStore } from "@/helpers/userStore";
import { usePrivy } from "@privy-io/react-auth";
import { checkUser, userAuth, userStats } from "@/helpers/userauth";
import ReferralInput from "./inputreferal";
import { ReferralShareCard } from "./ ReferralShareCard";
import useSWR from "swr";
import { useIsMobile } from "@/hooks/use-isMobile";
import { Skeleton } from "./ui/skeleton";

interface WaitlistLoginProps {
  referralPoints: number;
}

export const WaitlistLogin: FC<WaitlistLoginProps> = () => {
  const { login, user, getAccessToken } = usePrivy();

  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const userData = useUserStore((state) => state.userData);
  const referData = useUserStore((state) => state.referData);
  const [showShareCard, setShowShareCard] = useState(false);

  const handleTwitterLogin = async () => {
    try {
      setIsLoading(true);
      login();
      // console.log("user?.twitter?.username", user?.twitter?.username);
      if (!user?.id || !user?.twitter?.username) return;

      const isNewUser = await checkUser(user?.twitter?.username);
      // console.log(isNewUser);
      if (isNewUser) {
        setShowReferralInput(true);
      } else {
        const token = await getAccessToken();
        if (!token) return;
        await userAuth(token, user.twitter?.username);
      }
      // console.log(userData?.points);
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    (async () => {
      if (!user?.twitter?.username) return;
      const isNewUser = await checkUser(user?.twitter?.username);
      // console.log("Is new user?", isNewUser);
      if (isNewUser) {
        setShowReferralInput(true);
      } else {
        const token = await getAccessToken();
        if (token) {
          await userAuth(token, user?.twitter?.username);
        }
      }
    })();
  }, [user]);

  const handleReferralSubmit = async () => {
    try {
      const token = await getAccessToken();
      if (!token || !user?.twitter?.username) return;
      await userAuth(token, user?.twitter?.username, referralCode);
      useUserStore.setState({ referralCode });
      setShowReferralInput(false);
    } catch (err) {
      console.error("Referral submit error:", err);
    }
  };
  // const check = () =>{

  //   console.log(userData?.points)
  // }
  const isMobile = useIsMobile();
  const username = user?.twitter?.username;

  const { data: stats } = useSWR(
    username && isMobile ? `/user/stats/${username}` : null,
    () => userStats(username!),
    {
      revalidateOnFocus: false,
      refreshWhenHidden: false,
      refreshInterval: 10000,
    }
  );

  // useEffect(() => {
  //   if (stats?.user) {
  //     setUserData(stats.user); // <-- use the actual object directly
  //     console.log(stats.user);
  //     setReferData({
  //       referralPoints: stats.referralStats.referralPoints,
  //       referralCount: stats.referralStats.referralCount,
  //     });
  //   }
  //   // console.log()
  // }, [stats]);

  // useEffect(() => {
  //   handleTwitterLogin();
  // }, []);
  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-lg p-4">
        <div className="bg-[#0d0d0d] p-4 sm:p-8 rounded-2xl shadow-xl w-full max-w-4xl text-white flex flex-col sm:flex-row">
          {/* Left side - Logo and Login */}
          <div className="w-full sm:w-1/2 flex flex-col items-center justify-between border-b sm:border-b-0 sm:border-r border-gray-700 pb-6 sm:pb-0 sm:pr-8 mb-6 sm:mb-0">
            <img
              src="/assets/avitusLogo.svg"
              className="h-16 w-16 sm:h-24 sm:w-24 mb-4 sm:mb-8"
              alt="Avitus Logo"
            />
            <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4 sm:mb-0">
              Welcome to Avitus
            </h2>
            <div className="flex flex-col gap-2 ">
              {user?.twitter?.username ? (
                <div className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-black border-[#8A8A8A] border-2 text-white rounded-lg font-medium text-center text-sm sm:text-base">
                  Logged in as @{user.twitter.username}
                </div>
              ) : (
                <button
                  onClick={handleTwitterLogin}
                  disabled={isLoading}
                  className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-black border-[#8A8A8A] border-2 text-white rounded-lg font-medium flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity disabled:opacity-60 text-sm sm:text-base"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="..." />
                  </svg>
                  <span>
                    {isLoading ? "Logging in..." : "Login with Twitter"}
                  </span>
                </button>
              )}
              <div className="flex flex-col md:flex-row justify-between gap-2 ">
                <a href="https://x.com/avituslabsxyz" target="_blank">
                  <div className="cursor-pointer py-2 sm:py-3 px-3 sm:px-4 bg-black border-[#8A8A8A] border-2 text-white rounded-lg font-medium text-center text-sm sm:text-base">
                    Follow Avitus on X
                  </div>
                </a>
                <a href="https://discord.com/invite/H8BH4jQ6tr" target="_blank">
                  <div className=" cursor-pointer py-2 sm:py-3 px-3 sm:px-4 bg-[#7289d9]  border-[#7289d9] border-2 text-white rounded-lg font-medium text-center text-sm sm:text-base">
                    Join Discord
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 sm:pl-8 flex flex-col justify-center">
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-medium mb-2">
                Your Referral Points
              </h3>
              <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 text-center flex flex-col items-center justify-center">
               {!stats && !userData ?(
                <Skeleton className="h-10 w-[100px] rounded-lg " />
               ):(
                 <span className="text-3xl sm:text-4xl font-bold text-[#FFA00B]">
                  {isMobile ? stats?.user?.points ?? 0 : userData?.points ?? 0}
                </span>
               )}

                <p className="text-gray-400 mt-2 text-sm sm:text-base">
                  Total Points Earned
                </p>
              </div>

              <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 text-center flex flex-col items-center justify-center">
                  {!stats && !userData ? (
                    <Skeleton className="h-10 w-[100px] rounded-lg " />
                  ):(
                  <span className="text-xl sm:text-2xl font-bold text-[#FFA00B]">
                    {isMobile
                      ? stats?.referralStats?.referralCount ?? 0
                      : referData?.referralCount ?? 0}
                  </span>
                  )}
                  <p className="text-gray-400 mt-1 text-xs sm:text-sm">
                    Total Referrals
                  </p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 text-center flex flex-col items-center justify-center">
                  
                  {!stats && !userData ?(
                    <Skeleton className="h-10 w-[100px] rounded-lg " />
                  ):(
                    <span className="text-xl sm:text-2xl font-bold text-[#FFA00B]">
                    {isMobile
                      ? stats?.referralStats?.referralPoints ?? 0
                      : referData?.referralPoints?? 0}
                  </span>
                  )}
                  <p className="text-gray-400 mt-1 text-xs sm:text-sm">
                    Points from Referrals
                  </p>
                </div>
              </div>
            </div>
            {user?.twitter?.username && (
              <button
                className="w-full py-2 sm:py-3 px-3 sm:px-4 text-[#080808] bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] rounded-lg font-semibold text-center text-sm sm:text-base"
                onClick={() => setShowShareCard(true)}
              >
                Refer to Other users
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Card Modal */}
      {showShareCard && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#0d0d0d] p-4 sm:p-6 rounded-xl relative ">
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setShowShareCard(false)}
            >
              ✕
            </button>
            <ReferralShareCard
              referralCodeFromProps={
                isMobile ? stats?.user?.referralCode : undefined
              }
            />
          </div>
        </div>
      )}

      {/* Referral Input Modal */}
      {showReferralInput && (
        <ReferralInput
          referralCode={referralCode}
          setReferralCode={setReferralCode}
          onClose={() => setShowReferralInput(false)}
          onSubmit={handleReferralSubmit}
        />
      )}
    </>
  );
};
