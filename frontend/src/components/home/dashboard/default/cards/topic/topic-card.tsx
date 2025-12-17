import { BookOpen, Clock, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";

type TopicCardProps = {
  id: string;
  title: string;
  image: string;
  lessons: number;
  hours: number;
  progress?: number;
};

export default function TopicCard({
  id,
  title,
  image,
  lessons,
  hours,
  progress,
}: TopicCardProps) {
  const navigate = useNavigate();
  const safeProgress = Math.min(100, Math.max(0, progress ?? 0));

  const isDone = safeProgress === 100;

  const handleClick = () => {
    navigate(`/learning/${id}`);
  };

  return (
    <Card
      className="overflow-hidden transition hover:shadow-md cursor-pointer"
      onClick={handleClick}
    >
      {/* IMAGE */}
      <div className="relative h-40 w-full">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center block"
        />
      </div>

      {/* PROGRESS BAR */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2">
          {/* BAR */}
          <div className="relative h-2 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-primary"
              style={{
                width: `${safeProgress}%`,
              }}
            />
          </div>

          {/* LABEL */}
          {isDone ? (
            <span className="flex items-center gap-1 text-xs font-medium text-foreground">
              <Trophy className="h-4 w-4" />
              Done
            </span>
          ) : (
            <span className="text-xs font-medium text-foreground">
              {safeProgress}%
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <CardContent className="space-y-3 p-4 pt-2">
        <CardTitle className="text-base line-clamp-1">
          {title}
        </CardTitle>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{lessons} lessons</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{hours} hours</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
