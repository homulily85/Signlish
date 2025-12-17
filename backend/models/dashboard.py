from pydantic import BaseModel
from typing import List

class DailyMetric(BaseModel):
    day: str
    minutes: int

class WeeklyStudyResponse(BaseModel):
    data: List[DailyMetric]
    total_minutes: int
    last_week_total: int
    diff_minutes: int
    diff_percent: int


class BarMetric(BaseModel):
    day: str
    learned: int


class LessonProgressResponse(BaseModel):
    completed: int
    total: int
    percentage: int


class StreakResponse(BaseModel):
    current: int
    longest: int
    checkins: List[str]  # ISO dates
