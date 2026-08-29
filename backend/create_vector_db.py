import json
import chromadb
from sentence_transformers import SentenceTransformer

DOCUMENTS_FILE = "demo_data/rag_documents.json"
DB_PATH = "demo_data/chroma_db"
COLLECTION_NAME = "bigearthnet_demo"

print("Loading documents...")

with open(DOCUMENTS_FILE, "r", encoding="utf-8") as f:
    documents = json.load(f)

print(f"Documents loaded: {len(documents)}")

print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Creating ChromaDB...")

client = chromadb.PersistentClient(path=DB_PATH)

collection = client.get_or_create_collection(
    name=COLLECTION_NAME
)

print("Generating embeddings...")

texts = [doc["text"] for doc in documents]
ids = [doc["id"] for doc in documents]
metadatas = [doc["metadata"] for doc in documents]

embeddings = model.encode(
    texts,
    show_progress_bar=True
)

print("Adding documents to ChromaDB...")

collection.add(
    ids=ids,
    documents=texts,
    metadatas=metadatas,
    embeddings=embeddings.tolist()
)

print()
print("Vector database created successfully.")
print(f"Documents stored: {collection.count()}")
print(f"Database location: {DB_PATH}")