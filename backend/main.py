from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag import ask


app = FastAPI(
    title="BigEarthNet RAG API",
    description="RAG API for satellite scene question answering",
    version="1.0.0"
)

# Configure CORS to allow requests from the React development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str


@app.get("/")
def root():
    return {
        "status": "online",
        "message": "BigEarthNet RAG API is running"
    }


@app.post("/ask")
def ask_question(request: QueryRequest):

    result = ask(request.query)

    return result