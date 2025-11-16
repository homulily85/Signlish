from fastapi import APIRouter, HTTPException, Header, Body
from db import db
from models.user_model import User, LoginModel
from utils.auth import create_access_token, verify_token
import hashlib
from bson import ObjectId

router = APIRouter(prefix="/users", tags=["Users"])

def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

# -------- REGISTER --------
@router.post("/register")
def register_user(user: User = Body(...)):
    user.name = str(user.name)
    user.email = str(user.email)
    user.password = str(user.password)
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user.password = hash_password(user.password)
    inserted = db.users.insert_one(user.dict())
    token = create_access_token({"sub": str(inserted.inserted_id), "email": user.email})
    return {"token": token, "user": {"name": user.name, "email": user.email}}

# -------- LOGIN --------
@router.post("/login")
def login_user(user: LoginModel = Body(...)):
    user.email = str(user.email)
    user.password = str(user.password)
    db_user = db.users.find_one({"email": user.email})
    if not db_user or db_user["password"] != hash_password(user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(db_user["_id"]), "email": db_user["email"]})
    return {"token": token, "user": {"name": db_user["name"], "email": db_user["email"]}}

# -------- LOGOUT --------
@router.post("/logout")
def logout_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.replace("Bearer ", "")
    try:
        verify_token(token)
        return {"message": "Logged out successfully (frontend should delete token)"}
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# -------- GET CURRENT USER --------
@router.get("/me")
def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    user = db.users.find_one({"_id": ObjectId(payload["sub"])}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["id"] = str(user["_id"])
    return user
