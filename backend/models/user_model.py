from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    name: str
    email: str
    password: str
