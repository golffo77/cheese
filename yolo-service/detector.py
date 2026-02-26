"""
YOLOv8 cheese detector with EasyOCR label reading and fuzzy product matching.

Strategy:
1. YOLOv8 detects cheese regions (using food/general model or custom weights)
2. For each detection, crop the area BELOW the bounding box (price label zone)
3. EasyOCR reads the label text
4. Fuzzy-match against products.json labelKeywords
"""
import json
import time
from difflib import get_close_matches
from pathlib import Path
from typing import Optional

import numpy as np
from PIL import Image
from ultralytics import YOLO

from ocr import OCRReader


# Load products database
PRODUCTS_PATH = Path(__file__).parent.parent / "data" / "products.json"


def load_products() -> list[dict]:
    try:
        with open(PRODUCTS_PATH) as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[Detector] products.json not found at {PRODUCTS_PATH}")
        return []


def fuzzy_match(text: str, products: list[dict]) -> Optional[str]:
    """Match OCR text to a product ID via fuzzy keyword matching."""
    if not text:
        return None

    # Build keyword → product_id mapping
    all_keywords = [
        (kw.lower(), p["id"])
        for p in products
        for kw in p.get("labelKeywords", [])
    ]
    keyword_list = [k for k, _ in all_keywords]
    kw_to_id = {k: pid for k, pid in all_keywords}

    # Try each word in the OCR text
    for word in text.split():
        word_lower = word.lower().strip(".,;:-")
        if len(word_lower) < 3:
            continue
        matches = get_close_matches(word_lower, keyword_list, n=1, cutoff=0.75)
        if matches:
            return kw_to_id.get(matches[0])

    return None


class CheeseDetector:
    # YOLO class IDs that indicate food/cheese-like objects
    # YOLOv8n COCO: 46=banana, 47=apple, 48=sandwich, 49=orange,
    # 50=broccoli, 53=pizza, 54=donut, 55=cake, 56=chair
    # We use a broad set and filter by confidence
    FOOD_CLASS_IDS = {46, 47, 48, 49, 50, 51, 52, 53, 54, 55}
    # If no food class detected, fall back to ANY detection above threshold
    FALLBACK_MIN_CONFIDENCE = 0.35
    # Label zone: pixels below the bounding box to read
    LABEL_HEIGHT_PX = 70
    # OCR cache: skip re-running OCR if box moved less than this fraction
    POSITION_CACHE_THRESHOLD = 0.05

    def __init__(self):
        self.products = load_products()
        self.ocr = OCRReader()
        self._model: Optional[YOLO] = None
        # Cache: bbox_key → (label_text, product_id)
        self._ocr_cache: dict[str, tuple[str, Optional[str]]] = {}

    def _get_model(self) -> YOLO:
        if self._model is not None:
            return self._model

        # Prefer custom cheese model, fall back to YOLOv8n
        custom_path = Path(__file__).parent / "models" / "cheese_yolov8.pt"
        if custom_path.exists():
            print(f"[Detector] Loading custom model: {custom_path}")
            self._model = YOLO(str(custom_path))
        else:
            print("[Detector] Loading YOLOv8n base model (no custom weights found)")
            self._model = YOLO("yolov8n.pt")

        return self._model

    def _bbox_cache_key(self, x1: float, y1: float, x2: float, y2: float) -> str:
        # Round to 2 decimal places for cache key stability
        return f"{x1:.2f},{y1:.2f},{x2:.2f},{y2:.2f}"

    def detect(self, image: Image.Image) -> list[dict]:
        """
        Run detection on a PIL image.
        Returns list of detection dicts with keys:
            bbox, confidence, label_text, product_id
        """
        t0 = time.time()
        model = self._get_model()
        W, H = image.size

        # Run YOLO inference
        img_array = np.array(image.convert("RGB"))
        results = model(img_array, verbose=False)

        detections = []
        for box in results[0].boxes:
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])

            # Filter: accept food classes OR any high-confidence detection
            is_food = cls_id in self.FOOD_CLASS_IDS
            if not is_food and conf < self.FALLBACK_MIN_CONFIDENCE:
                continue

            x1, y1, x2, y2 = [float(v) for v in box.xyxy[0]]

            # Crop BELOW the bounding box for price label
            label_y1 = min(y2, H - 1)
            label_y2 = min(y2 + self.LABEL_HEIGHT_PX, H)
            label_region = image.crop((x1, label_y1, x2, label_y2))

            # Check OCR cache
            cache_key = self._bbox_cache_key(x1 / W, y1 / H, x2 / W, y2 / H)
            if cache_key in self._ocr_cache:
                label_text, product_id = self._ocr_cache[cache_key]
            else:
                label_text = self.ocr.read_label(label_region)
                product_id = fuzzy_match(label_text, self.products)
                self._ocr_cache[cache_key] = (label_text, product_id)
                # Keep cache bounded
                if len(self._ocr_cache) > 50:
                    oldest_key = next(iter(self._ocr_cache))
                    del self._ocr_cache[oldest_key]

            detections.append({
                "bbox": [x1 / W, y1 / H, x2 / W, y2 / H],
                "confidence": round(conf, 3),
                "label_text": label_text,
                "product_id": product_id,
            })

        elapsed_ms = round((time.time() - t0) * 1000, 1)
        print(f"[Detector] {len(detections)} detections in {elapsed_ms}ms")
        return detections
