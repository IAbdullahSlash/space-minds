import pandas as pd

INPUT_FILE = "BigEarthNet.txt.parquet"
OUTPUT_FILE = "demo_data/demo_subset.parquet"

COLUMNS = [
    "patch_id",
    "input",
    "output",
    "type",
    "category",
    "latitude",
    "longitude",
    "country",
    "season",
    "climate_zone",
]

print("Reading dataset...")

df = pd.read_parquet(
    INPUT_FILE,
    engine="pyarrow",
    columns=COLUMNS
)

print(f"Total rows: {len(df):,}")

patch_ids = df["patch_id"].drop_duplicates().head(100)

subset = df[df["patch_id"].isin(patch_ids)]

subset.to_parquet(
    OUTPUT_FILE,
    index=False
)

print(f"Unique patches selected: {subset['patch_id'].nunique()}")
print(f"Rows selected: {len(subset):,}")
print(f"Saved to: {OUTPUT_FILE}")