from pydantic import BaseModel, Field
from typing import List


class Question(BaseModel):
    id: int = Field(..., example=10)
    video: str = Field(..., example="question1.mp4")
    answer: str = Field(..., example="A")
    choices: List[str] = Field(..., example=["A", "B", "C", "D"])
    category: str = Field(..., example="alphabet")

    class Config:
        orm_mode = True
