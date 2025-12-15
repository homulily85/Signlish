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
} from "date-fns";
import { useEffect, useState } from "react";

const STORAGE_KEY = "signlish-checkins";

export default function StreakCalendar() {
  const today = new Date();
  const [checkIns, setCheckIns] = useState<Date[]>([]);

  /* ===== LOAD CHECK-IN FROM LOCALSTORAGE ===== */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setCheckIns(JSON.parse(raw).map((d: string) => new Date(d)));
    }
  }, []);

  /* ===== SAVE CHECK-IN ===== */
  const saveCheckIn = (date: Date) => {
    const updated = [...checkIns, date];
    setCheckIns(updated);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated.map((d) => d.toISOString()))
    );
  };

  /* ===== CHECK IF DAY IS CHECKED ===== */
  const isCheckedIn = (day: Date) =>
    checkIns.some((d) => isSameDay(d, day));

  /* ===== AUTO CHECK-IN TODAY (DEMO) ===== */
  useEffect(() => {
    if (!isCheckedIn(today)) {
      saveCheckIn(today);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== STREAK CALCULATION ===== */
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

  /* ===== CALENDAR ===== */
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Learning Streak
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* MONTH */}
        <div className="text-center text-sm font-medium">
          {format(today, "MMMM yyyy")}
        </div>

        {/* WEEK DAYS */}
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
          {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* CALENDAR GRID */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({
            length: (getDay(startOfMonth(today)) + 6) % 7,
          }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysInMonth.map((day) => {
            const checked = isCheckedIn(day);
            const future = isAfter(day, today);

            let style =
              "bg-muted text-muted-foreground";

            if (checked) {
              style = "bg-orange-500 text-white"; // 🔥
            } else if (!future) {
              style = "bg-sky-400 text-white"; // 🧊
            }

            return (
              <div
                key={day.toISOString()}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${style}
                ${isSameDay(day, today) ? "ring-2 ring-primary" : ""}`}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>

        {/* STREAK INFO */}
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
