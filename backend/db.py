from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]

def get_user_collection():
    col = db["users"]
    # chỉ tạo index nếu chưa tồn tại
    indexes = col.index_information()
    if "email_1" not in indexes:
        col.create_index([("email", ASCENDING)], unique=True)
    return col

def get_activity_collection():
    return db["user_activity"]
