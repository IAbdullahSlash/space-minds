import os

from dotenv import load_dotenv

load_dotenv()

import chromadb
from sentence_transformers import SentenceTransformer
from google import genai
from google.genai import types

DB_PATH = "demo_data/chroma_db"
COLLECTION_NAME = "bigearthnet_demo"

print("Loading embedding model...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

print("Connecting to ChromaDB...")
client = chromadb.PersistentClient(path=DB_PATH)

collection = client.get_collection(
    name=COLLECTION_NAME
)

print("Connecting to Gemini...")
gemini_client = genai.Client(
    api_key=os.environ["GEMINI_API_KEY"]
)


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
        model="gemini-2.5-flash",
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
        model="gemini-2.5-flash",
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