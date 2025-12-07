from pydantic import BaseModel
from typing import Optional

class Lesson(BaseModel):
    id: int
    word: str
    instruction: str
    source: str
    category: str
