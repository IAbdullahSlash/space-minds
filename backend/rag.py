import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

import chromadb
from sentence_transformers import SentenceTransformer
from google import genai
from google.genai import types

# Resolve database paths relative to the backend directory
BACKEND_DIR = Path(__file__).parent
DB_PATH = BACKEND_DIR / "demo_data" / "chroma_db"
DB_PATH_EXPANDED = BACKEND_DIR / "demo_data" / "chroma_db_expanded"

COLLECTION_NAME = "bigearthnet_demo"
COLLECTION_NAME_EXPANDED = "bigearthnet_expanded"

print("Loading embedding model...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

print("Connecting to ChromaDB (existing)...")
client = chromadb.PersistentClient(path=str(DB_PATH))

collection = client.get_collection(
    name=COLLECTION_NAME
)

print("Connecting to ChromaDB (expanded)...")
try:
    client_expanded = chromadb.PersistentClient(path=str(DB_PATH_EXPANDED))
    collection_expanded = client_expanded.get_collection(
        name=COLLECTION_NAME_EXPANDED
    )
    
    # Verify expanded collection has documents
    expanded_count = collection_expanded.count()
    print(f"[OK] Expanded collection loaded: {expanded_count} documents")
    if expanded_count < 4500:
        print(f"[WARNING] Expanded collection has only {expanded_count} documents (expected ~5000)")
except Exception as e:
    print(f"[ERROR] Error loading expanded collection: {e}")
    print(f"  Path checked: {DB_PATH_EXPANDED}")
    print(f"  Collection name: {COLLECTION_NAME_EXPANDED}")
    collection_expanded = None

print("Connecting to Gemini...")
gemini_client = genai.Client(
    api_key=os.environ["GEMINI_API_KEY"]
)


CHANGE_CATEGORIES = {
    "land_cover", "vegetation", "agriculture", "forest", "water",
    "built_up", "spatial", "other"
}
CHANGE_DIRECTIONS = {
    "increase", "decrease", "appearance", "disappearance", "expansion",
    "contraction", "no_clear_change"
}
CONFIDENCE_LEVELS = {"high", "medium", "low"}

TEMPORAL_RESPONSE_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "answer": types.Schema(type=types.Type.STRING),
        "change_detected": types.Schema(type=types.Type.BOOLEAN),
        "changes": types.Schema(
            type=types.Type.ARRAY,
            items=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "category": types.Schema(
                        type=types.Type.STRING,
                        enum=sorted(CHANGE_CATEGORIES)
                    ),
                    "direction": types.Schema(
                        type=types.Type.STRING,
                        enum=sorted(CHANGE_DIRECTIONS)
                    ),
                    "observed_change": types.Schema(type=types.Type.STRING),
                    "possible_explanation": types.Schema(type=types.Type.STRING),
                    "confidence": types.Schema(
                        type=types.Type.STRING,
                        enum=sorted(CONFIDENCE_LEVELS)
                    ),
                },
                required=[
                    "category", "direction", "observed_change",
                    "possible_explanation", "confidence"
                ]
            )
        ),
        "environmental_considerations": types.Schema(type=types.Type.STRING),
    },
    required=[
        "answer", "change_detected", "changes", "environmental_considerations"
    ]
)


def normalize_temporal_analysis(parsed_response, response_text):
    """Return a safe, validated temporal-analysis payload from Gemini JSON."""
    if hasattr(parsed_response, "model_dump"):
        parsed_response = parsed_response.model_dump()

    fallback_answer = (
        response_text.strip()
        if isinstance(response_text, str) and response_text.strip()
        else "The temporal analysis could not be structured safely."
    )
    fallback = {
        "answer": fallback_answer,
        "change_detected": False,
        "changes": [],
        "environmental_considerations": (
            "Environmental considerations could not be determined from the "
            "structured model response."
        )
    }

    if not isinstance(parsed_response, dict):
        return fallback

    answer = parsed_response.get("answer")
    if not isinstance(answer, str) or not answer.strip():
        answer = fallback_answer

    environmental_considerations = parsed_response.get("environmental_considerations")
    if not isinstance(environmental_considerations, str):
        environmental_considerations = fallback["environmental_considerations"]

    valid_changes = []
    raw_changes = parsed_response.get("changes")
    if isinstance(raw_changes, list):
        for change in raw_changes:
            if not isinstance(change, dict):
                continue

            category = change.get("category")
            direction = change.get("direction")
            confidence = change.get("confidence")
            observed_change = change.get("observed_change")
            possible_explanation = change.get("possible_explanation")

            if (
                category not in CHANGE_CATEGORIES
                or direction not in CHANGE_DIRECTIONS
                or confidence not in CONFIDENCE_LEVELS
                or not isinstance(observed_change, str)
                or not isinstance(possible_explanation, str)
            ):
                continue

            valid_changes.append({
                "category": category,
                "direction": direction,
                "observed_change": observed_change,
                "possible_explanation": possible_explanation,
                "confidence": confidence
            })

    # A false value always means no meaningful geographic changes are returned.
    change_detected = parsed_response.get("change_detected") is True
    if not change_detected:
        valid_changes = []
    elif not valid_changes:
        change_detected = False

    return {
        "answer": answer,
        "change_detected": change_detected,
        "changes": valid_changes,
        "environmental_considerations": environmental_considerations
    }


def retrieve(query, top_k=5):

    query_embedding = embedding_model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    sources = []

    for i in range(len(results["documents"][0])):

        distance = results["distances"][0][i]

        source = {
            "id": results["ids"][0][i],
            "distance": float(distance),
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i]
        }

        sources.append(source)

    return sources


def retrieve_expanded(query, top_k=3):
    """
    Retrieve similar documents from the expanded BigEarthNet collection.
    
    Uses the same SentenceTransformer embedding model as retrieve().
    
    Args:
        query: User query string
        top_k: Number of top results to return (default: 3)
    
    Returns:
        List of source dictionaries with structure:
        [
            {
                "id": "...",
                "distance": ...,
                "text": "...",
                "metadata": {...}
            }
        ]
    
    Raises:
        RuntimeError: If expanded collection is not available
    """
    if collection_expanded is None:
        raise RuntimeError(
            f"Expanded ChromaDB collection is not available. "
            f"Expected path: {DB_PATH_EXPANDED} with collection '{COLLECTION_NAME_EXPANDED}'"
        )
    
    query_embedding = embedding_model.encode(query).tolist()
    
    results = collection_expanded.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )
    
    sources = []
    
    for i in range(len(results["documents"][0])):
        
        distance = results["distances"][0][i]
        
        source = {
            "id": results["ids"][0][i],
            "distance": float(distance),
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i]
        }
        
        sources.append(source)
    
    return sources


def generate_answer(query, sources):

    context = "\n\n".join(
        f"""
Source {i + 1}:

{source["text"]}
"""
        for i, source in enumerate(sources)
    )

    prompt = f"""
You are a remote sensing question answering assistant.

Answer the user's question using ONLY the retrieved
knowledge provided below.

Retrieved knowledge:

{context}

User question:

{query}

Rules:

Use the retrieved knowledge as the primary source.

Do not invent facts.

If the retrieved knowledge does not contain enough
information to answer the question, say that the
available knowledge is insufficient.

Give a concise and clear answer.
"""

    response = gemini_client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt
    )

    return response.text


def analyze_image(image_bytes, image_mime_type, question):
    """
    Analyze a satellite image using Gemini and answer a question about it.
    
    Args:
        image_bytes: Raw image bytes
        image_mime_type: MIME type of the image (e.g., 'image/jpeg')
        question: User's question about the image
    
    Returns:
        Dictionary with 'answer' and 'visual_description' fields
    """
    
    prompt = f"""
You are a remote sensing expert specialized in satellite image analysis and land cover classification.

Analyze the provided satellite image and answer the following question:

{question}

Rules:
• Analyze only what can reasonably be inferred from the provided satellite image.
• Identify relevant land cover features (agricultural areas, forests, urban zones, water bodies, etc.).
• Answer the user's question based on visual evidence from the image.
• Avoid inventing information that cannot be visually supported.
• Return a concise but useful visual analysis.
• Be specific about spatial patterns, colors, and features observed.
"""

    response = gemini_client.models.generate_content(
        model="gemini-3.5-flash",
        contents=[
            prompt,
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=image_mime_type,
            ),
        ]
    )

    # Extract the response text
    analysis_text = response.text

    return {
        "answer": analysis_text,
        "visual_description": analysis_text
    }

def analyze_image_pair(
    before_image_bytes,
    before_image_mime_type,
    after_image_bytes,
    after_image_mime_type,
    question
):
    """
    Phase 4B.2:
    Temporal satellite change reasoning.

    Analyzes the earlier and later satellite observations
    independently and then performs structured temporal
    reasoning between them.

    Image 1 = earlier observation
    Image 2 = later observation
    """

    # Analyze the earlier image
    before_result = analyze_image(
        before_image_bytes,
        before_image_mime_type,
        "Describe this satellite image carefully for later temporal comparison. "
        "Focus on land cover, vegetation, agriculture, forests, water, "
        "built up areas, exposed soil and other visible geographic features."
    )

    before_description = before_result["visual_description"]

    # Analyze the later image
    after_result = analyze_image(
        after_image_bytes,
        after_image_mime_type,
        "Describe this satellite image carefully for later temporal comparison. "
        "Focus on land cover, vegetation, agriculture, forests, water, "
        "built up areas, exposed soil and other visible geographic features."
    )

    after_description = after_result["visual_description"]

    # Use the two uploaded-image descriptions to find contextual BigEarthNet
    # examples. These references support interpretation only; they are not
    # evidence about the user's particular geographic location or change.
    temporal_rag_query = f"""
Satellite temporal comparison reference query.

Earlier scene characteristics:
{before_description}

Later scene characteristics:
{after_description}

Find reference scenes relevant to land cover, vegetation, agriculture,
forest, water, built-up surfaces, season, environmental context, and visible
geographic patterns represented across these observations.
"""
    similar_scenes = retrieve_expanded(temporal_rag_query, top_k=3)

    reference_context = "\n\n".join(
        f"""BigEarthNet Reference Scene {i + 1} (contextual example only):
ID: {scene['id']}
Similarity Score: {scene['distance']:.4f}
Metadata: {scene['metadata']}

Description:
{scene['text']}"""
        for i, scene in enumerate(similar_scenes)
    )

    # Perform temporal reasoning
    comparison_prompt = f"""
You are an expert remote sensing analyst performing temporal
satellite image analysis.

You are comparing two observations of a geographic scene.

EARLIER OBSERVATION:
{before_description}

LATER OBSERVATION:
{after_description}

BIGEARTHNET REFERENCE CONTEXT:
{reference_context}

USER QUESTION:
{question}

Your task is to identify and explain meaningful geographic
changes between the earlier and later observations.

The earlier observation represents the BEFORE state.

The later observation represents the AFTER state.

Analyze the following categories:

1. Land cover change
2. Vegetation change
3. Agricultural change
4. Forest change
5. Water related change
6. Built up or artificial surface change
7. Spatial expansion or reduction
8. Other meaningful geographic changes

For every meaningful change, determine:

Observed change:
Describe exactly what appears different.

Change direction:
State whether the feature increased, decreased, appeared,
disappeared, expanded or contracted.

Possible interpretation:
Explain what could potentially cause the observed change.

Confidence:
Classify the confidence as High, Medium or Low.

IMPORTANT RULES:

Only report changes that are supported by the available
evidence from both observations.

The uploaded earlier and later observations are the PRIMARY
evidence for this analysis.

The BigEarthNet reference scenes are SUPPORTING CONTEXTUAL
examples only. They may help interpret land cover, seasonal
appearance, environmental context, and geographic patterns.

Do not claim that a retrieved BigEarthNet reference is the
same geographic location as the uploaded images unless that
has been independently established.

Do not use a BigEarthNet reference as proof that a change
occurred in the uploaded images. Ground every claim about
change in the earlier and later observations themselves.

Do not invent geographic changes.

Do not present assumptions as confirmed facts.

Do not automatically interpret differences in appearance
as real geographic changes.

Lighting differences may affect appearance.

Seasonal differences may affect vegetation and agriculture.

Atmospheric conditions may affect image appearance.

Cloud cover may obscure geographic features.

Differences in image quality may affect the comparison.

Differences caused by viewing conditions should not
automatically be classified as actual land cover change.

If the evidence is insufficient, explicitly state that
the change cannot be confidently determined.

Clearly distinguish between:

Observed change

Possible interpretation

No clear change

The final response must answer the user's question directly.

Return a JSON object that exactly follows the provided response schema.

STRUCTURED OUTPUT RULES:

- answer: A human-readable final answer to the user's question, grounded in
  the uploaded observations.
- change_detected: true only when one or more meaningful geographic changes
  are supported by the earlier and later observations.
- changes: Use an empty list when change_detected is false. Otherwise include
  only meaningful changes.
- category: one of land_cover, vegetation, agriculture, forest, water,
  built_up, spatial, or other.
- direction: one of increase, decrease, appearance, disappearance, expansion,
  contraction, or no_clear_change.
- confidence: one of high, medium, or low.
- environmental_considerations: Explain whether season, lighting, atmospheric
  conditions, cloud cover, image quality, or viewing conditions may influence
  the comparison.

Do not claim certainty when the evidence does not support it."""

    response = gemini_client.models.generate_content(
        model="gemini-3.5-flash",
        contents=comparison_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=TEMPORAL_RESPONSE_SCHEMA
        )
    )
    temporal_analysis = normalize_temporal_analysis(
        getattr(response, "parsed", None),
        getattr(response, "text", "")
    )

    return {
        "answer": temporal_analysis["answer"],
        "before_description": before_description,
        "after_description": after_description,
        "similar_scenes": similar_scenes,
        "change_detected": temporal_analysis["change_detected"],
        "changes": temporal_analysis["changes"],
        "environmental_considerations": temporal_analysis[
            "environmental_considerations"
        ]
    }


def analyze_image_with_rag(image_bytes, image_mime_type, question):
    """
    Phase 4A: Vision → RAG → Synthesis pipeline for satellite image analysis.
    
    Combines Gemini vision analysis with expanded BigEarthNet knowledge retrieval.
    
    Pipeline:
    1. Analyze image with Gemini vision to extract visual description
    2. Retrieve similar BigEarthNet scenes using visual description as semantic query
    3. Generate final grounded answer synthesizing visual evidence + BigEarthNet context
    
    Key principles:
    - Uploaded image is PRIMARY visual evidence
    - BigEarthNet context is SUPPORTING KNOWLEDGE
    - Retrieved scenes are reference material, not claims about the uploaded image
    
    Args:
        image_bytes: Raw image bytes
        image_mime_type: MIME type of the image (e.g., 'image/jpeg')
        question: User's question about the image
    
    Returns:
        Dictionary with 'answer', 'visual_description', and 'similar_scenes'
    """
    
    # Step 1: Get visual description from Gemini vision analysis
    visual_result = analyze_image(image_bytes, image_mime_type, question)
    visual_description = visual_result["visual_description"]
    
    # Step 2: Query expanded BigEarthNet collection using visual description
    # Use only the visual description as the semantic query
    similar_scenes = retrieve_expanded(visual_description, top_k=3)
    
    # Step 3: Construct context from retrieved BigEarthNet scenes
    context = "\n\n".join(
        f"""
BigEarthNet Reference Scene {i + 1}:
ID: {scene['id']}
Similarity Score: {scene['distance']:.4f}
Metadata: {scene['metadata']}

Description:
{scene["text"]}
"""
        for i, scene in enumerate(similar_scenes)
    )
    
    # Step 4: Generate final answer with careful synthesis prompt
    synthesis_prompt = f"""
You are a remote sensing expert analyzing a satellite image provided by a user.

UPLOADED IMAGE ANALYSIS (Primary Evidence):
{visual_description}

USER QUESTION:
{question}

SUPPORTING BIGEARTH NET REFERENCE SCENES (Context Only):
{context}

SYNTHESIS INSTRUCTIONS:

Your task is to answer the user's question using:
1. The visual analysis of their uploaded image (PRIMARY EVIDENCE)
2. Supporting BigEarthNet reference scenes as contextual knowledge

CRITICAL RULES:
• The uploaded image analysis is your primary visual evidence
• BigEarthNet scenes are SUPPORTING CONTEXT only - they are reference material
• Do NOT claim that the retrieved BigEarthNet scenes appear in the user's uploaded image
• Do NOT invent visual details that are not supported by the uploaded image analysis
• If the uploaded image and BigEarthNet context provide conflicting information, prioritize what is actually visible in the uploaded image
• If the uploaded image does not contain enough information to answer the question, say so directly
• Use BigEarthNet knowledge to explain patterns and provide context, but ground all claims about the specific image in what the visual analysis shows

ANSWER GENERATION:
• Answer the user's original question concisely
• Base your response on visual evidence from the uploaded image
• Support your answer with BigEarthNet reference knowledge where applicable
• Be specific and practical
"""
    
    response = gemini_client.models.generate_content(
        model="gemini-3.5-flash",
        contents=synthesis_prompt
    )
    
    final_answer = response.text
    
    return {
        "answer": final_answer,
        "visual_description": visual_description,
        "similar_scenes": similar_scenes
    }


def ask(query, top_k=5):

    sources = retrieve(
        query,
        top_k=top_k
    )

    answer = generate_answer(
        query,
        sources
    )

    return {
        "query": query,
        "answer": answer,
        "sources": sources
    }


if __name__ == "__main__":

    while True:

        query = input("\nAsk a question (or type 'exit'): ")

        if query.lower() == "exit":
            break

        result = ask(query)

        print("\n" + "=" * 60)
        print("AI ANSWER")
        print("=" * 60)

        print(result["answer"])

        print("\n" + "=" * 60)
        print("RETRIEVED SOURCES")
        print("=" * 60)

        for i, source in enumerate(result["sources"]):

            print(f"\nSource {i + 1}")
            print(f"ID: {source['id']}")
            print(f"Distance: {source['distance']:.4f}")
            print(f"Metadata: {source['metadata']}")
            print(f"Text: {source['text']}")

            print("-" * 60)