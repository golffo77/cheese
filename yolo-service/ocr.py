"""EasyOCR wrapper for reading cheese price labels."""
import easyocr
from PIL import Image
import numpy as np
from typing import Optional


class OCRReader:
    def __init__(self):
        # Support German, French, Italian, English – covers Swiss cheese labels
        self._reader: Optional[easyocr.Reader] = None

    def _get_reader(self) -> easyocr.Reader:
        if self._reader is None:
            print("[OCR] Initializing EasyOCR (de/fr/it/en)...")
            self._reader = easyocr.Reader(
                ["de", "fr", "it", "en"],
                gpu=False,  # CPU for PoC – set True if CUDA available
                verbose=False,
            )
            print("[OCR] Ready.")
        return self._reader

    def read_label(self, image_crop: Image.Image) -> str:
        """
        Read text from a cropped label image.
        Returns concatenated text from all detected regions.
        """
        if image_crop.width < 5 or image_crop.height < 5:
            return ""

        reader = self._get_reader()
        img_array = np.array(image_crop.convert("RGB"))

        try:
            results = reader.readtext(img_array, detail=0, paragraph=False)
            return " ".join(str(r) for r in results).strip()
        except Exception as e:
            print(f"[OCR] Error: {e}")
            return ""
