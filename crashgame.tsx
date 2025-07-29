import { useEffect, useState, useCallback, useRef } from "react";
import { useUserStore } from "@/helpers/userStore";
import BreadcrumbsDynamic from "./breadcrumbsdynamics";
import CrashGametest from "./crashgametest";
import { CrashBet } from "./crashbet";
import { BetView } from "./betview";
import { useToast } from "@/hooks/use-toast";
import isEqual from "fast-deep-equal";
import "../styles/animation.css";
import {
  onCrashUpdate,
  onCrashNewGame,
  onCrashStart,
  onCrash,
  onCashoutSuccess,
  emitPlaceBet,
  emitCashout,
  cleanupCrashSocket,
  initializeCrashSocket,
} from "@/helpers/socket";
import { CashedOutToast } from "./ui/toasthelper";
import { useResponsiveSize } from "@/hooks/use-resp";

interface Bet {
  id: number;
  userId: number;
  roundId: number;
  betAmount: string;
  cashoutMultiplier: string | null;
  profitLoss: string;
  createdAt: string;
}

interface LeaderboardEntry {
  userId: number;
  username: string;
  totalProfit: number;
}
export type CashoutData = {
  userId: number;
  username: string;
  reward: number;
  cashedOutAt: number;
};
export default function CrashGame() {
  const { userData } = useUserStore();
  const { toast } = useToast();
  const [multiplier, setMultiplier] = useState(1);
  const [gamePhase, setGamePhase] = useState<"waiting" | "running" | "crashed">(
    "waiting"
  );
  const [betAmount, setBetAmount] = useState("");
  const [autoCashout, setAutoCashout] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [betsTab, setBetsTab] = useState<"mybets" | "top">("mybets");
  const [betsData, setBetsData] = useState<Bet[] | LeaderboardEntry[]>([]);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [queuedForNext, setQueuedForNext] = useState(false);
  const [isLoadingBets, setIsLoadingBets] = useState(false);
  const [hasCashout, setHasCashout] = useState(false);
  const previousDataRef = useRef<any[]>([]);
  const hasReceivedStartOrNewGame = useRef(false);
  const [timeInSeconds, setTimeInSeconds] = useState(0);

  const isInitialLoad = useRef(true);
  const [cashoutFloatData, setCashoutFloatData] = useState<CashoutData[]>([]);
  const [cashoutTimestamp, setCashoutTimestamp] = useState<number>(0);

  // const { playersOnline } = usePlayersOnlineStore();

  useEffect(() => {
    if (userData?.id) {
      initializeCrashSocket(userData.id);
    }
  }, [userData?.id]);

  const handleFetchBets = useCallback(
    async (showLoader = false) => {
      if (!userData?.username) return;

      const route =
        betsTab === "mybets"
          ? `/games/mybets/${userData.username}`
          : "/games/leaderboard";

      try {
        if (showLoader) setIsLoadingBets(true);
        const res = await fetch(`https://porback.avituslabs.xyz${route}`);
        // const res = await fetch(`http://localhost:3000${route}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        const newData =
          betsTab === "mybets" ? data.bets ?? [] : data.topPlayers ?? [];

        if (!isEqual(previousDataRef.current, newData)) {
          setBetsData(newData);
          previousDataRef.current = newData;
        }
      } catch (err) {
        // toast({
        //   title: "Error",
        //   description: "Failed to fetch bet data.",
        //   variant: "destructive",
        // });
      } finally {
        if (showLoader) setIsLoadingBets(false);
      }
    },
    [betsTab, userData?.username, toast]
  );

  // Trigger fetch on mount and tab change
  useEffect(() => {
    handleFetchBets(true);
    isInitialLoad.current = false;
  }, [betsTab]);

  // Refetch every 8 seconds without showing loader
  useEffect(() => {
    const interval = setInterval(() => handleFetchBets(false), 8000);
    return () => clearInterval(interval);
  }, [handleFetchBets]);

  useEffect(() => {
    onCrashUpdate(({ multiplier, st, ct }) => {
      // console.log("multiplier: ", multiplier);
      setMultiplier(parseFloat(multiplier));
      setTimeInSeconds((parseInt(ct) - parseInt(st)) / 1000);
      // setPlayersOnline({ ...playersOnline, 'crash': parseInt(players) });
      // Infer game phase if not received start or newGame
      if (!hasReceivedStartOrNewGame.current) {
        setGamePhase("running");
      }
    });

    onCrashNewGame(() => {
      hasReceivedStartOrNewGame.current = true;
      // console.log("onCrashNewGame");
      setHasCashout(false);
      setGamePhase("waiting");
      setCountdown(5);

      if (queuedForNext && userData) {
        emitPlaceBet({
          userId: userData.id,
          username: userData.username,
          amount: Number(betAmount),
          autoCashout: parseFloat(autoCashout || "0") || undefined,
        });
        setHasPlacedBet(true);
        setQueuedForNext(false);
      } else {
        setHasPlacedBet(false);
      }
    });

    onCrashStart(() => {
      hasReceivedStartOrNewGame.current = true;
      setGamePhase("running");
    });

    onCrash(() => setGamePhase("crashed"));

    onCashoutSuccess(({ username, userId, reward, cashedOutAt }) => {
      const newFloatData = { userId, username, reward, cashedOutAt };

      setCashoutFloatData(prev => [...prev, newFloatData]);
      // console.log("Received Cashout Data:", cashoutFloatData);
      setCashoutTimestamp(performance.now());

      if (userId === userData?.id) {
        // toast({
        //   title: "Cash Out Successful ",
        //   description: `You earned ${reward.toFixed(2)} AVTS at ${cashedOutAt.toFixed(2)}x.`,
        // });

        // (true);

        setHasCashout(true);

        toast({
          title: "Cashed Out",
          description: (
            <CashedOutToast
              multiplier={Number(cashedOutAt)}
              wonAmount={Number(reward)}
            />
          ),
        });
      }
    });

    return () => cleanupCrashSocket();
  }, [
    userData,
    betAmount,
    autoCashout,
    queuedForNext,
    toast,
    cashoutFloatData,
  ]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
    }
  }, [countdown]);

  const handlePlaceBet = () => {
    if (!userData) return;
    emitPlaceBet({
      userId: userData.id,
      username: userData.username,
      amount: Number(betAmount),
      autoCashout: parseFloat(autoCashout || "0") || undefined,
    });
    setHasPlacedBet(true);
  };

  const handleCashout = () => {
    if (!userData || !hasPlacedBet) return;
    emitCashout(userData.id);
    setHasPlacedBet(false);
  };
  const { width, height } = useResponsiveSize();
  return (
    <div className="ml-6 mt-4">
      <BreadcrumbsDynamic />
      <div className="min-h-screen rounded-xl  md:mr-4 mr-0 text-white  mt-8 flex flex-col gap-8">
        <div className="flex md:flex-col xl:flex-row gap-8 items-center xl:items-start">
          <div className="flex-1 flex flex-col [@media(min-width:2500px)]:items-center  gap-8 ">
            <div className="relative mb-6 2xl:pl-10 [@media(min-width:2500px)]:w-[70%] ">
              <CrashGametest
                width={width}
                height={height}
                // growthRate={0.15}
                // multiplierAtTop={4}
                multiplier={multiplier}
                gamePhase={gamePhase}
                countdown={countdown}
                hasCashout={hasCashout}
                cashoutFloatData={cashoutFloatData}
                cashoutTimestamp={cashoutTimestamp}
                setCashoutFloatData={setCashoutFloatData}
                timeInSeconds={timeInSeconds}
              />
            </div>
            <div className="w-full hidden xl:block">
              <BetView
                betsTab={betsTab}
                setBetsTab={setBetsTab}
                betsData={betsData}
                isLoading={isLoadingBets}
                userId={userData?.id ?? 0}
              />
            </div>
          </div>
          <div className="flex flex-col gap-6 items-center justify-center md:w-full xl:w-[320px] 2xl:w-[420px]">
            <div className="md:w-full 2xl:w-full xl:w-100 [@media(min-width:2000px)]:w-[120%]">
              <CrashBet
                betAmount={betAmount}
                setBetAmount={setBetAmount}
                autoCashout={autoCashout}
                setAutoCashout={setAutoCashout}
                handlePlaceBet={handlePlaceBet}
                handleCashout={handleCashout}
                gamePhase={gamePhase}
                hasPlacedBet={hasPlacedBet}
                setHasPlacedBet={setHasPlacedBet}
                setQueuedForNextRound={setQueuedForNext}
                queuedForNextRound={queuedForNext}
                multiplier={multiplier}
                hasCashout={hasCashout}
              />
            </div>
            <div className="w-full xl:hidden md:block">
              <BetView
                betsTab={betsTab}
                setBetsTab={setBetsTab}
                betsData={betsData}
                isLoading={isLoadingBets}
                userId={userData?.id ?? 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
