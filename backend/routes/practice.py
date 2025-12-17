import csv
import os
import random
from datetime import date, timedelta
from typing import List, Dict

from fastapi import APIRouter, HTTPException

from db import get_user_collection, get_activity_collection
from models.lesson import Lesson
from models.question import Question

router = APIRouter(prefix="/practice")

BASE_DIR = os.path.dirname(__file__)

def load_words() -> List[Lesson]:
    path = os.path.join(BASE_DIR, "../utils/words.csv")
    lessons: List[Lesson] = []

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lessons.append(
                Lesson(
                    id=int(row["id"]),
                    word=row["word"],
                    instruction=row.get("instruction", ""),
                    source=row.get("source", ""),
                    category=row.get("category", "uncategorized"),
                )
            )
    return lessons


def load_questions():
    path = os.path.join(BASE_DIR, "../utils/questions.csv")
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


LESSONS = load_words()
QUESTIONS = load_questions()

@router.get("/flashcards", response_model=List[Lesson])
async def flashcards():
    words = LESSONS.copy()
    random.shuffle(words)
    return words

@router.get("/question", response_model=List[Question])
async def questions():
    ques = QUESTIONS.copy()
    random.shuffle(ques)
    return ques