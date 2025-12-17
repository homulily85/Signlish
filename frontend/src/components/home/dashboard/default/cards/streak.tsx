import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isSameDay,
  startOfMonth,
  subDays,
  addMonths,
  subMonths,
  isSameMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "signlish-checkins";

export default function StreakCalendar() {
  const today = new Date();

  const [checkIns, setCheckIns] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(today)
  );

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setCheckIns(JSON.parse(raw).map((d: string) => new Date(d)));
    }
  }, []);

  const saveCheckIn = (date: Date) => {
    const updated = [...checkIns, date];
    setCheckIns(updated);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated.map((d) => d.toISOString()))
    );
  };

  const isCheckedIn = (day: Date) =>
    checkIns.some((d) => isSameDay(d, day));

  useEffect(() => {
    if (!isCheckedIn(today)) {
      saveCheckIn(today);
    }
  }, []);

  const calculateStreaks = () => {
    let current = 0;
    let longest = 0;
    let cursor = today;

    while (isCheckedIn(cursor)) {
      current++;
      cursor = subDays(cursor, 1);
    }

    let temp = 0;
    for (let i = 0; i < 365; i++) {
      const day = subDays(today, i);
      if (isCheckedIn(day)) {
        temp++;
        longest = Math.max(longest, temp);
      } else {
        temp = 0;
      }
    }

    return { current, longest };
  };

  const { current, longest } = calculateStreaks();

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const isFutureMonth = isAfter(
    startOfMonth(addMonths(currentMonth, 1)),
    today
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Learning Streak
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded p-1 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-sm font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </div>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            disabled={isFutureMonth}
            className="rounded p-1 hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
          {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({
            length:
              (getDay(startOfMonth(currentMonth)) + 6) % 7,
          }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysInMonth.map((day) => {
            const checked = isCheckedIn(day);
            const isFuture = isAfter(day, today);
            const isToday = isSameDay(day, today);

            let style = "bg-muted text-muted-foreground";

            if (isToday || checked) {
              style = "bg-[var(--chart-1)] text-primary-foreground";
            } else if (!isFuture) {
              style = "bg-[var(--chart-4)] text-primary-foreground";
            }

            return (
              <div
                key={day.toISOString()}
                className={`flex h-9 w-9 items-center justify-center
          rounded-full text-sm font-medium
          transition-colors duration-200
          ${style}
          ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}
        `}
              >
                {format(day, "d")}
              </div>
            );
          })}


        </div>

        <div className="flex justify-between text-sm pt-2">
          <span>🔥 Current streak</span>
          <span className="font-bold">{current} days</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>🏆 Longest streak</span>
          <span className="font-bold">{longest} days</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Daily check-in keeps your sign language streak alive.
        </p>
      </CardContent>
    </Card>
  );
}
