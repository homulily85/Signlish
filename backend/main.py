from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from routes import sign_language_processor
from routes import user_routes
origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
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
# app.include_router(sign_language_processor.router)

app.include_router(user_routes.router)
# app.include_router(sign_language_processor.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}
