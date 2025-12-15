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

type TopicProgressProps = {
  learned?: number;
  total?: number;
};

export default function TopicProgressChart({
  learned = 10,
  total = 100,
}: TopicProgressProps) {
  const remaining = Math.max(total - learned, 0);
  const percentage = Math.round((learned / total) * 100);

  const data = [
    { name: "Learned", value: learned },
    { name: "Remaining", value: remaining },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Topic Progress
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
              >
                <Cell fill="#000" />
                <Cell fill="#f0f0f0" />
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
            <span className="font-medium">{learned}</span> topics learned
          </div>
          <div className="text-sm text-muted-foreground">
            {remaining} topics remaining
          </div>
          <p className="text-xs text-muted-foreground">
            Keep learning sign language topics to complete your course 🎯
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
