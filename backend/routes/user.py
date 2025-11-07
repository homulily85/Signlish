from fastapi import APIRouter, HTTPException, Depends, Header
from db import db
from models.user import User
import hashlib

router = APIRouter(prefix="/users", tags=["Users"])

def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

@router.get("/")
def users_root():
    return {"message": "Welcome to the Users endpoint!"}

@router.post("/register")
def register_user(user: User):
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user.password = hash_password(user.password)
    db.users.insert_one(user.dict())
    return {"message": "User registered successfully"}

@router.post("/login")
def login_user(email: str, password: str):
    user = db.users.find_one({"email": email})
    if not user or user["password"] != hash_password(password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_info = {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"]
    }
    return {"message": "Login successful", "user": user_info}

