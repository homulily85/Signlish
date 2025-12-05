from auth.middleware import JWTBearer
from fastapi import Depends
# Example protected endpoint

from fastapi import APIRouter, HTTPException
from schemas.user import UserCreate, UserInDB
from service.user_service import create_user, get_user_by_email, get_user_by_name
from schemas.user import LoginRequest, UserInDB, UserCreate
from auth.jwt import create_access_token
import pyotp

router = APIRouter()

@router.post("/register", response_model=UserInDB)
async def register(user: UserCreate):
    existing_user = get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists.")
    # Verify OTP
    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(user.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP.")
    return create_user(user)

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
    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return {"user": user, "access_token": token, "token_type": "bearer"}

@router.get("/protected")
async def protected_route(payload=Depends(JWTBearer())):
    return {"message": "You are authenticated!", "user": payload}