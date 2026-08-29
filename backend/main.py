from fastapi import FastAPI
from pydantic import BaseModel

from rag import ask


app = FastAPI(
    title="BigEarthNet RAG API",
    description="RAG API for satellite scene question answering",
    version="1.0.0"
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