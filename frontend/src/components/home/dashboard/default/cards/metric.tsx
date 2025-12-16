import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
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

const lastWeekTotal = 280;

export default function WeeklyStudyTimeCard({
  className,
}: {
  className?: string;
}) {
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const diff = totalMinutes - lastWeekTotal;
  const diffPercent = Math.round((diff / lastWeekTotal) * 100);
  const isIncrease = diff >= 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">
          Weekly Study Time
        </CardTitle>
        <CardDescription>
          Time spent learning Signlish this week!
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="h-[250px] text-muted-foreground">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 24, right: 16, left: 0, bottom: 24 }}
            >
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                padding={{ left: 16, right: 16 }}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={32}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                cursor={{ stroke: "hsl(var(--border))" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-md bg-background px-3 py-2 shadow-md border border-border">
                        <div className="text-sm font-medium text-foreground">
                          {payload[0].payload.day}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payload[0].value} minutes
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line
                type="monotone"
                dataKey="minutes"
                stroke="currentColor"
                strokeWidth={2}
                dot={{ r: 4, fill: "currentColor" }}
                activeDot={{ r: 6, fill: "currentColor" }}
              >
                <LabelList
                  dataKey="minutes"
                  position="top"
                  fill="currentColor"
                  fontSize={12}
                  offset={8}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 box items-center gap-2 text-sm pt-10">
          <span
            className={
              isIncrease
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            {isIncrease ? "▲" : "▼"} {Math.abs(diff)} minutes
          </span>
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {diffPercent > 0 ? "+" : ""}
                {Math.abs(diffPercent)}%
              </span>{" "}
              compared to last week
              <span className="ml-1">👏</span>
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                This week:
                <span className="ml-1 font-medium text-foreground">
                  {totalMinutes} min
                </span>
              </span>

              <span className="opacity-50">•</span>

              <span>
                Last week:
                <span className="ml-1 font-medium text-foreground">
                  {lastWeekTotal} min
                </span>
              </span>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
