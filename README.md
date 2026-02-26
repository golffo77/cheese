# Käsetheke Digital – PoC

Interaktive Online-Käsetheke mit Live-Video, KI-Erkennung (YOLOv8 + EasyOCR), virtuellem Wartesystem und WebRTC-Videoberatung.

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-00FFFF?style=for-the-badge&logo=yolo&logoColor=black)

## Schnellstart

### 1. Next.js Frontend + Socket.io

```bash
npm install
npm run dev
```

- Kunde: http://localhost:3000
- Verkäufer: http://localhost:3000/seller

### 2. Python YOLO-Service (optional, aber empfohlen)

```bash
cd yolo-service
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Service läuft auf http://localhost:8000. Ohne den Service zeigt das Frontend keine Bounding Boxes, läuft aber ansonsten vollständig.

## Kamera-Konfiguration

In `.env.local`:

```env
# Webcam (Standard – sofort nutzbar)
NEXT_PUBLIC_CAMERA_MODE=webcam

# IP-Kamera via HLS (mediamtx: RTSP -> HLS)
NEXT_PUBLIC_CAMERA_MODE=ip
NEXT_PUBLIC_CAM1_HLS_URL=/hls/cam1/stream.m3u8
NEXT_PUBLIC_CAM2_HLS_URL=/hls/cam2/stream.m3u8
```

## Demo-Flow

1. http://localhost:3000 öffnen → Kamera-Erlaubnis erteilen
2. KI erkennt Käse → gelbe Bounding Boxes erscheinen
3. Auf Bounding Box klicken → Käse-Detail-Popup
4. "Nummer ziehen" → Ticket #N
5. In neuem Tab: http://localhost:3000/seller
6. Ticket aufrufen → "Anrufen" klicken
7. Kunde nimmt an → WebRTC-Video läuft
8. Verkäufer beendet Anruf → Zahlungs-Modal beim Kunden
9. Kunde wählt Abholung/Lieferung → Bestätigung beim Verkäufer

## Architektur

### Überblick

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│                                                         │
│   KUNDE (/)                   VERKÄUFER (/seller)       │
│   - Kamera-Stream             - Queue-Dashboard         │
│   - Bounding Boxes            - Schneidetisch-Kamera    │
│   - Ticket-System             - Videoberatung           │
│   - WebRTC-Video              - Zahlungsbestätigung     │
└───────────────┬───────────────────────┬─────────────────┘
                │      Socket.io        │
                │    (Echtzeit-Events)  │
┌───────────────▼───────────────────────▼─────────────────┐
│                  Node.js Custom Server :3000             │
│                                                         │
│  ┌─────────────────┐      ┌──────────────────────────┐  │
│  │  Next.js        │      │  Socket.io Server        │  │
│  │  API Routes     │      │                          │  │
│  │  - /api/queue   │      │  - Queue-Events          │  │
│  │  - /api/detect  │      │  - WebRTC-Signaling      │  │
│  │    (Proxy)      │      │  - Payment-Events        │  │
│  └─────────────────┘      └──────────────────────────┘  │
│                                                         │
│  In-Memory Queue Store (queueStore)                     │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP (Proxy)
┌───────────────────────────▼─────────────────────────────┐
│                  Python FastAPI :8000                    │
│                                                         │
│  1. JPEG Frame empfangen (Base64)                       │
│  2. YOLOv8 → Bounding Boxes                            │
│  3. 70px unter BBox croppen → Preisschild               │
│  4. EasyOCR → Text extrahieren                          │
│  5. difflib Fuzzy-Match → Produkt-ID                    │
│  6. Normalisierte Koordinaten [0-1] zurückgeben         │
└─────────────────────────────────────────────────────────┘
```

### Echtzeit-Queue-Flow

```
Kunde POST /api/queue         → Ticket erstellt (in-memory)
Kunde socket: queue:join      → socketId mit Ticket verknüpft
Verkäufer: queue:call         → Kunde erhält queue:called
Verkäufer: rtc:call           → Kunde erhält rtc:incoming-call
Kunde: rtc:accept             → Verkäufer erhält rtc:accepted
Beide: rtc:signal (SDP/ICE)  → Server leitet weiter (pure relay)
Verkäufer: rtc:hangup         → Kunde zeigt PaymentFlow
Kunde: payment:complete       → Verkäufer erhält payment:received
```

### KI-Erkennungs-Pipeline

```
Video Frame (1500ms Intervall)
        │
        ▼
Hidden Canvas → JPEG Base64
        │
        ▼
POST /api/detect (Next.js Proxy)
        │
        ▼
Python :8000 → YOLOv8 Detection
        │
        ├─ Bounding Box gefunden?
        │       │
        │       ▼
        │  Preisschild-Crop (70px unterhalb BBox)
        │       │
        │       ▼
        │  EasyOCR → Text
        │       │
        │       ▼
        │  difflib Fuzzy-Match → Produkt aus products.json
        │
        ▼
Normalisierte Koordinaten [0-1] → Frontend
        │
        ▼
Bounding Box Overlay auf Video-Stream
```

> **Fallback:** Ist der Python-Service nicht erreichbar, gibt `/api/detect` `{ detections: [], service_unavailable: true }` zurück – das Frontend läuft ohne Bounding Boxes weiter.

## Eigenes Käse-Modell

1. Bilder annotieren (Roboflow oder LabelImg)
2. Fine-Tuning:
   ```python
   from ultralytics import YOLO
   model = YOLO("yolov8n.pt")
   model.train(data="cheese.yaml", epochs=50, imgsz=640)
   ```
3. Modell nach `yolo-service/models/cheese_yolov8.pt` kopieren
