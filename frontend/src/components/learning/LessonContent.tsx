import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Lesson } from "@/types/lesson";

type LessonContentProps = {
  lesson: Lesson;
  lessonIndex: number;
  totalLessons: number;
  isFirstLesson: boolean;
  isLastLesson: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export default function LessonContent({
  lesson,
  lessonIndex,
  totalLessons,
  isFirstLesson,
  isLastLesson,
  onPrevious,
  onNext,
}: LessonContentProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Badge */}
      <div className="flex justify-between items-center">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          Lesson {lessonIndex + 1} of {totalLessons}
        </Badge>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">{lesson.word}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Section */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={lesson.videoUrl || "/placeholder.svg"}
              alt={`Sign for ${lesson.word}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="lg" className="rounded-full w-16 h-16" variant="secondary">
                <Play className="w-8 h-8" />
              </Button>
            </div>
          </div>

          {/* Definition */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Definition</h3>
            <p className="text-muted-foreground text-lg">{lesson.definition}</p>
          </div>

          {/* Instruction */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">How to Sign</h3>
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <p className="text-foreground">{lesson.instruction}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={isFirstLesson}
          className="flex-1 max-w-xs"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </Button>

        <Button
          variant="default"
          size="lg"
          onClick={onNext}
          className="flex-1 max-w-xs"
        >
          {isLastLesson ? "Go to Practice" : "Next Lesson"}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
