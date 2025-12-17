"use client";

import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useEffect, useState } from "react";

type LessonProgressData = {
  completedLessons: number;
  totalLessons: number;
};

export default function LessonProgressChart() {
  const [data, setData] = useState<LessonProgressData>({
    completedLessons: 0,
    totalLessons: 0,
  });

  // Fetch lesson progress from backend
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return;

    const userId = JSON.parse(user)._id;

    fetch(`http://localhost:8000/dashboard/progress?user_id=${userId}`)
      .then((res) => res.json())
      .then((res: LessonProgressData) => {
        setData({
          completedLessons: res.completed,
          totalLessons: res.total,
        });
      })
      .catch((err) => console.error("Failed to fetch lesson progress:", err));
  }, []);

  const remainingLessons = Math.max(
    data.totalLessons - data.completedLessons,
    0
  );

  const percentage =
    data.totalLessons > 0
      ? Math.round((data.completedLessons / data.totalLessons) * 100)
      : 0;

  const pieData = [
    { name: "Completed", value: data.completedLessons },
    { name: "Remaining", value: remainingLessons },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lesson Progress</CardTitle>
      </CardHeader>

      <CardContent className="flex items-center gap-6">
        {/* ===== DONUT ===== */}
        <div className="relative h-[120px] w-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={40}
                outerRadius={55}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
              >
                {/* Completed */}
                <Cell className="text-[hsl(var(--chart-1))]" fill="currentColor" />
                {/* Remaining */}
                <Cell className="text-muted" fill="currentColor" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* CENTER TEXT */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-lg font-bold text-foreground">{percentage}%</div>
            <div className="text-[11px] text-muted-foreground">completed</div>
          </div>
        </div>

        {/* ===== INFO ===== */}
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-foreground">{data.completedLessons}</span>{" "}
            lessons completed
          </div>

          <div className="text-sm text-muted-foreground">
            {remainingLessons} lessons remaining
          </div>

          <p className="text-xs text-muted-foreground">
            Complete lessons across all topics to finish the course 🎯
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
