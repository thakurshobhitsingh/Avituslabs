// src/components/CrashBet.tsx

import { useUserStore } from "@/helpers/userStore";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { BetPlacedToast } from "./ui/toasthelper";

interface CrashBetType {
  betAmount: string;
  setBetAmount: (val: string) => void;
  autoCashout: string;
  setAutoCashout: (val: string) => void;
  handlePlaceBet: () => void;
  handleCashout: () => void;
  gamePhase: "waiting" | "running" | "crashed";
  hasPlacedBet: boolean;
  setHasPlacedBet: (val: boolean) => void; // ✅ ADD THIS
  queuedForNextRound: boolean;
  setQueuedForNextRound: (val: boolean) => void;
  multiplier: number;
  hasCashout: boolean;
}

const betSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Bet must be a number greater than 0",
  }),
});

export function CrashBet({
  betAmount,
  setBetAmount,
  autoCashout,
  setAutoCashout,
  handlePlaceBet,
  handleCashout,
  gamePhase,
  hasPlacedBet,
  setHasPlacedBet,
  queuedForNextRound,
  setQueuedForNextRound,
  multiplier,
  hasCashout,
}: CrashBetType) {
  const { userData } = useUserStore();
  const { toast } = useToast();

  const validateAndPlaceBet = () => {
    if (!userData) {
      toast({ title: "Login Required", description: "Please log in to play." });
      return;
    }

    const parsed = betSchema.safeParse({ amount: betAmount });
    if (!parsed.success) {
      toast({
        title: "Invalid Bet",
        description: parsed.error.errors[0].message,
      });
      return;
    }

    const numericAmount = Number(betAmount);
    if (numericAmount > (userData.points ?? 0)) {
      toast({
        title: "Low Balance",
        description: "Please deposit to continue.",
      });
      return;
    }

    if (gamePhase !== "waiting") {
      toast({
        title: "Bet Queued",
        description: `${numericAmount} AVTS will be placed next round.`,
      });
      setQueuedForNextRound(true);
      return;
    }

    handlePlaceBet();
    toast({
      title: "Bet Placed",
      description: (
        <BetPlacedToast
          betAmount={Number(betAmount)}
          autoCashout={parseFloat(autoCashout)}
        />
      ),
    });
  };

  const tryCashout = () => {
    handleCashout();
    if (!hasPlacedBet) {
      toast({
        title: "No Active Bet",
        description: "You haven’t placed a bet this round.",
      });
      return;
    }

    setHasPlacedBet(false);

    // Emit cashout *instantly*
    // handleCashout();

    toast({
      title: "Cashout Requested ",
      description: `Attempting to cash out at ${multiplier.toFixed(2)}x...`,
    });
  };

  const numericBet = parseFloat(betAmount || "0");
  const numericAuto = parseFloat(autoCashout || "0");

  const pnlSourceMultiplier =
    gamePhase === "running" ? multiplier : numericAuto > 0 ? numericAuto : 0;

  const dynamicPnL =
    numericBet > 0 && pnlSourceMultiplier > 0
      ? (numericBet * pnlSourceMultiplier - numericBet).toFixed(2)
      : "0";

  return (
    <div className="rounded-2xl p-6 text-white">
      {/* Bet Section */}
      <div className="bg-[#141414] p-4 mb-4 rounded-md">
        <h3 className="text-md text-[#8A8A8A] font-medium mb-4">Bet</h3>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-xl font-semibold text-[#8A8A8A]">
            <input
              type="number"
              placeholder="0.0"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="outline-none w-20 text-white bg-transparent"
            />
            <div className="ml-1 text-[#454545]">AVTS</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">{userData?.points ?? 0}</span>
            <span className="text-xs bg-[#2A2A2A] text-white px-2 py-0.5 rounded-md">
              AVTS
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4 items-center justify-between">
          {["10%", "25%", "50%"].map((label, i) => {
            const percentage = parseFloat(label) / 100;
            return (
              <button
                key={i}
                className="bg-[#1A1918] border border-[#222220] font-medium text-[#8A8A8A] px-5 py-2 rounded-lg text-xs"
                onClick={() => {
                  if (userData?.points) {
                    const calculatedBet = (
                      userData.points * percentage
                    ).toFixed(2);
                    setBetAmount(calculatedBet);
                  }
                }}
              >
                {label}
              </button>
            );
          })}

          <button
            className="text-sm text-yellow-400 flex gap-2 bg-[#FFDA341A] px-2 py-1 rounded-md"
            onClick={() => {
              if (userData?.points) {
                setBetAmount(userData.points.toString());
              }
            }}
          >
            MAX <img src="/assets/lightyellow.svg" alt="max" />
          </button>
        </div>
      </div>

      {/* Auto Cashout Section */}
      <div className="bg-[#141414] p-4 mb-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md text-[#8A8A8A] font-medium">Cashout at</h3>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-xl font-semibold text-[#8A8A8A]">
            <input
              type="number"
              placeholder="0"
              value={autoCashout}
              onChange={(e) => setAutoCashout(e.target.value)}
              className="outline-none w-20 text-white bg-transparent appearance-none"
            />
            <span className="ml-1">x</span>
          </div>
        </div>
        <div className="flex gap-2 mt-4 items-center justify-between">
          {["1.5x (Safe)", "2x", "10x", "100x"].map((label, i) => {
            const match = label.match(/([\d.]+)x/);
            const value = match ? match[1] : "";
            return (
              <button
                key={i}
                className="bg-[#1A1918] border border-[#222220] font-medium text-[#8A8A8A] px-5 py-2 rounded-lg text-xs"
                onClick={() => setAutoCashout(value)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PnL Section */}
      <div className="bg-[#141414] p-4 mb-6 rounded-md">
        <h3 className="text-md text-[#8A8A8A] font-medium">PnL</h3>
        <div className="flex justify-between items-center">
          <p className="text-xl font-semibold">{dynamicPnL}</p>
          <span className="text-xs bg-[#2A2A2A] text-white px-2 py-0.5 rounded-md">
            AVTS
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {gamePhase === "waiting" && !hasPlacedBet && (
        <button
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-[#2D2D2A] font-bold py-3 rounded-lg hover:scale-[1.02] transition"
          onClick={validateAndPlaceBet}
        >
          {queuedForNextRound ? "Queued for Next Round" : "Place Bet"}
        </button>
      )}

      {!hasCashout && userData && gamePhase === "running" && (
        <button
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-[#2D2D2A] font-bold py-3 rounded-lg hover:scale-[1.02] transition"
          onClick={tryCashout}
        >
          Cash Out
        </button>
      )}
    </div>
  );
}
