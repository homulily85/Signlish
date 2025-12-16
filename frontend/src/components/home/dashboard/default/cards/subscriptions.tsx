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

const data = [
  { day: "Mon", learned: 12 },
  { day: "Tue", learned: 18 },
  { day: "Wed", learned: 10 },
  { day: "Thu", learned: 22 },
  { day: "Fri", learned: 15 },
  { day: "Sat", learned: 20 },
  { day: "Sun", learned: 25 },
];

export default function LearningProgressCard() {
  const totalThisWeek = data.reduce((sum, d) => sum + d.learned, 0);
  const totalLastWeek = 122;
  const percentChange = Math.round(
    ((totalThisWeek - totalLastWeek) / totalLastWeek) * 100
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Signs Learned (7 days)
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {totalThisWeek} signs
        </div>

        <p className="text-xs text-muted-foreground">
          {percentChange > 0 ? "+" : ""}
          {percentChange}% compared to last week
        </p>

        <div className="mt-4 h-[120px] text-foreground">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="day"
                tick={{
                  fontSize: 12,
                  fill: "hsl(var(--muted-foreground))",
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const day = payload[0].payload.day;
                    const value = payload[0].value;

                    return (
                      <div
                        className="flex items-center gap-2 rounded-full bg-background px-3 py-1 shadow-md"
                        style={{ border: "1px solid hsl(var(--border))" }}
                      >
                        <span className="h-2 w-2 rounded-sm bg-current" />
                        <span className="text-xs text-muted-foreground">
                          {day}
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          {value}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar
                dataKey="learned"
                radius={[6, 6, 0, 0]}
                fill="currentColor"
              >
                <LabelList
                  dataKey="learned"
                  position="top"
                  fill="currentColor"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </CardContent>
    </Card>
  );
}
