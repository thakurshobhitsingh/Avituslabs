import { useEffect, useState } from "react";
import { Area, AreaChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useUserStore } from "@/helpers/userStore";
import { fetchWeeklyStats, useIsUserConnected } from "@/helpers/userauth";

type WeeklyPoint = {
  day: string;
  points: number;
};

export function WeeklyProg() {
  const [weeklyData, setWeeklyData] = useState<WeeklyPoint[]>([]);
  const userData = useUserStore((state) => state.userData);
  const username = userData?.username;

  useEffect(() => {
    const getStats = async () => {
      if (username) {
        const res = await fetchWeeklyStats(username);
        if (res) {
          setWeeklyData(res);
        }
      } else {
        // user logged out -> clear the weekly data
        setWeeklyData([]);
      }
    };

    getStats();
  }, [username]);
  const isLoggedIn = useIsUserConnected();
  const hasData = weeklyData.length > 0;

  return (
    <div className="bg-[#141414] rounded-2xl shadow-md md:w-full 2xl:max-w-[600px] p-6 text-white">
      <h3 className="text-lg font-semibold">Weekly Breakdown</h3>
      <p className="text-sm text-[#979797] font-medium mb-4">
        See your weekly Activity make a dent on the WAGmeter!
      </p>

      {hasData && isLoggedIn ? (
        <ChartContainer config={{}}>
          <AreaChart data={weeklyData} margin={{ top: 5, left: 12, right: 12 }}>
            <defs>
              <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD013" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#141414" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              padding={{ left: 10, right: 10 }}
              tick={({ x, y, payload }) => (
                <text
                  x={x}
                  y={y + 10}
                  fill="white"
                  fontSize={12}
                  textAnchor="middle"
                >
                  {payload.value}
                </text>
              )}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => (
                    <span className="text-[#FF9000] font-mono font-medium">
                      +{value} points
                    </span>
                  )}
                />
              }
            />

            <Area
              dataKey="points"
              type="linear"
              fill="url(#weeklyGradient)"
              fillOpacity={0.4}
              stroke="#FACC15"
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="flex flex-col gap-2 items-center justify-center h-40">
          <img src="/assets/froglay.svg" />
          <p className="text-[#979797] text-sm">No data to display yet .</p>
        </div>
      )}
    </div>
  );
}
