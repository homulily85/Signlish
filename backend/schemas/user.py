from pydantic import BaseModel
class LoginRequest(BaseModel):
    identifier: str
    password: str
from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    totp_secret: str
    otp: str

class UserInDB(UserCreate):
    id: str
