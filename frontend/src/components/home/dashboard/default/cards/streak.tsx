"use client";

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
  isBefore,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export default function StreakCalendar() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(today)
  );

  /* ================= FAKE DATA ================= */

  // 4 ngày gần nhất (không tính hôm nay)
  const last4Days = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) =>
        subDays(today, i + 1)
      ),
    [today]
  );

  // random các ngày cũ hơn có màu chart-4
  const randomHighlight = (day: Date) => {
    // chỉ random cho ngày trước last 4
    if (!isBefore(day, subDays(today, 4))) return false;
    // xác suất ~35%
    return Math.random() < 0.35;
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const isFutureMonth = isAfter(
    startOfMonth(addMonths(currentMonth, 1)),
    today
  );

  /* ================= RENDER ================= */
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Learning Streak (Fake)
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ===== Month navigation ===== */}
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentMonth(subMonths(currentMonth, 1))
            }
            className="rounded p-1 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-sm font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </div>

          <button
            onClick={() =>
              setCurrentMonth(addMonths(currentMonth, 1))
            }
            disabled={isFutureMonth}
            className="rounded p-1 hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ===== Weekday labels ===== */}
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* ===== Calendar days ===== */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells */}
          {Array.from({
            length:
              (getDay(startOfMonth(currentMonth)) + 6) %
              7,
          }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysInMonth.map((day) => {
            const isToday = isSameDay(day, today);
            const isFuture = isAfter(day, today);

            let style =
              "bg-muted text-muted-foreground";

            // 🔵 Today → chart-1
            if (isToday) {
              style =
                "bg-[var(--chart-1)] text-primary-foreground";
            }

            // 🟢 4 ngày gần nhất → chart-4
            else if (
              last4Days.some((d) => isSameDay(d, day))
            ) {
              style =
                "bg-[var(--chart-4)] text-primary-foreground";
            }

            // 🎲 Các ngày cũ → random chart-4
            else if (!isFuture && randomHighlight(day)) {
              style =
                "bg-[var(--chart-4)] text-primary-foreground";
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

        {/* ===== Fake info ===== */}
        <div className="flex justify-between text-sm pt-2">
          <span>🔥 Current streak</span>
          <span className="font-bold">5 days</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>🏆 Longest streak</span>
          <span className="font-bold">21 days</span>
        </div>

        <p className="text-xs text-muted-foreground">
          This is a fake UI preview for streak calendar.
        </p>
      </CardContent>
    </Card>
  );
}
