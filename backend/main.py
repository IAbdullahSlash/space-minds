from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag import ask, analyze_image_with_rag


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
        "http://localhost:5174",
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
    Phase 4A: Vision → RAG → Synthesis satellite image analysis.
    
    Multimodal pipeline combining image vision with BigEarthNet context retrieval:
    
    1. Analyze uploaded image with Gemini vision to extract visual description
    2. Query expanded BigEarthNet collection using visual description
    3. Synthesize uploaded image evidence + BigEarthNet reference context
    
    Key principle:
    - Uploaded image is PRIMARY visual evidence
    - BigEarthNet scenes are SUPPORTING CONTEXT (not claims about the uploaded image)
    
    Request (multipart/form-data):
    - image: Uploaded satellite image file
    - question: Text question about the image
    
    Response:
    {
        "answer": "Grounded answer combining visual evidence + BigEarthNet context",
        "visual_description": "Visual description extracted from the uploaded image",
        "similar_scenes": [
            {
                "id": "BigEarthNet scene ID",
                "distance": 0.123,
                "text": "Scene description",
                "metadata": {...}
            }
        ]
    }
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
        
        # Analyze the image using Vision → RAG → Synthesis pipeline
        result = analyze_image_with_rag(
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