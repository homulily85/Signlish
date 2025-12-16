import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
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

export default function WeeklyStudyTimeCard({
  className,
}: {
  className?: string;
}) {
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">
          Weekly Study Time
        </CardTitle>
        <CardDescription>
          Time spent learning Signlish this week ({totalMinutes} minutes).
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 24, right: 16, left: 0, bottom: 0 }}
            >
              {/* X AXIS */}
              <XAxis
                dataKey="day"
                tickLine={false}
                padding={{ left: 16, right: 16 }}
                axisLine={false}
                tick={{
                  fontSize: 12,
                  fill: "hsl(var(--muted-foreground))",
                }}
              />

              {/* TOOLTIP – THEME AWARE */}
              <Tooltip
                cursor={{ stroke: "hsl(var(--border))" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div
                        className="rounded-md bg-background px-3 py-2 shadow-md"
                        style={{
                          border: "1px solid hsl(var(--border))",
                        }}
                      >
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

              {/* LINE */}
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "hsl(var(--foreground))",
                }}
                activeDot={{
                  r: 6,
                  fill: "hsl(var(--foreground))",
                }}
              >
                {/* LABEL ON DOT */}
                <LabelList
                  dataKey="minutes"
                  position="top"
                  fill="hsl(var(--foreground))"
                  fontSize={12}
                  offset={8}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
