from pydantic import BaseModel
from typing import List

class Flashcard(BaseModel):
    id: int
    video: str  # video URL
    answer: str  # correct word/phrase
    choices: List[str]  # 4 choices
    category: str
