"""
Käsetheke Digital – YOLO Detection Service
FastAPI app running on port 8000

Endpoints:
  POST /detect  – Accepts base64 JPEG frame, returns bounding boxes + OCR text
  GET  /health  – Health check
  GET  /products – List products (convenience)
"""
import base64
import io
import json
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

from detector import CheeseDetector

app = FastAPI(title="Käsetheke YOLO Service", version="1.0.0")

# Allow calls from Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize detector (lazy – model loaded on first request)
detector = CheeseDetector()


class DetectRequest(BaseModel):
    frame: str  # base64-encoded JPEG


class DetectResponse(BaseModel):
    detections: list[dict]
    processing_time_ms: float


@app.get("/health")
def health():
    return {"status": "ok", "service": "käsetheke-yolo"}


@app.get("/products")
def get_products():
    products_path = Path(__file__).parent.parent / "data" / "products.json"
    try:
        with open(products_path) as f:
            return json.load(f)
    except FileNotFoundError:
        return []


@app.post("/detect", response_model=DetectResponse)
def detect(req: DetectRequest):
    t0 = time.time()

    # Decode base64 frame
    try:
        img_bytes = base64.b64decode(req.frame)
        image = Image.open(io.BytesIO(img_bytes))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {e}")

    # Run detection
    try:
        detections = detector.detect(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection error: {e}")

    elapsed_ms = round((time.time() - t0) * 1000, 1)
    return DetectResponse(detections=detections, processing_time_ms=elapsed_ms)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
