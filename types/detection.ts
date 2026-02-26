export interface Detection {
  bbox: [number, number, number, number]; // normalized [0-1]: x1,y1,x2,y2
  confidence: number;
  label_text: string;   // OCR text from price label
  product_id: string | null;
}

export interface DetectionResponse {
  detections: Detection[];
  processing_time_ms: number;
}
