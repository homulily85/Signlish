import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const data = [
  { learned: 12 },
  { learned: 18 },
  { learned: 10 },
  { learned: 22 },
  { learned: 15 },
  { learned: 20 },
  { learned: 25 },
  { learned: 30 },
];

export default function LearningProgressCard() {
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

  const barColor = isDark ? "#fff" : "#000";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">
          Signs Learned
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          152 signs
        </div>

        <p className="text-xs text-muted-foreground">
          +24% compared to last month
        </p>

        <div className="mt-4 h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              {/* TOOLTIP */}
              <Tooltip
                cursor={{ fill: isDark ? "#333" : "#f0f0f0" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{ borderRadius: "8px", padding: "8px 12px" }}>
                        <div style={{ fontSize: "14px", color: isDark ? "#fff" : "#000" }}>
                          {payload[0].value} signs
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar
                dataKey="learned"
                radius={[4, 4, 0, 0]}
                fill={barColor}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
