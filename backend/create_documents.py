import pandas as pd
import json

INPUT_FILE = "demo_data/demo_subset.parquet"
OUTPUT_FILE = "demo_data/rag_documents.json"

df = pd.read_parquet(INPUT_FILE)

documents = []

for index, row in df.iterrows():

    document = f"""
Satellite scene information.

Patch ID: {row['patch_id']}

Location: {row['country']}
Latitude: {row['latitude']}
Longitude: {row['longitude']}

Season: {row['season']}
Climate zone: {row['climate_zone']}

Question: {row['input']}

Answer: {row['output']}

Question type: {row['type']}
Category: {row['category']}
""".strip()

    documents.append({
        "id": f"doc_{index}",
        "patch_id": row["patch_id"],
        "text": document,
        "metadata": {
            "type": row["type"],
            "category": row["category"],
            "country": row["country"],
            "season": row["season"],
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "climate_zone": row["climate_zone"]
        }
    })

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(documents, f, ensure_ascii=False, indent=2)

print(f"Created {len(documents)} RAG documents.")
print(f"Saved to: {OUTPUT_FILE}")