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

type LessonProgressProps = {
  completedLessons?: number; // số lesson đã học
  totalLessons?: number;     // tổng số lesson
};

export default function LessonProgressChart({
  completedLessons = 24,
  totalLessons = 80,
}: LessonProgressProps) {
  const remainingLessons = Math.max(
    totalLessons - completedLessons,
    0
  );

  const percentage =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  const data = [
    { name: "Completed", value: completedLessons },
    { name: "Remaining", value: remainingLessons },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Lesson Progress
        </CardTitle>
      </CardHeader>

      <CardContent className="flex items-center gap-6">
        {/* ===== DONUT ===== */}
        <div className="relative h-[120px] w-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={40}
                outerRadius={55}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
              >
                {/* Completed */}
                <Cell fill="#000000" />
                {/* Remaining */}
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* CENTER TEXT */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-lg font-bold">
              {percentage}%
            </div>
            <div className="text-[11px] text-muted-foreground">
              completed
            </div>
          </div>
        </div>

        {/* ===== INFO ===== */}
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">
              {completedLessons}
            </span>{" "}
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
