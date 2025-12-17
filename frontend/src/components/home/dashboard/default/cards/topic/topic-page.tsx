import { topics } from "./topic";
import TopicGrid from "./topic-gird";

export default function MyCoursesPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <TopicGrid topics={topics} />
    </div>
  );
}
