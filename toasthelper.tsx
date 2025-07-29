
type ToastInfoProps = {
  betAmount?: number;
  autoCashout?: number;
  multiplier?: number;
  wonAmount?: number;
};

export function BetPlacedToast({ betAmount, autoCashout }: ToastInfoProps) {
  return (
    <div className="space-y-1">
      <p className="text-[#E3E3E3]">
        Your bet of{" "}
        <span className="font-bold ">
          {betAmount?.toLocaleString()} AVTS
        </span>{" "}
        is in 🚀
        {!isNaN(autoCashout ?? NaN) && (
        <span className="bg-[#222220] ml-1 px-1 py-0.5 rounded text-xs">
            Auto cashout {autoCashout}x
        </span>
        )}

      </p>
    </div>
  );
}

export function CashedOutToast({ multiplier, wonAmount }: ToastInfoProps) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground">
        You cashed out at{" "}
        <span className="bg-[#FFDA341A] px-2 py-0.5 rounded text-yellow-500 font-bold">
          {multiplier?.toFixed(2)}x
        </span>{" "}
        →{" "}
        <span className="font-bold px-2 py-0.5 rounded bg-[#FFDA341A] text-yellow-500">
          {wonAmount?.toLocaleString()} won! ✨
        </span>
      </p>
    </div>
  );
}

export function ChartCrashedToastRed({ multiplier }: ToastInfoProps) {
  return (
    <div className="space-y-1">
      <p className="text-[#E3E3E3]">
        Chart crashed at{" "}
        <span className="bg-[#FF615C1A] text-[#FF615C] px-2 py-0.5 rounded  font-bold">
          {multiplier?.toFixed(2)}x
        </span>{" "}
        Better luck next round!
      </p>
    </div>
  );
}

export function ChartCrashedToastGreen({ multiplier }: ToastInfoProps) {
  return (
    <div className="space-y-1">
      <p className="text-[#E3E3E3]">
        Chart crashed at{" "}
        <span className="bg-[#00FF001A] text-[#00FF00] px-2 py-0.5 rounded  font-bold">
          {multiplier?.toFixed(2)}x
        </span>{" "}
      </p>
    </div>
  );
}
