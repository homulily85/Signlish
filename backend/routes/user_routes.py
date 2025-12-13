import os
import random
import smtplib
from email.mime.text import MIMEText

from auth.jwt import create_access_token
from auth.middleware import JWTBearer
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from fastapi import Depends
from models.user_model import User
from pydantic import BaseModel
from schemas.user import LoginRequest, UserInDB, UserCreate
from schemas.user import UserCreate, UserInDB
from service.user_service import create_user
from service.user_service import create_user, get_user_by_email, get_user_by_name

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

router = APIRouter()


class RegisterInitRequest(BaseModel):
    email: str
    name: str
    password: str


class RegisterVerifyRequest(BaseModel):
    email: str
    otp: str


temp_users = {}


def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(to_email, otp):
    msg = MIMEText(f"Your OTP is: {otp}")
    msg['Subject'] = "Your Registration OTP"
    msg['From'] = SMTP_USER
    msg['To'] = to_email
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, [to_email], msg.as_string())


@router.post("/register/initiate")
async def initiate_registration(req: RegisterInitRequest):
    otp = generate_otp()
    temp_users[req.email] = {
        "name": req.name,
        "password": req.password,
        "otp": otp
    }
    send_otp_email(req.email, otp)
    return {"message": "OTP sent to email"}


@router.post("/register/verify")
async def verify_registration(req: RegisterVerifyRequest):
    user = temp_users.get(req.email)
    if not user or user["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    # Create user in DB
    user_obj = User(name=user["name"], email=req.email, password=user["password"])
    create_user(user_obj)
    del temp_users[req.email]
    return {"message": "Registration complete"}


def serialize_user(user: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict"""
    return {**user, "_id": str(user["_id"])}


@router.post("/login")
async def login(request: LoginRequest):
    identifier = request.identifier
    password = request.password
    # Try to find user by email first
    user = get_user_by_email(identifier)
    if not user:
        # Try to find user by name
        user = get_user_by_name(identifier)
    if not user or user.get("password") != password:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    # Generate JWT token
    token = create_access_token({"sub": str(user["_id"]), "email": user["email"]})
    return {
        "user": serialize_user(user),
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/protected")
async def protected_route(payload=Depends(JWTBearer())):
    return {"message": "You are authenticated!", "user": payload}


# from auth.google import verify_google_token
# Google OAuth login/register endpoint
@router.post("/google-login")
async def google_login(payload: dict):
    token = payload.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Missing token")
    google_user = verify_google_token(token)
    user = get_user_by_email(google_user['email'])
    if not user:
        user_obj = User(name=google_user['name'], email=google_user['email'], password="")
        create_user(user_obj)
        user = get_user_by_email(google_user['email'])
    jwt_token = create_access_token({"sub": user["id"], "email": user["email"]})
    return {"user": user, "access_token": jwt_token, "token_type": "bearer"}


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


reset_otps = {}


def generate_reset_otp():
    return str(random.randint(100000, 999999))


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    user = get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    otp = generate_reset_otp()
    reset_otps[req.email] = otp
    send_otp_email(req.email, otp)
    return {"message": "OTP sent to email"}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    otp = reset_otps.get(req.email)
    if not otp or otp != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    user = get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["password"] = req.new_password
    user_collection = get_user_by_email.__globals__["get_user_collection"]()
    user_collection.update_one({"email": req.email}, {"$set": {"password": req.new_password}})
    del reset_otps[req.email]
    return {"message": "Password reset successful"}
