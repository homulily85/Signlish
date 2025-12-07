from pydantic import BaseModel
from typing import List

class UserProgress(BaseModel):
    user_id: str
    completed_lessons: List[int] = []
