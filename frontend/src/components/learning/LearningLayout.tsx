import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import LearningSidebar from "@/components/learning/LearningSidebar";
import LessonContent from "@/components/learning/LessonContent";
import PracticeSection from "@/components/learning/PracticeSection";
import { getTopicBySlug, getAllVocabularyWords } from "@/types/lesson";

export default function LearningLayout() {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();

  const topic = topicSlug ? getTopicBySlug(topicSlug) : null;

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(
    topic?.lessons[0]?.id || null
  );
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  // Redirect if topic not found
  useEffect(() => {
    if (!topic) {
      navigate("/learn");
    }
  }, [topic, navigate]);

  if (!topic) {
    return null;
  }

  // Get current lesson
  const currentLesson = topic.lessons.find((lesson) => lesson.id === currentLessonId);
  const currentLessonIndex = topic?.lessons.findIndex((lesson) => lesson.id === currentLessonId) ?? -1;

  // Get all vocabulary words for practice
  const allVocabularyWords = topicSlug ? getAllVocabularyWords(topicSlug) : [];

  const handleLessonSelect = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setIsPracticeMode(false);
  };

  const handlePracticeSelect = () => {
    setIsPracticeMode(true);
    setCurrentLessonId(null);
  };

  const handlePrevious = () => {
    if (!topic) return;
    
    const currentIndex = topic.lessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex > 0) {
      const previousLesson = topic.lessons[currentIndex - 1];
      setCurrentLessonId(previousLesson.id);
    }
  };

  const handleNext = () => {
    if (!topic || !currentLessonId) return;

    // Mark current lesson as completed
    setCompletedLessonIds((prev) => new Set(prev).add(currentLessonId));

    const currentIndex = topic.lessons.findIndex((l) => l.id === currentLessonId);
    const isLastLesson = currentIndex === topic.lessons.length - 1;

    if (isLastLesson) {
      // Go to practice mode
      handlePracticeSelect();
    } else {
      // Go to next lesson
      const nextLesson = topic.lessons[currentIndex + 1];
      setCurrentLessonId(nextLesson.id);
    }
  };

  const handleBackFromPractice = () => {
    if (!topic) return;
    
    setIsPracticeMode(false);
    // Go back to last lesson
    const lastLesson = topic.lessons[topic.lessons.length - 1];
    setCurrentLessonId(lastLesson.id);
  };

  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = topic ? currentLessonIndex === topic.lessons.length - 1 : false;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="w-80 flex-shrink-0">
        <LearningSidebar
          topicTitle={topic.title}
          lessons={topic.lessons}
          currentLessonId={currentLessonId}
          isPracticeMode={isPracticeMode}
          completedLessonIds={completedLessonIds}
          onLessonSelect={handleLessonSelect}
          onPracticeSelect={handlePracticeSelect}
        />
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1">
        {isPracticeMode ? (
          <PracticeSection
            vocabularyWords={allVocabularyWords}
            topicTitle={topic.title}
            onBack={handleBackFromPractice}
          />
        ) : currentLesson ? (
          <LessonContent
            lesson={currentLesson}
            lessonIndex={currentLessonIndex}
            totalLessons={topic.lessons.length}
            isFirstLesson={isFirstLesson}
            isLastLesson={isLastLesson}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a lesson to start learning</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
