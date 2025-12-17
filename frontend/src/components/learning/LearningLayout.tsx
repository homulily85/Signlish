import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import LearningSidebar from "@/components/learning/LearningSidebar";
import LessonContent from "@/components/learning/LessonContent";
import PracticeSection from "@/components/learning/PracticeSection";
import { useTopic } from "@/hooks/useTopic";

const API_BASE = "http://localhost:8000";

export default function LearningLayout() {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();


  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user?.email;

  const { topic, loading } = useTopic(topicSlug!, email);

  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set());

  // redirect nếu không có topic
  useEffect(() => {
    if (!loading && !topic) {
      navigate("/learn");
    }
  }, [loading, topic, navigate]);

  // set lesson đầu tiên khi load xong
  useEffect(() => {
    if (topic && topic.lessons.length > 0) {
      setCurrentLessonId(topic.lessons[0].id);
    }
  }, [topic]);

  if (loading || !topic) return null;

  const currentLesson = topic.lessons.find(l => l.id === currentLessonId) || null;
  const currentLessonIndex =
    topic.lessons.findIndex(l => l.id === currentLessonId);

  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === topic.lessons.length - 1;

  /* ================= handlers ================= */

  const handleLessonSelect = (lessonId: number) => {
    setCurrentLessonId(lessonId);
    setIsPracticeMode(false);
  };

  const handlePracticeSelect = () => {
    setIsPracticeMode(true);
    setCurrentLessonId(null);
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonId(topic.lessons[currentLessonIndex - 1].id);
    }
  };

  const completeLesson = async (lessonId: number) => {
    try {
      await fetch(`${API_BASE}/lessons/user/progress/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          category: topic.id,
          word_id: lessonId,
        }),
      });

      setCompletedLessonIds(prev => new Set(prev).add(lessonId));
    } catch (err) {
      console.error("Complete lesson failed", err);
    }
  };

  const handleNext = async () => {
    if (!currentLesson) return;

    await completeLesson(currentLesson.id);

    if (isLastLesson) {
      handlePracticeSelect();
    } else {
      setCurrentLessonId(topic.lessons[currentLessonIndex + 1].id);
    }
  };

  const handleBackFromPractice = () => {
    setIsPracticeMode(false);
    setCurrentLessonId(topic.lessons[topic.lessons.length - 1].id);
  };

  /* ================= render ================= */

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
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

      {/* Content */}
      <ScrollArea className="flex-1">
        {isPracticeMode ? (
          <PracticeSection
            vocabularyWords={topic.lessons}
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
            <p className="text-muted-foreground">
              Select a lesson to start learning
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
