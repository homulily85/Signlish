import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const data = [
  { day: "Mon", minutes: 30 },
  { day: "Tue", minutes: 45 },
  { day: "Wed", minutes: 20 },
  { day: "Thu", minutes: 60 },
  { day: "Fri", minutes: 40 },
  { day: "Sat", minutes: 75 },
  { day: "Sun", minutes: 50 },
];

export default function WeeklyStudyTimeCard({
  className,
}: {
  className?: string;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const lineColor = isDark ? "#fff" : "#000";
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">
          Weekly Study Time
        </CardTitle>
        <CardDescription>
          Time spent learning Signlish this week ({130} minutes).
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
            >
              {/* X AXIS: MON → SUN */}
              <XAxis
                dataKey="day"
                tickLine={false}
                padding={{ left: 16, right: 16 }}
                axisLine={false}
                className="text-xs text-muted-foreground"
              />

              {/* TOOLTIP */}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{ borderRadius: "8px", padding: "8px 12px" }}>
                        <div style={{ fontSize: "14px", fontWeight: "500", color: isDark ? "#fff" : "#000" }}>
                          {payload[0].payload.day}
                        </div>
                        <div style={{ fontSize: "14px", color: isDark ? "#ccc" : "#666" }}>
                          {payload[0].value} minutes
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* SINGLE LINE */}
              <Line
                type="monotone"
                dataKey="minutes"
                stroke={lineColor}
                strokeWidth={2}
                dot={{ fill: lineColor, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
