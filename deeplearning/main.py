import sys
import os
import json
import re
import difflib
import pandas as pd
from inference_sdk import InferenceHTTPClient

def error_response(message):
    print(json.dumps({"error": message}), file=sys.stderr)
    sys.exit(1)

# Validasi argumen
if len(sys.argv) < 2:
    error_response("Image path not provided")

image_path = sys.argv[1]

if not os.path.exists(image_path):
    error_response(f"Image file not found: {image_path}")

try:
    CLIENT = InferenceHTTPClient(
        api_url="https://serverless.roboflow.com",
        api_key="2zPnKDXa7BIAl7vtMTMj"
    )

    result = CLIENT.infer(image_path, model_id="snapcal/1")

    if not result['predictions']:
        print(json.dumps({
            "class": None,
            "confidence": 0,
            "nutrition": None,
            "message": "Tidak ada makanan terdeteksi dalam gambar"
        }))
        sys.exit(0)

    best = max(result['predictions'], key=lambda x: x['confidence'])
    class_name = best['class'].lower()
    confidence = round(best['confidence'] * 100, 2)

    df = pd.read_csv('deeplearning/nutrition.csv')

    # Normalisasi nama pada dataframe dan prediksi
    df['name'] = df['name'].astype(str).str.lower().str.strip()
    df['name_cleaned'] = df['name'].apply(lambda x: re.sub(r'\s+', ' ', x.replace('-', ' ')))

    class_name_cleaned = class_name.replace('-', ' ').strip().lower()

    # Gunakan fuzzy matching untuk cari yang paling mirip
    candidates = df['name_cleaned'].tolist()
    closest = difflib.get_close_matches(class_name_cleaned, candidates, n=1, cutoff=0.5)

    if closest:
        match = df[df['name_cleaned'] == closest[0]]
    else:
        match = pd.DataFrame()  # Tidak ketemu

    nutrition = None
    if not match.empty:
        row = match.iloc[0]
        nutrition = {
            "calories": float(row['calories']),
            "proteins": float(row['proteins']),
            "fat": float(row['fat']),
            "carbohydrate": float(row['carbohydrate']),
        }

    print(json.dumps({
        "class": class_name,
        "confidence": f"{confidence}%",
        "nutrition": nutrition,
        "message": "Berhasil mendeteksi makanan"
    }))

except Exception as e:
    error_response(str(e))
