from pydantic import BaseModel

class Flashcard(BaseModel):
    source: str  # video URL
    answer: str  # correct word/phrase
