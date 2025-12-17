export type VocabularyWord = {
  id: string;
  word: string;
  definition: string;
  videoUrl: string;
  instruction: string;
  wrongOptions: string[];
};

// 1 Lesson = 1 Vocabulary Word
export type Lesson = {
  id: string;
  word: string;
  definition: string;
  videoUrl: string;
  instruction: string;
  wrongOptions: string[];
};

export type TopicWithLessons = {
  id: string;
  title: string;
  lessons: Lesson[];
};

// Mock lesson data - 1 Lesson = 1 Word
export const topicsWithLessons: TopicWithLessons[] = [
  {
    id: "greetings",
    title: "Basic Greetings",
    lessons: [
      {
        id: "hello",
        word: "Hello",
        definition: "A greeting used when meeting someone",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Wave your hand from side to side near your head",
        wrongOptions: ["Goodbye", "Thank You", "Please"],
      },
      {
        id: "goodbye",
        word: "Goodbye",
        definition: "A farewell used when leaving",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Wave your hand away from your body",
        wrongOptions: ["Hello", "Thank You", "Sorry"],
      },
      {
        id: "thank-you",
        word: "Thank You",
        definition: "An expression of gratitude",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Move your hand from your chin outward",
        wrongOptions: ["Hello", "Sorry", "Welcome"],
      },
      {
        id: "please",
        word: "Please",
        definition: "A polite word used when asking for something",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Rub your hand in a circular motion on your chest",
        wrongOptions: ["Thank You", "Yes", "No"],
      },
      {
        id: "sorry",
        word: "Sorry",
        definition: "An expression of apology or regret",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Make a circular motion over your chest with your fist",
        wrongOptions: ["Excuse Me", "Hello", "Help"],
      },
      {
        id: "excuse-me",
        word: "Excuse Me",
        definition: "A polite way to get someone's attention",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Tap your fingers on your shoulder",
        wrongOptions: ["Sorry", "Please", "Welcome"],
      },
    ],
  },
  {
    id: "family",
    title: "Family & Relatives",
    lessons: [
      {
        id: "mother",
        word: "Mother",
        definition: "A female parent",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Touch your thumb to your chin",
        wrongOptions: ["Father", "Sister", "Grandmother"],
      },
      {
        id: "father",
        word: "Father",
        definition: "A male parent",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Touch your thumb to your forehead",
        wrongOptions: ["Mother", "Brother", "Grandfather"],
      },
      {
        id: "brother",
        word: "Brother",
        definition: "A male sibling",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Start at forehead, move hand down to chest",
        wrongOptions: ["Sister", "Father", "Uncle"],
      },
      {
        id: "sister",
        word: "Sister",
        definition: "A female sibling",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Start at chin, move hand down to chest",
        wrongOptions: ["Brother", "Mother", "Aunt"],
      },
    ],
  },
  {
    id: "emotions",
    title: "Emotions & Feelings",
    lessons: [
      {
        id: "happy",
        word: "Happy",
        definition: "Feeling joy or pleasure",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Brush your hand upward on your chest with a smile",
        wrongOptions: ["Sad", "Angry", "Excited"],
      },
      {
        id: "sad",
        word: "Sad",
        definition: "Feeling sorrow or unhappiness",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Move both hands down in front of your face",
        wrongOptions: ["Happy", "Angry", "Worried"],
      },
      {
        id: "angry",
        word: "Angry",
        definition: "Feeling strong displeasure",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Claw hand moves down in front of your face",
        wrongOptions: ["Happy", "Sad", "Scared"],
      },
      {
        id: "excited",
        word: "Excited",
        definition: "Feeling enthusiastic and eager",
        videoUrl: "/placeholder.svg?height=300&width=400",
        instruction: "Both hands brush up on chest alternately with energy",
        wrongOptions: ["Bored", "Tired", "Calm"],
      },
    ],
  },
];

// Helper function to get topic by slug
export function getTopicBySlug(slug: string): TopicWithLessons | undefined {
  return topicsWithLessons.find((topic) => topic.id === slug);
}

// Helper function to get all vocabulary words for a topic (lessons ARE vocabulary words now)
export function getAllVocabularyWords(topicSlug: string): VocabularyWord[] {
  const topic = getTopicBySlug(topicSlug);
  if (!topic) return [];
  
  return topic.lessons.map((lesson) => ({
    id: lesson.id,
    word: lesson.word,
    definition: lesson.definition,
    videoUrl: lesson.videoUrl,
    instruction: lesson.instruction,
    wrongOptions: lesson.wrongOptions,
  }));
}
