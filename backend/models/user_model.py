from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class Streak(BaseModel):
    current: int = 0
    longest: int = 0
    last_active_date: Optional[str] = None


class User(BaseModel):
    name: str = Field(..., example="Nguyen Van A")
    email: str = Field(..., example="user@gmail.com")
    password: str = Field(..., example="hashed_password")
    progress: Dict[str, List[int]] = {}
    streak: Streak = Streak()

    class Config:
        orm_mode = True
