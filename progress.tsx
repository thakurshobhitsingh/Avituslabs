import { useEffect, useState } from "react";
import { AnimatedCircularProgressBar } from "./ui/circularprog";
import { useUserStore } from "@/helpers/userStore";
import { fetchProgress } from "@/helpers/userauth";

export function Progress() {
  const { userData } = useUserStore();
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [targetValue, setTargetValue] = useState(0);
  const [targetTasks, setTargetTasks] = useState(0);
  const [tagline, setTagline] = useState("✨ Welcome! Start your journey, contribute, and earn rewards!");

  const handleStart = async () => {
    if (!userData?.username || started) return;
    setStarted(true);
    setLoading(true);
    try {
      const data = await fetchProgress(userData.username);
      if (data) {
        setTargetValue(data.displayedEligibility || 0);
        setTargetTasks(data.completedTasks || 0);
      }
    } catch (error) {
      // console.error("❌ Failed to fetch progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (started && !loading) {
      let eligibility = 0;
      const interval = setInterval(() => {
        eligibility += 0.5; // smoother increment
        if (eligibility >= targetValue) {
          eligibility = targetValue;
          clearInterval(interval);
        }
        setValue(eligibility);
        setCompletedTasks(
          targetValue > 0 ? Math.floor((targetTasks * eligibility) / targetValue) : 0
        );
      }, 10); // smoother frames
      return () => clearInterval(interval);
    }
  }, [started, loading, targetValue, targetTasks]);

  useEffect(() => {
    if (!started) {
      setTagline("✨ Welcome! Start your journey, contribute, and earn rewards!");
    } else if (value < 20) {
      setTagline("You're climbing up!");
    } else if (value < 50) {
      setTagline("You're in the top 50%! Keep it up!");
    } else {
      setTagline("🏆 Top Contributor! Almost there!");
    }
  }, [value, started]);

  return (
    <div
      className="relative bg-[#141414] p-6 rounded-xl  overflow-hidden text-white w-full mx-auto animate-fade-in-up"
      style={{
        backgroundImage: "url('/assets/progressbg.png')",
        backgroundSize: "cover",
        backgroundPosition: "top center",
      }}
    >
      {/* Floating Sparkles */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414] to-transparent z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[3px] h-[3px] bg-yellow-400 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div> */}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col gap-6">
        {/* Heading */}
        <div className="text-left">
          <h3 className="text-xl font-semibold">Your Contribution WAGmeter</h3>
          <p className="text-[#979797] font-medium text-sm">
            Track your WAGs and unlock exclusive airdrop rewards!
          </p>
        </div>

        {/* Circle */}
        <div
          className="relative flex justify-center items-center  h-[220px] hover:scale-105 transition-transform cursor-pointer duration-300"
          onClick={handleStart}
        >
          <AnimatedCircularProgressBar
            max={100}
            min={0}
            value={value}
            gaugePrimaryColor="rgba(255, 144, 0, 1)"
            gaugeSecondaryColor="rgba(255, 204, 0, 0.3)"
            started={started}
          />
        </div>

        {/* Stats */}
        {started && !loading && (
          <div className="flex flex-col bg-[#1414141A]    w-[40%] backdrop-blur-lg rounded-lg p-2 items-center mx-auto animate-fade-in border border-[#FFD7001A]" 
>
            <div className="flex flex-wrap justify-between items-center w-[280px] text-center text-sm">
              <div className="flex-1">
                <p className="text-xl font-bold bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent mb-2">{completedTasks || 0}</p>
                <p className="text-white font-medium">Completed Tasks</p>
              </div>
              <span className="border h-[42px] mx-4 border-[#222220]" />
              <div className="flex-1">
                <p className="text-xl font-bold bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent mb-2">{value.toFixed(2)}%</p>
                <p className="text-white font-medium">Closer to Airdrop</p>
              </div>
            </div>

            {/* Tagline */}
            <div className="flex flex-row gap-2 bg-[#FFDA341A]  font-medium text-xs px-4 py-1 rounded-full shadow-lg mt-4 animate-pulse">
              <img src="/assets/fire.svg" alt="spark" className="w-4 h-4" />
              <p className="bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent">{tagline}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-sm text-[#979797] font-medium mt-6 animate-pulse items-center justify-center">
            Fetching your progress...
          </div>
        )}
      </div>
    </div>
  );
}