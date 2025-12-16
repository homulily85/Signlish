import { BookOpen, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";

type TopicCardProps = {
  title: string;
  image: string;
  lessons: number;
  hours: number;
};

export default function TopicCard({
  title,
  image,
  lessons,
  hours,
}: TopicCardProps) {
  return (
    <Card className="overflow-hidden transition hover:shadow-md">
      <div className="relative h-40 w-full">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full"
          loading="lazy"
        />
      </div>

      <CardContent className="space-y-3 p-4">
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
