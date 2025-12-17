from pydantic import BaseModel, Field


class Lesson(BaseModel):
    id: int = Field(..., example=1)
    word: str = Field(..., example="Hello")
    definition: str = Field("", example="Way to say greet")
    instruction: str = Field("", example="Wave your hand")
    source: str = Field("", example="video_hello.mp4")
    category: str = Field(..., example="greetings")

    class Config:
        orm_mode = True
