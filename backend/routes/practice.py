import csv
import os
import random
from typing import List

from db import get_user_collection, get_activity_collection
from fastapi import APIRouter
from models.lesson import Lesson
from models.question import Question
from models.dictionary_item import DictionaryItem

router = APIRouter(prefix="/practice")

BASE_DIR = os.path.dirname(__file__)


def load_words() -> List[Lesson]:
    path = os.path.join(BASE_DIR, "../data/words.csv")
    lessons: List[Lesson] = []

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lessons.append(
                Lesson(
                    id=int(row["id"]),
                    definition=row["definition"],
                    word=row["word"],
                    instruction=row.get("instruction", ""),
                    source=row.get("source", ""),
                    category=row.get("category", "uncategorized"),
                )
            )
    return lessons


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


@router.get("/vision", response_model=List[DictionaryItem])
async def vision_words():
    result: list[DictionaryItem] = []

    for lesson in LESSONS:
        result.append(
            DictionaryItem(
                word=lesson.word,
                definition=lesson.definition,
                instruction=lesson.instruction,
                source=lesson.source,
                category=lesson.category,
                id=str(lesson.id),
            )
        )

    random.shuffle(result)
    return result
