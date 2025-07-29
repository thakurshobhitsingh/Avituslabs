import { useState, useMemo } from "react";
import { QuestCard } from "./getstarted";
import { useIsTaskStore, useUserStore } from "@/helpers/userStore";

export function SubmitWork() {
  const [started, setStarted] = useState(false);
  const userData = useUserStore((state) => state.userData);
  const { isTaskStore } = useIsTaskStore();
  // Determine the username to use: prefer customUsername
  const username = useMemo(() => {
    if (!userData) return null;
    return userData.customUsername ?? userData.username;
  }, [userData]);

  if (!userData || !username) {
    return (
      <div
        className="flex flex-col items-center gap-[140px] w-full h-full p-4 rounded-xl shadow-md bg-[#141414] bg-no-repeat bg-cover"
        style={{ backgroundImage: "url('/assets/subworkbg.svg')" }}
      >
        <div className="flex flex-col items-start w-full">
          <h3 className="text-xl font-semibold text-white">Drop your WAGs</h3>
          <p className="text-[#979797] font-medium text-sm">
            Share your WAGs to secure your spot in the Airdrop!
          </p>
        </div>
        <GetStarted onClick={() => setStarted(true)} />
      </div>
    );
  }

return (
  <div
    className="relative flex flex-col items-center gap-[140px] w-full h-full p-4 rounded-xl shadow-md bg-[#141414] bg-no-repeat bg-cover"
    style={{ backgroundImage: "url('/assets/subworkbg.svg')" }}
  >
    {started && (
      <img
        src="/assets/submit.svg"
        alt="Top Right Decoration"
        className="absolute top-4 right-4 "
      />
    )}

    <div className="flex flex-col items-start w-full">
      <h3 className="text-xl font-semibold text-white">Drop your WAGs</h3>
      <p className="text-[#979797] font-medium text-sm">
        Share your WAGs to secure your spot in the Airdrop!
      </p>
    </div>

    {!started && !isTaskStore ? (
      <GetStarted onClick={() => setStarted(true)} />
    ) : (
      <QuestCard username={username} />
    )}
  </div>
);

}

function GetStarted({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="flex flex-row items-center justify-between rounded-lg gap-8 rounded-xl p-8 w-[80%] mx-auto bg-[#1414141A] backdrop-blur-lg border border-[#FFD7001A]" 
    >
      {/* Left Text Section */}
      <div className="flex flex-col max-w-lg text-left">
        <h3 className="font-semibold text-xl mb-2 bg-gradient-to-r from-[#FFD013]  to-[#FF6200] bg-clip-text text-transparent">
          Ready to make your mark?
        </h3>
        <p className="font-medium text-md mb-6 bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent">
          Your journey starts here. Submit your WAG’s, earn points, unlock milestones — and rise to the top.
        </p>
        <button
          onClick={onClick}
          className="flex items-center gap-2 rounded-md py-3 px-8 font-medium
                     bg-gradient-to-r from-[#FFD013] to-[#FF6200] text-[#2D2D2A]
                     hover:opacity-90 transition-opacity cursor-pointer w-[50%]"
        >
          Let’s get started
          <img src="/assets/stars.svg" alt="sparkle" className="w-5 h-5" />
        </button>
      </div>

      {/* Right Image */}
      <img
        src="/assets/submit.svg"
        alt="Submit illustration"
        className="w-[180px] select-none"
      />
    </div>
  );
}
