import os
import random
import smtplib
from email.mime.text import MIMEText
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from service.user_service import create_user
from models.user_model import User

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# Temporary storage for demo (use DB/Redis in production)
temp_users = {}

class RegisterInitRequest(BaseModel):
    email: str
    name: str
    password: str

class RegisterVerifyRequest(BaseModel):
    email: str
    otp: str

router = APIRouter()

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
