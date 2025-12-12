import random as pyrandom
import csv
import os
from fastapi import APIRouter, HTTPException
from models.lesson import Lesson
from models.user_progress import UserProgress
from backend.models.question import Question
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



# Load questions from questions.csv for questions
def load_questions():
    csv_path = os.path.join(os.path.dirname(__file__), '../utils/questions.csv')
    questions = []
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            choices = [row['choice1'], row['choice2'], row['choice3'], row['choice4']]
            questions.append({
                'id': int(row['id']),
                'video': row['video'],
                'answer': row['answer'],
                'choices': choices,
                'category': row['category']
            })
    return questions

questions_data = load_questions()

# Question: for each lesson (category), provide a question at the end
@router.get("/lessons/{category}/question", response_model=Question)
async def get_lesson_question(category: str):
    # Find the last question in this category
    questions = [q for q in questions_data if q['category'] == category]
    if not questions:
        raise HTTPException(status_code=404, detail="No question for this lesson")
    q = questions[-1]
    return Question(
        id=q['id'],
        video=q['video'],
        answer=q['answer'],
        choices=q['choices'],
        category=q['category']
    )

# Save question progress for correct answer per lesson
@router.post("/lessons/{category}/question/progress")
async def save_question_progress(user_id: str, category: str):
    user_collection = get_user_collection()
    user = user_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    progress = user.get("progress", {})
    # Mark question as completed for this lesson (use special key)
    question_key = f"{category}_question"
    progress[question_key] = True
    user_collection.update_one({"id": user_id}, {"$set": {"progress": progress}})
    return {"message": "Question for lesson marked as complete", "progress": progress}

# Get question practice progress for all lessons (categories) for a user
@router.get("/user/question_progress", response_model=dict)
async def get_question_progress(user_id: str):
    user_collection = get_user_collection()
    user = user_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    progress = user.get("progress", {})
    question_progress = {}
    for category in set(q['category'] for q in questions_data):
        question_key = f"{category}_question"
        question_progress[category] = bool(progress.get(question_key, False))
    return question_progress


# List all words in a lesson (category) in random order
@router.get("/lessons/{category}/flashcards", response_model=List[Lesson])
async def get_flashcards_random(category: str):
    if category not in lessons_by_category:
        raise HTTPException(status_code=404, detail="Lesson (category) not found")
    
    # Lấy tất cả các từ trong category đã chọn
    flashcards = lessons_by_category[category]
    
    # Trộn flashcards theo thứ tự ngẫu nhiên
    pyrandom.shuffle(flashcards)
    
    return flashcards
