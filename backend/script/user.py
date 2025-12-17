from datetime import date, timedelta
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]

users = db["users"]
activity = db["user_activity"]

EMAIL = "vietanh1220057a@gmail.com"

# ===== LẤY USER_ID nếu tồn tại =====
user = users.find_one({"email": EMAIL})

if user:
    user_id = user["_id"]
    # Xóa activity theo user_id
    activity.delete_many({"user_id": user_id})
    # Xóa user
    users.delete_one({"_id": user_id})
else:
    user_id = None  # user chưa tồn tại

# ===== INSERT USER =====
user_doc = {
    "name": "Viet Anh",
    "email": EMAIL,
    "password": "88888888",
    "created_at": "2024-12-01",
    "streak": {
        "current": 5,
        "longest": 12,
        "last_active_date": date.today().isoformat()
    },
    "progress": {
        "pronouns": list(range(1, 7)),     
        "people": list(range(1, 5)),  
        "question": list(range(1, 6)),  
        "communication": list(range(1, 7)),     
    }
}

insert_result = users.insert_one(user_doc)
user_id = insert_result.inserted_id  # Lấy _id mới

# ===== INSERT ACTIVITY =====
minutes = [30, 45, 20, 60, 40, 75, 50]
signs = [12, 18, 10, 22, 15, 20, 25]
today = date.today()

for i in range(7):
    d = today - timedelta(days=6 - i)
    activity.insert_one({
        "user_id": user_id,
        "date": d.isoformat(),
        "study_minutes": minutes[i],
        "signs_learned": signs[i]
    })

print("✅ Mock user seeded successfully!")
print(f"👉 user_id = {user_id}")
