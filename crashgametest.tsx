import { crashMultiplier } from "@/helpers/socket";
import { toast } from "@/hooks/use-toast";
import React, {
  useRef,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { ChartCrashedToastGreen, ChartCrashedToastRed } from "./ui/toasthelper";
import { usePlayersOnlineStore } from "@/helpers/userStore";

interface CrashGametestProps {
  width?: number;
  height?: number;
  multiplier?: number;
  gamePhase?: "waiting" | "running" | "crashed";
  countdown?: number | null;
  hasCashout?: boolean;
  cashoutFloatData?: CashoutData[];
  cashoutTimestamp?: number;
  setCashoutFloatData: Dispatch<SetStateAction<CashoutData[]>>;
  timeInSeconds: number;
}

interface Point {
  x: number;
  y: number;
}

export type CashoutData = {
  userId: number;
  username: string;
  reward: number;
  cashedOutAt: number;
  startY?: number; // Add this to track starting position
  startTime?: number; // Add this to track individual animation start time
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
}

const TOTAL_POINTS = 2000;
const BASE_EXP_ALPHA = 0.05; // Renamed from EXP_ALPHA
const GROWTH_SPEED = 0.05;
const ALPHA_GROWTH_RATE = 0.01; // Controls how fast EXP_ALPHA grows over time

const CrashGametest: React.FC<CrashGametestProps> = ({
  width = 1200,
  height = 1200,
  multiplier,
  gamePhase = "waiting",
  countdown,
  hasCashout,
  cashoutFloatData,
  setCashoutFloatData,
  timeInSeconds,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const multiplierRef = useRef(1.0);
  const particlesRef = useRef<Particle[]>([]);
  const crashTimeRef = useRef<number | null>(null);
  const currentMultiplierRef = useRef(1.0);
  const prevMultiplierRef = useRef(1.0);
  const [crashmul, setcrashmul] = useState(0);
  const { playersOnline } = usePlayersOnlineStore();
  const chartPadding = {
    top: 10,
    right: 20,
    bottom: 30,
    left: 60,
  };
  const chartWidth = width - chartPadding.left - chartPadding.right;
  const chartHeight = height - chartPadding.top - chartPadding.bottom;
  const queueRef = useRef<CashoutData[]>([]);
  const [activeCashouts, setActiveCashouts] = useState<CashoutData[]>([]);
  const popoutAnimationRef = useRef<number | null>(null);
  const timeInSecondsRef = useRef(timeInSeconds);


  useEffect(() => {
    // Keep queueRef in sync with cashoutFloatData
    if (cashoutFloatData) {
      queueRef.current = [...cashoutFloatData];
    }
  }, [cashoutFloatData]);

  // When there is no currentCashout and the queue is not empty, dequeue and start animating
  useEffect(() => {
    if (cashoutFloatData && cashoutFloatData.length > 0) {
      const next = cashoutFloatData[0];
      setActiveCashouts((prev) => [
        ...prev,
        { ...next, startTime: performance.now() },
      ]);
      setCashoutFloatData?.((prev) => prev.slice(1));
    }
  }, [cashoutFloatData, setCashoutFloatData]);

  // Update multiplier ref when websocket updates
  useEffect(() => {
    multiplierRef.current = multiplier || 1.0;
    // console.log(gamePhase);
  }, [multiplier, gamePhase]);

  useEffect(() => {
    timeInSecondsRef.current = timeInSeconds;
  }, [timeInSeconds, gamePhase]);

  useEffect(() => {
    crashMultiplier(({ crashPoint }) => {
      // Ensure crashPoint is a number
      setcrashmul(crashPoint); // No need to parseFloat if it's already a number
      // console.log("Crash value: ", crashPoint);
    });

    if (gamePhase === "crashed" && crashmul) {
      // console.log("hasCashout: ", hasCashout);
      if (hasCashout) {
        toast({
          title: "Chart Crashed",
          description: <ChartCrashedToastGreen multiplier={Number(crashmul)} />,
        });
      } else {
        toast({
          title: "Chart Crashed",
          description: <ChartCrashedToastRed multiplier={Number(crashmul)} />,
        });
      }
    }
  }, [gamePhase, multiplier]);

  const getDynamicExpAlpha = (elapsedTime: number) => {
    // Exponential growth: alpha = base * e^(rate * time)
    return BASE_EXP_ALPHA * Math.exp(ALPHA_GROWTH_RATE * elapsedTime);
  };

  const easeExp = (t: number, yMax: number, elapsedTime: number) => {
    const dynamicAlpha = getDynamicExpAlpha(elapsedTime);
    const eased = Math.pow(t, 2);
    return (
      1 +
      ((Math.exp(dynamicAlpha * eased) - 1) / (Math.exp(dynamicAlpha) - 1)) *
        (yMax - 1)
    );
  };

  const getFullCurve = (xMax: number, yMax: number, elapsedTime: number) => {
    const points: Point[] = [];
    for (let i = 0; i <= TOTAL_POINTS; i++) {
      const t = i / TOTAL_POINTS;
      const time = t * xMax;
      const multiplier = easeExp(t, yMax, elapsedTime);
      const x = chartPadding.left + (time / xMax) * chartWidth;
      const y =
        chartPadding.top +
        chartHeight -
        ((multiplier - 1) / (yMax - 1)) * chartHeight;
      points.push({ x, y });
    }
    return points;
  };

  const getCurrentPoint = (
    xMax: number,
    yMax: number,
    currentMultiplier: number,
    elapsedTime: number
  ) => {
    const fullCurve = getFullCurve(xMax, yMax, elapsedTime);
    const index = fullCurve.findIndex(
      (point) =>
        ((chartPadding.top + chartHeight - point.y) / chartHeight) *
          (yMax - 1) +
          1 >=
        currentMultiplier
    );

    if (index === -1) return fullCurve;

    const points = fullCurve.slice(0, index + 1);
    if (index < fullCurve.length - 1) {
      const current = fullCurve[index];
      const next = fullCurve[index + 1];
      const currentMultiplierValue =
        ((chartPadding.top + chartHeight - current.y) / chartHeight) *
          (yMax - 1) +
        1;
      const nextMultiplierValue =
        ((chartPadding.top + chartHeight - next.y) / chartHeight) * (yMax - 1) +
        1;
      const progress =
        (currentMultiplier - currentMultiplierValue) /
        (nextMultiplierValue - currentMultiplierValue);
      const interpolatedPoint = {
        x: current.x + (next.x - current.x) * progress,
        y: current.y + (next.y - current.y) * progress,
      };
      points.push(interpolatedPoint);
    }

    return points;
  };
  const getYAxisLabels = (yMax: number) => {
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      ticks.push(1 + (i * (yMax - 1)) / 4);
    }
    return ticks;
  };

  const getXAxisLabels = (xMax: number) => {
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      ticks.push((i * xMax) / 4);
    }
    return ticks;
  };

  const drawAxes = (
    ctx: CanvasRenderingContext2D,
    xMax: number,
    yMax: number
  ) => {
    ctx.save();
    ctx.strokeStyle = "#2D2D2A";
    ctx.lineWidth = 3;
    ctx.fillStyle = "#8A8A8A";
    ctx.font = "bold 16px Arial";

    // Y-axis (Multipliers)
    ctx.beginPath();
    ctx.moveTo(chartPadding.left, chartPadding.top);
    ctx.lineTo(chartPadding.left, chartPadding.top + chartHeight);
    ctx.stroke();

    // X-axis (Seconds)
    ctx.beginPath();
    ctx.moveTo(chartPadding.left, chartPadding.top + chartHeight);
    ctx.lineTo(chartPadding.left + chartWidth, chartPadding.top + chartHeight);
    ctx.stroke();

    // Draw Y-axis labels
    const yLabels = getYAxisLabels(yMax);
    yLabels.forEach((multiplierValue) => {
      const y =
        chartPadding.top +
        chartHeight -
        ((multiplierValue - 1) / (yMax - 1)) * chartHeight;
      if (y >= chartPadding.top && y <= chartPadding.top + chartHeight) {
        ctx.beginPath();
        ctx.moveTo(chartPadding.left - 8, y);
        ctx.lineTo(chartPadding.left, y);
        ctx.stroke();
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(
          multiplierValue.toFixed(1) + "x",
          chartPadding.left - 15,
          y
        );
      }
    });

    // Draw X-axis labels
    const xLabels = getXAxisLabels(xMax);
    xLabels.forEach((timeValue) => {
      const x = chartPadding.left + (timeValue / xMax) * chartWidth;
      if (x <= chartPadding.left + chartWidth) {
        ctx.beginPath();
        ctx.moveTo(x, chartPadding.top + chartHeight + 8);
        ctx.lineTo(x, chartPadding.top + chartHeight);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(
          timeValue.toFixed(1) + "s",
          x,
          chartPadding.top + chartHeight + 15
        );
      }
    });

    ctx.restore();
  };

  const createParticles = (tipX: number, tipY: number) => {
    const numParticles = 20;
    const particles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x: tipX,
        y: tipY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        opacity: 1,
        life: 1,
      });
    }
    return particles;
  };

  const updateParticles = (deltaTime: number) => {
    particlesRef.current = particlesRef.current
      .map((particle) => {
        particle.x += particle.vx * (deltaTime / 16);
        particle.y += particle.vy * (deltaTime / 16);
        particle.life -= 0.02 * (deltaTime / 16);
        particle.opacity = Math.max(0, particle.life);
        return particle;
      })
      .filter((particle) => particle.life > 0);
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.fillStyle = "rgba(255, 0, 0, opacity)";
    particlesRef.current.forEach((particle) => {
      ctx.globalAlpha = particle.opacity;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  };

  const startNewRound = () => {
    pointsRef.current = [
      { x: chartPadding.left, y: chartPadding.top + chartHeight },
    ];
    startTimeRef.current = performance.now();
    particlesRef.current = [];
    crashTimeRef.current = null;
    currentMultiplierRef.current = 1.0;
    prevMultiplierRef.current = 1.0;
    multiplierRef.current = 1.0;

    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
    }
    animationIdRef.current = requestAnimationFrame(animate);
  };

  const drawFrame = (currentTime: number, shouldAddPoint: boolean) => {
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime;
      currentMultiplierRef.current = 1.0;
    }

    const elapsedTime = (currentTime - startTimeRef.current) / 1000;

    // Update current multiplier based on websocket value
    if (gamePhase === "running" && multiplierRef.current !== undefined) {
      const targetMultiplier = multiplierRef.current;
      const diff = targetMultiplier - currentMultiplierRef.current;

      if (Math.abs(diff) > 0.0001) {
        const step = Math.min(Math.abs(diff) * GROWTH_SPEED, Math.abs(diff));
        currentMultiplierRef.current += diff > 0 ? step : -step;
      } else {
        currentMultiplierRef.current = targetMultiplier;
      }
    }

    const xMax = Math.max(10, timeInSecondsRef.current);
    // console.log("xMax: ", xMax);
    const yMax = Math.max(1.8, currentMultiplierRef.current * 1.2);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const currentPoints = shouldAddPoint
      ? getCurrentPoint(xMax, yMax, currentMultiplierRef.current, elapsedTime)
      : pointsRef.current;

    if (shouldAddPoint) {
      pointsRef.current = currentPoints;
    }

    drawAxes(ctx, xMax, yMax);

    let strokeStyle: string | CanvasGradient;
    if (gamePhase === "crashed") {
      strokeStyle = "#ff3333";
    } else {
      const gradient = ctx.createLinearGradient(
        0,
        chartPadding.top,
        0,
        chartPadding.top + chartHeight
      );
      gradient.addColorStop(0, "#FFD013");
      gradient.addColorStop(1, "#FF9000");
      strokeStyle = gradient;
    }

    if (currentPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, chartPadding.top + chartHeight);
      ctx.lineTo(currentPoints[0].x, currentPoints[0].y);

      for (let i = 1; i < currentPoints.length - 1; i++) {
        const xc = (currentPoints[i].x + currentPoints[i - 1].x) / 2;
        const yc = (currentPoints[i].y + currentPoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(
          currentPoints[i - 1].x,
          currentPoints[i - 1].y,
          xc,
          yc
        );
      }

      if (currentPoints.length > 2) {
        const lastIndex = currentPoints.length - 1;
        const prevIndex = lastIndex - 1;
        const cp1x = currentPoints[prevIndex].x;
        const cp1y = currentPoints[prevIndex].y;
        ctx.quadraticCurveTo(
          cp1x,
          cp1y,
          currentPoints[lastIndex].x,
          currentPoints[lastIndex].y
        );
      } else if (currentPoints.length === 2) {
        ctx.lineTo(currentPoints[1].x, currentPoints[1].y);
      }

      const lastPoint = currentPoints[currentPoints.length - 1];
      ctx.lineTo(lastPoint.x, chartPadding.top + chartHeight);
      ctx.lineTo(currentPoints[0].x, chartPadding.top + chartHeight);
      ctx.closePath();

      const fillGradient = ctx.createLinearGradient(
        0,
        chartPadding.top,
        0,
        chartPadding.top + chartHeight
      );
      if (gamePhase === "crashed") {
        fillGradient.addColorStop(0, "rgba(255, 100, 100, 1)");
        fillGradient.addColorStop(1, "rgba(20, 20, 20, 0.2)");
      } else {
        fillGradient.addColorStop(0, "rgba(255, 208, 19, 1)");
        fillGradient.addColorStop(1, "rgba(20, 20, 20, 0.2)");
      }

      ctx.fillStyle = fillGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      for (let i = 1; i < currentPoints.length - 1; i++) {
        const xc = (currentPoints[i].x + currentPoints[i - 1].x) / 2;
        const yc = (currentPoints[i].y + currentPoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(
          currentPoints[i - 1].x,
          currentPoints[i - 1].y,
          xc,
          yc
        );
      }

      if (currentPoints.length > 2) {
        const lastIndex = currentPoints.length - 1;
        const prevIndex = lastIndex - 1;
        const cp1x = currentPoints[prevIndex].x;
        const cp1y = currentPoints[prevIndex].y;
        ctx.quadraticCurveTo(
          cp1x,
          cp1y,
          currentPoints[lastIndex].x,
          currentPoints[lastIndex].y
        );
      } else if (currentPoints.length === 2) {
        ctx.lineTo(currentPoints[1].x, currentPoints[1].y);
      }

      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.shadowColor = "rgba(0, 0, 0, 0)";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      const tipPoint = currentPoints[currentPoints.length - 1];

      if (gamePhase === "crashed" && crashTimeRef.current === null) {
        crashTimeRef.current = currentTime;
        particlesRef.current = createParticles(tipPoint.x, tipPoint.y);
      }

      if (particlesRef.current.length > 0) {
        const deltaTime = crashTimeRef.current
          ? currentTime - crashTimeRef.current
          : 0;
        updateParticles(deltaTime);
        drawParticles(ctx);
      }

      ctx.beginPath();
      let tipRadius = ctx.lineWidth + 2;
      if (gamePhase === "crashed" && crashTimeRef.current) {
        const elapsed = currentTime - crashTimeRef.current;
        tipRadius = ctx.lineWidth + 2 + Math.sin(elapsed * 0.005) * 4;
      }
      ctx.arc(tipPoint.x, tipPoint.y, tipRadius, 0, Math.PI * 2);
      ctx.fillStyle = gamePhase === "crashed" ? "#ff3333" : "#FF9000";
      ctx.fill();
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.save();
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = strokeStyle;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 30;
    ctx.fillText(`${multiplierRef.current.toFixed(2)}x`, width / 2, height / 2);
    ctx.restore();

    // Popout drawing logic
    if (activeCashouts.length > 0) {
      // Update active cashouts
      const updatedCashouts = activeCashouts.filter((cashout) => {
        if (!cashout.startTime) return false;
        const elapsed = currentTime - cashout.startTime;
        return elapsed < 5000; // Keep only cashouts that haven't completed their animation
      });

      if (updatedCashouts.length !== activeCashouts.length) {
        setActiveCashouts(updatedCashouts);
      }

      const verticalSpacing = 60; // Minimum spacing between float boxes
      let lastFloatY = -Infinity;
      updatedCashouts.forEach((cashout, index) => {
        if (!cashout.startTime) return;

        const elapsed = currentTime - cashout.startTime;
        const duration = 6000;
        const progress = Math.min(elapsed / duration, 1);
        const opacity = 1 - progress;

        if (cashout.startY === undefined) {
          cashout.startY = canvas.height - 60 - index * 70;
        }

        // Only move halfway up by dividing the distance by 2
        let floatY = cashout.startY - progress * ((canvas.height + 100) / 2);
        if (floatY - lastFloatY < verticalSpacing) {
          floatY = lastFloatY + verticalSpacing;
        }
        lastFloatY = floatY;
        // if (index < updatedCashouts.length - 1) {
        //   const nextCashout = updatedCashouts[index + 1];
        //   if (nextCashout.startY !== undefined) {
        //     const nextElapsed = currentTime - (nextCashout.startTime || 0);
        //     const nextProgress = Math.min(nextElapsed / duration, 1);
        //     const nextFloatY = nextCashout.startY - (nextProgress * ((canvas.height + 100) / 2));

        //     ctx.beginPath();
        //     ctx.strokeStyle = "rgba(255, 218, 52, 0.3)";
        //     // ctx.lineWidth = 2;
        //     ctx.moveTo(canvas.width - 120, floatY + 25);
        //     ctx.lineTo(canvas.width - 120, nextFloatY + 25);
        //     ctx.stroke();
        //   }
        // }

        // Draw the cashout box with rounded corners
        ctx.globalAlpha = opacity;
        ctx.fillStyle = "rgba(255, 218, 52, 0.2)";

        // Draw rounded rectangle
        const radius = 10;
        ctx.beginPath();
        ctx.moveTo(canvas.width - 220 + radius, floatY);
        ctx.lineTo(canvas.width - 20 - radius, floatY);
        ctx.quadraticCurveTo(
          canvas.width - 20,
          floatY,
          canvas.width - 20,
          floatY + radius
        );
        ctx.lineTo(canvas.width - 20, floatY + 50 - radius);
        ctx.quadraticCurveTo(
          canvas.width - 20,
          floatY + 50,
          canvas.width - 20 - radius,
          floatY + 50
        );
        ctx.lineTo(canvas.width - 220 + radius, floatY + 50);
        ctx.quadraticCurveTo(
          canvas.width - 220,
          floatY + 50,
          canvas.width - 220,
          floatY + 50 - radius
        );
        ctx.lineTo(canvas.width - 220, floatY + radius);
        ctx.quadraticCurveTo(
          canvas.width - 220,
          floatY,
          canvas.width - 220 + radius,
          floatY
        );
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "14px sans-serif";
        ctx.fillText(
          `${cashout.username} cashed out!`,
          canvas.width - 210,
          floatY + 20
        );
        ctx.font = "12px sans-serif";
        ctx.fillText(
          `🏆 x${cashout.cashedOutAt.toFixed(2)} | 💰 ${cashout.reward.toFixed(
            2
          )}`,
          canvas.width - 210,
          floatY + 40
        );
      });

      ctx.globalAlpha = 1;
    }
  };

  const animate = (currentTime: number) => {
    const shouldAddPoint = gamePhase === "running";
    drawFrame(currentTime, shouldAddPoint);

    if (gamePhase === "running") {
      animationIdRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (gamePhase === "running") {
      // Reset all values before starting new round
      pointsRef.current = [
        { x: chartPadding.left, y: chartPadding.top + chartHeight },
      ];
      currentMultiplierRef.current = 1.0;
      multiplierRef.current = 1.0;
      startNewRound();
    } else if (gamePhase === "crashed") {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      drawFrame(performance.now(), false);
    } else if (gamePhase === "waiting") {
      // Reset everything when waiting for a new round
      pointsRef.current = [
        { x: chartPadding.left, y: chartPadding.top + chartHeight },
      ];
      currentMultiplierRef.current = 1.0;
      multiplierRef.current = 1.0;
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    }
  }, [gamePhase]);

  useEffect(() => {
    if (activeCashouts.length > 0) {
      const animatePopout = () => {
        drawFrame(performance.now(), false);
        popoutAnimationRef.current = requestAnimationFrame(animatePopout);
      };
      popoutAnimationRef.current = requestAnimationFrame(animatePopout);
      return () => {
        if (popoutAnimationRef.current !== null) {
          cancelAnimationFrame(popoutAnimationRef.current);
        }
      };
    }
  }, [activeCashouts]);

  useEffect(() => {
    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <div
      className="md:w-175 2xl:w-[90%] xl:w-full xl:h-[485px] 2xl:h-[570px] flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4  md:h-[405px]"
      style={{ backgroundImage: "url('/assets/CrashchartBG.svg')" }}
    >
      <div className="w-full flex justify-center mb-4">
        <div className="bg-[#FFDA341A] px-4 py-2 rounded-xl w-fit">
          <div className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-[#FFD013] via-[#FFA00B] to-[#FF6200] bg-clip-text text-transparent">
            <img src="/assets/players.svg" alt="players" className="w-4 h-4" />
            {playersOnline["crash"] || 0} players online
          </div>
        </div>
      </div>

      {gamePhase !== "running" && gamePhase !== "crashed" ? (
        <div className="flex items-center justify-center w-full md:h-[330px] xl:h-[320px] 2xl:h-[550px] h-[500px]">
          <div className="relative h-[30px] w-[200px] xl:w-[200px] 2xl:w-[240px] xl:h-[30px] 2xl:h-[40px] rounded-md bg-gradient-to-r from-yellow-400 via-[#FFDA341A] to-[#FFDA341A] overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-300 to-[#FFDA341A] transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown ?? 0) * 20}%` }}
            />
            {countdown ? (
              <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-lg z-10">
                Starting in {countdown}s
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-lg z-10">
                Waiting...
              </div>
            )}
          </div>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            display: "block",
            // margin: "0 auto",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "1200px",
          }}
        />
      )}
    </div>
  );
};

export default CrashGametest;
