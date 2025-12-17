from pydantic import BaseModel
from typing import List

class Question(BaseModel):
    id: int
    video: str
    answer: str  
    choices: List[str] 
    category: str
