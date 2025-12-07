from fastapi import APIRouter, HTTPException
from models.lesson import Lesson
from models.user_progress import UserProgress
from db import get_user_collection
from typing import List

router = APIRouter()

# Example lessons (replace with DB in production)
lessons = [
    Lesson(id=0, word="I/me", instruction="Using an 'I' handshake", source="https://d2drp7fo8uq4gv.cloudfront.net/bd9841c2-0ab4-4bdf-b36c-950c34d30d1e.mp4", category="pronouns")
]

@router.get("/lessons", response_model=List[Lesson])
async def get_lessons():
    return lessons

@router.get("/user/progress", response_model=UserProgress)
async def get_user_progress(user_id: str):
    user_collection = get_user_collection()
    user = user_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    progress = user.get("progress", {"completed_lessons": []})
    return UserProgress(user_id=user_id, completed_lessons=progress.get("completed_lessons", []))

@router.post("/user/progress/complete")
async def complete_lesson(user_id: str, lesson_id: int):
    user_collection = get_user_collection()
    user = user_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    progress = user.get("progress", {"completed_lessons": []})
    if lesson_id not in progress["completed_lessons"]:
        progress["completed_lessons"].append(lesson_id)
        user_collection.update_one({"id": user_id}, {"$set": {"progress": progress}})
    return {"message": "Lesson marked as complete", "progress": progress}
