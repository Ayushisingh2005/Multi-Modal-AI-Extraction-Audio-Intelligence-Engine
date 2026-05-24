# LexiScript Pro: High-Fidelity Multi-Modal Intelligence Engine

LexiScript Pro is a state-of-the-art neural synthesis platform that bridges the gap between unstructured data (Images, Audio, Video, PDFs) and actionable intelligence. It features a high-performance Multi-Modal Extraction Pipeline that not only extracts text but also translates, summarizes, and synthesizes it into high-fidelity neural audio.

* Product Link : https://lexiscript.vercel.app/
  
## 🚀 Key Features
* Vision Intelligence Engine: Leverages Google Gemini 1.5 Flash for layout-aware OCR, document summarization, and video frame analysis.
* Acoustic Intelligence Engine: Utilizes Groq (Whisper-Large-V3) for near-instant, time-synced transcription and lyric extraction from audio files.
* Semantic Enrichment: Automatically identifies and defines complex technical jargon within the extracted content.
* Multilingual Synthesis: Integrated translation support (Hindi, Spanish, French, etc.) with Neural Text-to-Speech (TTS) using edge-tts for natural, localized voices.
* Interactive Audio Control: Switchable Male/Female voices with global audio management to prevent stream overlapping.
* High-Performance UI: A "Glassmorphism" dashboard built with a JavaScript Canvas-driven moving grid and neon scanlines, optimized for low-resource hardware.

## 🛠️ Tech Stack
---
|Frontend     |                                                             |
|Framework:   | Next.js 14+ (App Router)                                    |
|Styling:     |Tailwind CSS v4, Glassmorphism UI                            |
|Animations:  | Framer Motion, HTML5 Canvas API                             |
|Deployment:  | Vercel                                                      |
|Backend      |                                                             |
|Framework:   | FastAPI (Python 3.10)                                       |
|AI Models:   | Google Gemini 1.5 Flash (Vision), Groq Whisper-V3 (Acoustic)|
|Speech:      | Edge-TTS (Neural Synthesis)                                 |
|Deployment:  | Render                                                      |
---
## 📂 Project Structure
```
omnimind-pro/
├── backend/
│   ├── main.py             # FastAPI server & Neural logic
│   ├── requirements.txt    # Python dependencies
│   └── .env                # API Keys (Gemini, Groq)
├── frontend/
│   ├── app/
│   │   ├── page.js         # Interactive Dashboard & Canvas Grid
│   │   ├── layout.js       # Root layout & Meta tags
│   │   └── globals.css     # Tailwind v4 & Glass effects
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   └── .env.local          # Environment config (Backend URL)
└── README.md               # Project documentation
```
## ⚙️ Installation & Setup
1. Backend Setup
```
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Create a .env file in the backend/ folder:
```
GEMINI_API_KEY=your_google_ai_studio_key
GROQ_API_KEY=your_groq_cloud_key
```
Run the server:
```
python main.py
```
2. Frontend Setup
```
cd frontend
npm install
```
Create a .env.local file in the frontend/ folder:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```
Run the development server:
```
npm run dev
```
## ☁️ Deployment
Backend (Render)
Connect GitHub repo.
Set Root Directory to backend.
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Add GEMINI_API_KEY and GROQ_API_KEY to Environment Variables.

Frontend (Vercel)
Connect GitHub repo.
Set Root Directory to frontend.
Add NEXT_PUBLIC_BACKEND_URL (your Render URL) to Environment Variables.

## 🧠 Technical Architecture (Interview Talking Points)
* Hybrid Neuro-Symbolic Logic: The system uses neural models for creative extraction and symbolic logic (Regex) for output sanitization before TTS synthesis.
* Asynchronous Synthesis: Utilized asyncio in FastAPI to handle non-blocking audio generation, reducing latency for multilingual synthesis.
* Canvas GPU Acceleration: The moving grid background is rendered via the HTML5 Canvas API instead of CSS DOM elements to ensure 60FPS performance on older hardware.
* State Management: Implemented useRef based audio controllers in React to manage singleton audio instances, preventing "audio bleeding" during language switches.
📝 License
This project is licensed under the MIT License. Developed as a showcase for high-fidelity AI engineering.
