import csv
import os
import random
from datetime import date, timedelta
from typing import List, Dict

from fastapi import APIRouter, HTTPException

from db import get_user_collection, get_activity_collection
from models.lesson import Lesson
from models.question import Question

router = APIRouter(prefix="/lessons", tags=["Lessons"])

BASE_DIR = os.path.dirname(__file__)

def load_words_by_category() -> Dict[str, List[Lesson]]:
    path = os.path.join(BASE_DIR, "../data/words.csv")
    result: Dict[str, List[Lesson]] = {}

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lesson = Lesson(
                id=int(row["id"]),
                word=row["word"],
                definition = row["definition"],
                instruction=row.get("instruction", ""),
                source=row.get("source", ""),
                category=row.get("category", "uncategorized"),
            )
            result.setdefault(lesson.category, []).append(lesson)

    return result


def load_questions():
    path = os.path.join(BASE_DIR, "../data/questions.csv")
    questions = []

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            questions.append({
                "id": int(row["id"]),
                "video": row["video"],
                "answer": row["answer"],
                "choices": [
                    row["choice1"],
                    row["choice2"],
                    row["choice3"],
                    row["choice4"],
                ],
                "category": row["category"],
            })
    return questions

# Load words and questions
LESSONS_BY_CATEGORY = load_words_by_category()
QUESTIONS = load_questions()
CATEGORIES = list(LESSONS_BY_CATEGORY.keys())

def update_streak(user_col, email: str):
    today = date.today()
    user = user_col.find_one({"email": email})
    if not user:
        return

    streak = user.get("streak", {})
    current = streak.get("current", 0)
    longest = streak.get("longest", 0)
    last_active = streak.get("last_active_date")

    if last_active:
        last_active = date.fromisoformat(last_active)
        if last_active == today:
            return
        elif last_active == today - timedelta(days=1):
            current += 1
        else:
            current = 1
    else:
        current = 1

    longest = max(longest, current)

    user_col.update_one(
        {"email": email},
        {"$set": {
            "streak.current": current,
            "streak.longest": longest,
            "streak.last_active_date": today.isoformat()
        }}
    )


def log_activity(email: str, minutes=0, signs=0):
    col = get_activity_collection()
    today = date.today().isoformat()

    col.update_one(
        {"email": email, "date": today},
        {"$inc": {
            "study_minutes": minutes,
            "signs_learned": signs
        }},
        upsert=True
    )


# Routes for retrieving lessons
@router.get("/", response_model=List[str])
async def list_categories():
    """List all available categories of lessons."""
    return CATEGORIES

@router.get("/categories/{category}/lessons", response_model=List[Lesson])
async def get_lessons_by_category(category: str):
    """Get all lessons in a specific category."""
    if category not in LESSONS_BY_CATEGORY:
        raise HTTPException(404, "Category not found")
    return LESSONS_BY_CATEGORY[category]

@router.get("/categories/{category}/flashcards", response_model=List[Lesson])
async def get_flashcards_by_category(category: str):
    """Get shuffled flashcards for a specific category."""
    if category not in LESSONS_BY_CATEGORY:
        raise HTTPException(404, "Category not found")

    words = LESSONS_BY_CATEGORY[category].copy()
    random.shuffle(words)
    return words

# Routes for progress management
@router.get("/users/{email}/progress")
async def get_user_progress(email: str):
    """Get progress for the user (completed lessons in each category)."""
    user = get_user_collection().find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")
    
    progress = user.get("progress", {})
    result = {}

    for cat in CATEGORIES:
        completed = progress.get(cat, [])
        result[cat] = {
            "completed": len(completed),
            "total": len(LESSONS_BY_CATEGORY[cat]),
            "word_ids": completed
        }
    return result

@router.post("/users/{email}/progress/{category}/lessons/{word_id}/complete")
async def mark_lesson_complete(email: str, word_id: int, category: str):
    """Mark a specific lesson as completed by the user."""
    if category not in LESSONS_BY_CATEGORY:
        raise HTTPException(404, "Category not found")

    user_col = get_user_collection()
    user = user_col.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")

    progress = user.get("progress", {})
    completed = set(progress.get(category, []))

    if word_id in completed:
        return {"status": "already_completed"}

    completed.add(word_id)
    progress[category] = list(completed)

    user_col.update_one(
        {"email": email},
        {"$set": {"progress": progress}}
    )

    update_streak(user_col, email)
    log_activity(email, minutes=2, signs=1)

    return {"status": "completed"}


# Routes for handling questions
@router.get("/categories/{category}/questions", response_model=Question)
async def get_question_by_category(category: str):
    """Get the most recent question for a specific category."""
    qs = [q for q in QUESTIONS if q["category"] == category]
    if not qs:
        raise HTTPException(404, "No question available for this category")
    return Question(**qs[-1])

@router.post("/users/{email}/questions/{category}/complete")
async def mark_question_complete(email: str, category: str):
    """Mark a question in a category as completed for the user."""
    user_col = get_user_collection()
    user = user_col.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")

    progress = user.get("progress", {})
    key = f"{category}_question"

    if progress.get(key):
        return {"status": "already_completed"}

    progress[key] = True

    user_col.update_one(
        {"email": email},
        {"$set": {"progress": progress}}
    )

    update_streak(user_col, email)
    log_activity(email, minutes=3)

    return {"status": "completed"}
