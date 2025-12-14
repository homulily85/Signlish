from pydantic import BaseModel, EmailStr
from typing import Optional


from typing import Dict, List

from typing import Union

class Streak(BaseModel):
    current: int = 0
    last_active_date: Optional[str] = None

class User(BaseModel):
    name: str
    email: str
    password: str
    # progress: category -> list of word ids, or category_flashcard -> bool
    progress: Optional[Dict[str, Union[List[int], bool]]] = None
    streak: Streak = Streak()
