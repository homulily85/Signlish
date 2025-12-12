# Flashcard endpoint: returns a random lesson as a flashcard question

import random as pyrandom
import csv
import os
from fastapi import APIRouter, HTTPException
from models.lesson import Lesson
from models.user_progress import UserProgress
from models.flashcard import Flashcard
from db import get_user_collection
from typing import List

router = APIRouter()



# Load words from CSV and organize by category (lesson)
def load_words_by_category():
    csv_path = os.path.join(os.path.dirname(__file__), '../utils/words.csv')
    lessons_by_category = {}
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            lesson = Lesson(
                id=int(row['id']),
                word=row['word'],
                instruction=row.get('instrustion', '') or '',
                source=row.get('source', '') or '',
                category=row.get('category', '') or ''
            )
            cat = lesson.category or 'uncategorized'
            if cat not in lessons_by_category:
                lessons_by_category[cat] = []
            lessons_by_category[cat].append(lesson)
    return lessons_by_category

lessons_by_category = load_words_by_category()
all_categories = list(lessons_by_category.keys())



# List all lessons (categories)
@router.get("/lessons", response_model=List[str])
async def get_lessons():
    return all_categories

# List all words in a lesson (category)
@router.get("/lessons/{category}", response_model=List[Lesson])
async def get_words_in_lesson(category: str):
    if category not in lessons_by_category:
        raise HTTPException(status_code=404, detail="Lesson (category) not found")
    return lessons_by_category[category]



# Get progress for all lessons (categories) for a user
@router.get("/user/progress", response_model=dict)
async def get_user_progress(user_id: str):
    user_collection = get_user_collection()
    user = user_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    progress = user.get("progress", {})
    # Compose progress info for each lesson (category)
    lesson_progress = {}
    for category in all_categories:
        total = len(lessons_by_category[category])
        completed = len(progress.get(category, []))
        lesson_progress[category] = {
            "total": total,
            "completed": completed,
            "completed_word_ids": progress.get(category, [])
        }
    return lesson_progress


# Mark a word as completed in a lesson (category) for a user
@router.post("/user/progress/complete")
async def complete_word(user_id: str, category: str, word_id: int):
    user_collection = get_user_collection()
    user = user_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    progress = user.get("progress", {})
    if category not in progress:
        progress[category] = []
    if word_id not in progress[category]:
        progress[category].append(word_id)
        user_collection.update_one({"id": user_id}, {"$set": {"progress": progress}})
    return {"message": "Word marked as complete in lesson", "progress": progress}




# Flashcards: pick a random word from any lesson
all_words = [lesson for lessons in lessons_by_category.values() for lesson in lessons]
flashcards = [
    Flashcard(source=l.source, answer=l.word) for l in all_words
]


@router.get("/flashcard", response_model=Flashcard)
async def get_flashcard():
    if not flashcards:
        raise HTTPException(status_code=404, detail="No flashcards available")
    flashcard = pyrandom.choice(flashcards)
    return flashcard