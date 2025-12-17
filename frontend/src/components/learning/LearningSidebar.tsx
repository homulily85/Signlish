import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, BookOpen, Trophy } from "lucide-react";
import type { Lesson } from "@/types/lesson";

type LearningSidebarProps = {
  topicTitle: string;
  lessons: Lesson[];
  currentLessonId: string | null;
  isPracticeMode: boolean;
  completedLessonIds: Set<string>;
  onLessonSelect: (lessonId: string) => void;
  onPracticeSelect: () => void;
};

export default function LearningSidebar({
  topicTitle,
  lessons,
  currentLessonId,
  isPracticeMode,
  completedLessonIds,
  onLessonSelect,
  onPracticeSelect,
}: LearningSidebarProps) {
  return (
    <Card className="h-screen flex flex-col border-r rounded-none">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-foreground mb-2">{topicTitle}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>{lessons.length} lessons</span>
        </div>
      </div>

      {/* Lesson List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {lessons.map((lesson, index) => {
            const isActive = currentLessonId === lesson.id && !isPracticeMode;
            const isCompleted = completedLessonIds.has(lesson.id);

            return (
              <Button
                key={lesson.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start h-auto py-3 px-4 ${isActive
                  ? "bg-primary/10 hover:bg-primary/20"
                  : isCompleted
                    ? "bg-green-100 text-green-800"
                    : "text-muted-foreground"
                  }`}
                onClick={() => onLessonSelect(lesson.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : isActive
                        ? "border-primary"
                        : "border-muted-foreground/30"
                      }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-left flex-1">
                    Lesson {index + 1}: {lesson.word}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Practice Section */}
        <div className="p-4 pb-6">
          <Button
            variant={isPracticeMode ? "secondary" : "ghost"}
            className={`w-full justify-start h-auto py-4 px-4 ${isPracticeMode
              ? "bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 dark:hover:bg-purple-900"
              : ""
              }`}
            onClick={onPracticeSelect}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-bold">Practice</div>
                <div className="text-xs text-muted-foreground">Test your knowledge</div>
              </div>
              {isPracticeMode && <Badge variant="secondary">Active</Badge>}
            </div>
          </Button>
        </div>
      </ScrollArea>
    </Card>
  );
}
