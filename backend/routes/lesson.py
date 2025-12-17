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


@router.get("/", response_model=List[str])
async def list_lessons():
    return CATEGORIES


@router.get("/{category}", response_model=List[Lesson])
async def get_lesson(category: str):
    if category not in LESSONS_BY_CATEGORY:
        raise HTTPException(404, "Lesson not found")
    return LESSONS_BY_CATEGORY[category]



@router.get("/{category}/flashcards", response_model=List[Lesson])
async def flashcards(category: str):
    if category not in LESSONS_BY_CATEGORY:
        raise HTTPException(404, "Lesson not found")

    words = LESSONS_BY_CATEGORY[category].copy()
    random.shuffle(words)
    return words

@router.get("/user/progress")
async def get_progress(email: str):
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



@router.post("/user/progress/complete")
async def complete_word(email: str, category: str, word_id: int):
    if category not in LESSONS_BY_CATEGORY:
        raise HTTPException(404, "Lesson not found")

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


@router.get("/{category}/question", response_model=Question)
async def get_question(category: str):
    qs = [q for q in QUESTIONS if q["category"] == category]
    if not qs:
        raise HTTPException(404, "No question")

    return Question(**qs[-1])



@router.post("/{category}/question/complete")
async def complete_question(email: str, category: str):
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

