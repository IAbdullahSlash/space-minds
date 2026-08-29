import os

from dotenv import load_dotenv

load_dotenv()

import chromadb
from sentence_transformers import SentenceTransformer
from google import genai

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