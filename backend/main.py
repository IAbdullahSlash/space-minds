from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag import ask, analyze_image


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


@app.post("/analyze")
async def analyze_satellite_image(
    image: UploadFile = File(...),
    question: str = Form(...)
):
    """
    Analyze a satellite image and answer a question about it.
    
    Accepts:
    - image: Uploaded image file (multipart/form-data)
    - question: Text question about the image (multipart/form-data)
    
    Returns:
    - answer: Gemini's analysis of the image
    - visual_description: Same as answer for current implementation
    """
    
    # Validate that an image was actually uploaded
    if image is None or image.filename == "":
        raise HTTPException(
            status_code=400,
            detail="No image file provided"
        )
    
    # Validate that question is provided
    if not question or not question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty"
        )
    
    # Validate MIME type is image/*
    if image.content_type is None or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {image.content_type}. Expected image file."
        )
    
    try:
        # Read the image bytes
        image_bytes = await image.read()
        
        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Image file is empty"
            )
        
        # Analyze the image using Gemini
        result = analyze_image(
            image_bytes=image_bytes,
            image_mime_type=image.content_type,
            question=question.strip()
        )
        
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Catch any other errors from Gemini API or processing
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing image: {str(e)}"
        )