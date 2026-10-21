# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/courses")
def get_courses():
    return [
        {"id": 1, "title": "HTTP 기초", "price": 0},
        {"id": 2, "title": "FastAPI 입문", "price": 22000},
        {"id": 3, "title": "Next.js 첫걸음", "price": 33000},
    ]