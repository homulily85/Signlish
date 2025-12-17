from fastapi import APIRouter, HTTPException, Query
from datetime import date, timedelta
from collections import defaultdict
from db import get_user_collection, get_activity_collection
from models.dashboard import (
    WeeklyStudyResponse,
    LessonProgressResponse,
    StreakResponse
)
from bson import ObjectId


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/weekly-study", response_model=WeeklyStudyResponse)
async def weekly_study(user_id: str = Query(..., description="ID of the user")):
    user_collection = get_user_collection()
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    activity_col = get_activity_collection()

    today = date.today()
    start = today - timedelta(days=6)

    records = list(activity_col.find({
        "user_id": ObjectId(user_id),
        "date": {"$gte": start.isoformat(), "$lte": today.isoformat()}
    }))
    day_map = defaultdict(int)
    for r in records:
        day_map[r["date"]] += r.get("study_minutes", 0)

    data = []
    total = 0
    for i in range(7):
        d = start + timedelta(days=i)
        minutes = day_map.get(d.isoformat(), 0)
        total += minutes
        data.append({
            "day": d.strftime("%a"),
            "minutes": minutes
        })

    last_week_total = 280  # có thể tính thật sau
    diff = total - last_week_total
    percent = round((diff / last_week_total) * 100) if last_week_total else 0
    return {
        "data": data,
        "total_minutes": total,
        "last_week_total": last_week_total,
        "diff_minutes": diff,
        "diff_percent": percent
    }
    
@router.get("/weekly-signs")
async def weekly_signs_learned(user_id: str = Query(..., description="ID of the user")):
    user_collection = get_user_collection()
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    activity_col = get_activity_collection()
    today = date.today()
    start = today - timedelta(days=6)

    records = list(activity_col.find({
        "user_id": ObjectId(user_id),
        "date": {"$gte": start.isoformat(), "$lte": today.isoformat()}
    }))

    day_map = defaultdict(int)
    for r in records:
        day_map[r["date"]] += r.get("signs_learned", 0)

    data = []
    total = 0
    for i in range(7):
        d = start + timedelta(days=i)
        value = day_map.get(d.isoformat(), 0)
        total += value
        data.append({
            "day": d.strftime("%a"),
            "learned": value
        })

    return {
        "data": data,
        "total_this_week": total,
        "total_last_week": 122
    }

@router.get("/progress", response_model=LessonProgressResponse)
async def lesson_progress(user_id: str = Query(..., description="ID of the user")):
    user_collection = get_user_collection()
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    progress = user.get("progress", {})
    completed = sum(len(v) for k, v in progress.items() if isinstance(v, list))

    total_lessons = 200

    percent = round((completed / total_lessons) * 100) if total_lessons else 0
    # print(percent, completed, total_lessons)
    return {
        "completed": completed,
        "total": total_lessons,
        "percentage": percent
    }


@router.get("/streak", response_model=StreakResponse)
async def get_streak(user_id: str = Query(..., description="ID of the user")):
    user_col = get_user_collection()
    activity_col = get_activity_collection()

    user_collection = get_user_collection()
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    streak = user.get("streak", {"current": 0, "longest": 0})

    records = activity_col.find({"user_id": ObjectId(user_id)})
    checkins = [r["date"] for r in records]

    return {
        "current": streak.get("current", 0),
        "longest": streak.get("longest", 0),
        "checkins": checkins
    }


