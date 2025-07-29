import { cn } from "@/lib/utils";

interface AnimatedCircularProgressBarProps {
  max: number;
  value: number;
  min: number;
  gaugePrimaryColor: string;
  gaugeSecondaryColor: string;
  className?: string;
  started?: boolean;
}

export function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  className,
  started,
}: AnimatedCircularProgressBarProps) {
  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference / 100;
  const currentPercent = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={cn(
        "relative size-40 text-2xl bg-black rounded-full font-semibold transition-all duration-500 ease-in-out",
        className
      )}
      style={{
        "--circle-size": "100px",
        "--circumference": circumference,
        "--percent-to-px": `${percentPx}px`,
        "--gap-percent": "5",
        "--offset-factor": "0",
        "--transition-length": "1s",
        "--transition-step": "200ms",
        "--delay": "0s",
        "--percent-to-deg": "3.6deg",
        boxShadow: started ? "0 0 30px 8px rgba(255, 208, 19, 0.5)" : "none",
        transform: "translateZ(0)",
      } as React.CSSProperties}
    >
      <svg fill="none" className="size-full" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          stroke={gaugeSecondaryColor}
          strokeDasharray={circumference}
          strokeDashoffset="0"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          stroke={gaugePrimaryColor}
          strokeDasharray={`${(currentPercent / 100) * circumference} ${circumference}`}
          strokeDashoffset="0"
          transform="rotate(-90 50 50)"
          strokeLinecap="round"
        />

        {/* Mini ticks */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          const rad = (angle * Math.PI) / 180;
          const rOuter = 50;
          const rInner = 42;
          const x1 = 50 + rInner * Math.cos(rad);
          const y1 = 50 + rInner * Math.sin(rad);
          const x2 = 50 + rOuter * Math.cos(rad);
          const y2 = 50 + rOuter * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#FFD0134D"
              strokeWidth="1"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Center */}
      <span className="duration-300 bg-gradient-to-r from-[#FFD013]  to-[#FF6200] bg-clip-text text-transparent absolute inset-0 m-auto flex flex-col justify-center items-center animate-fade-in-up">
        <img src="/assets/lightninggrad.svg" alt="icon" className="w-6 h-6 mb-1" />
        {started ? `${currentPercent.toFixed(2)}%` : "Begin"}
      </span>
    </div>
  );
}