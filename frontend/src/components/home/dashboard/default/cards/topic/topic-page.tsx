import { topics } from "./topic";
import TopicGrid from "./topic-gird";

export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      <TopicGrid topics={topics} />
    </div>
  );
}
