export type Topic = {
  id: string;
  title: string;
  image: string;
  lessons: number;
  hours: number;
};

const IMAGE_URL = "https://static.vecteezy.com/system/resources/thumbnails/049/590/642/small/parents-and-children-clipart-happy-family-cartoon-illustration-vector.jpg";
export const topics: Topic[] = [
  {
    id: "greetings",
    title: "Basic Greetings",
    image: IMAGE_URL,
    lessons: 10,
    hours: 2,
  },
  {
    id: "family",
    title: "Family & Relatives",
    image: "https://img.freepik.com/free-vector/open-hand-vector-illustration_1308-169733.jpg?semt=ais_hybrid&w=740&q=80",
    lessons: 12,
    hours: 3,
  },
  {
    id: "daily-activities",
    title: "Daily Activities",
    image: IMAGE_URL,
    lessons: 15,
    hours: 4,
  },
  {
    id: "emotions",
    title: "Emotions & Feelings",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Z_8VmxfR4Otm9K-0b6NKmPDlxWzIykQ_tg&s",
    lessons: 8,
    hours: 2,
  },
  {
    id: "school",
    title: "School Life",
    image: IMAGE_URL,
    lessons: 14,
    hours: 3.5,
  },
  {
    id: "food",
    title: "Food & Drinks",
    image: IMAGE_URL,
    lessons: 11,
    hours: 2.5,
  },
  {
    id: "numbers",
    title: "Numbers & Counting",
    image: IMAGE_URL,
    lessons: 9,
    hours: 2,
  },
  {
    id: "colors",
    title: "Colors & Shapes",
    image: IMAGE_URL,
    lessons: 7,
    hours: 1.5,
  },
  {
    id: "animals",
    title: "Animals",
    image: IMAGE_URL,
    lessons: 13,
    hours: 3,
  },
  {
    id: "weather",
    title: "Weather & Seasons",
    image: IMAGE_URL,
    lessons: 6,
    hours: 1.5,
  },
  {
    id: "transport",
    title: "Transportation",
    image: IMAGE_URL,
    lessons: 10,
    hours: 2.5,
  },
  {
    id: "health",
    title: "Health & Body",
    image: IMAGE_URL,
    lessons: 12,
    hours: 3,
  },
  {
    id: "hobbies",
    title: "Hobbies & Sports",
    image: IMAGE_URL,
    lessons: 9,
    hours: 2,
  },
  {
    id: "places",
    title: "Places Around Us",
    image: IMAGE_URL,
    lessons: 11,
    hours: 2.5,
  },
  {
    id: "time",
    title: "Time & Schedule",
    image: IMAGE_URL,
    lessons: 8,
    hours: 1.5,
  },
  {
    id: "technology",
    title: "Technology Basics",
    image: IMAGE_URL,
    lessons: 10,
    hours: 2.5,
  },
  {
    id: "safety",
    title: "Safety & Rules",
    image: IMAGE_URL,
    lessons: 7,
    hours: 1.5,
  },
  {
    id: "nature",
    title: "Nature & Environment",
    image: IMAGE_URL,
    lessons: 12,
    hours: 3,
  },
  {
    id: "stories",
    title: "Simple Stories",
    image: IMAGE_URL,
    lessons: 14,
    hours: 4,
  },
  {
    id: "conversation",
    title: "Everyday Conversations",
    image: IMAGE_URL,
    lessons: 16,
    hours: 4.5,
  },
];
