# crud/user.py
from db import get_user_collection
from models.user_model import User
from schemas.user import UserCreate
from bson import ObjectId

def create_user(user: UserCreate):
    user_collection = get_user_collection()
    new_user = user.dict()
    result = user_collection.insert_one(new_user)
    new_user['id'] = str(result.inserted_id)
    return new_user


def get_user_by_email(email: str):
    user_collection = get_user_collection()
    user = user_collection.find_one({"email": email})
    if user:
        user['id'] = str(user['_id'])
        return user
    return None

def get_user_by_name(name: str):
    user_collection = get_user_collection()
    user = user_collection.find_one({"name": name})
    if user:
        user['id'] = str(user['_id'])
        return user
    return None
