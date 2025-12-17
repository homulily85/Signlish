"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  LabelList,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProgressData {
  day: string;
  learned: number;
}

interface ProgressResponse {
  data: ProgressData[];
  total_this_week: number;
  total_last_week: number;
}

export default function LearningProgressCard() {
  const [data, setData] = useState<ProgressData[]>([]);
  const [totalThisWeek, setTotalThisWeek] = useState(0);
  const [totalLastWeek, setTotalLastWeek] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return;

    const userId = JSON.parse(user)._id;

    fetch(`http://localhost:8000/dashboard/weekly-signs?user_id=${userId}`)
      .then((res) => res.json())
      .then((res: ProgressResponse) => {
        setData(res.data);
        setTotalThisWeek(res.total_this_week);
        setTotalLastWeek(res.total_last_week);
      })
      .catch((err) => console.error("Failed to fetch progress:", err));
  }, []);

  const percentChange =
    totalLastWeek > 0
      ? Math.round(((totalThisWeek - totalLastWeek) / totalLastWeek) * 100)
      : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Signs Learned (7 days)</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{totalThisWeek} signs</div>

        <p className="text-xs text-muted-foreground">
          {percentChange > 0 ? "+" : ""}
          {percentChange}% compared to last week
        </p>

        <div className="mt-4 h-[120px] text-[hsl(var(--chart-1))]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const day = payload[0].payload.day;
                    const value = payload[0].value;

                    return (
                      <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1 shadow-md border border-border">
                        <span className="h-2 w-2 rounded-sm bg-current" />
                        <span className="text-xs text-muted-foreground">{day}</span>
                        <span className="text-xs font-medium text-foreground">{value}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar dataKey="learned" radius={[6, 6, 0, 0]} fill="currentColor">
                <LabelList dataKey="learned" position="top" fill="currentColor" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
