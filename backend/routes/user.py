from fastapi import APIRouter, HTTPException, Depends, Header
from backend.db import db
from backend.models.user import User
from backend.utils.auth import create_access_token, verify_token
import hashlib

router = APIRouter(prefix="/users", tags=["Users"])

def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

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

    token = create_access_token({"sub": str(user["_id"]), "email": user["email"]})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/logout")
def logout_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = authorization.replace("Bearer ", "")
    try:
        verify_token(token)
        return {"message": "Logged out successfully (client should delete token)"}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

