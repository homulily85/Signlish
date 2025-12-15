import TopicCard from "./topic-card";

type Topic = {
  id: string;
  title: string;
  image: string;
  lessons: number;
  hours: number;
};

type TopicGridProps = {
  topics: Topic[];
};

export default function TopicGrid({ topics }: TopicGridProps) {
  return (
    <div className="
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
      gap-x-6
      gap-y-8
    ">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          title={topic.title}
          image={topic.image}
          lessons={topic.lessons}
          hours={topic.hours}
        />
      ))}
    </div>
  );
}
