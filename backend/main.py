from fastapi import FastAPI

from routes import sign_language_processor
from routes import user

app = FastAPI()

app.include_router(user.router)
app.include_router(sign_language_processor.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}
