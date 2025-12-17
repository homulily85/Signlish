import TopicGrid from "./topic-gird";
import { useTopics } from "@/hooks/useTopics";

export default function MyCoursesPage() {
  const user = localStorage.getItem("user");
  if (!user) return;
  const userEmail = JSON.parse(user).email;
  const { topics, loading } = useTopics(userEmail);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <TopicGrid topics={topics} />
    </div>
  );
}
