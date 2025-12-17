from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes import text_to_sign
from routes import dictionary
from routes import lesson
from routes import speech_to_text
from routes import sign_language_processor
from routes import user_routes
from routes import dashboard
from routes import practice

origins = [
    "http://localhost:5173",
    "null",
]
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/dictionary/thumbnails", StaticFiles(directory="data/thumbnails"), name="thumbnails")
app.include_router(lesson.router)

app.include_router(user_routes.router)

app.include_router(dictionary.router)

app.include_router(text_to_sign.router)

app.include_router(speech_to_text.router)

app.include_router(sign_language_processor.router)

app.include_router(dashboard.router)

app.include_router(practice.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}
