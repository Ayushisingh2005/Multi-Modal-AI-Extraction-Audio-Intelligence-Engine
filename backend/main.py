import os
import re
import shutil
import edge_tts
import asyncio
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# --- CORS SETUP ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NEURAL VOICE MAPPING (Multi-Gender & Multi-Lingual) ---
VOICE_MAP = {
    "English": {"Male": "en-US-AndrewNeural", "Female": "en-US-EmmaNeural"},
    "Hindi": {"Male": "hi-IN-MadhurNeural", "Female": "hi-IN-SwaraNeural"},
    "Spanish": {"Male": "es-ES-AlvaroNeural", "Female": "es-ES-ElviraNeural"},
    "French": {"Male": "fr-FR-HenriNeural", "Female": "fr-FR-DeniseNeural"},
    "German": {"Male": "de-DE-ConradNeural", "Female": "de-DE-KatjaNeural"},
    "Japanese": {"Male": "ja-JP-KeitaNeural", "Female": "ja-JP-NanamiNeural"},
}

# --- API CONFIGURATION ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.get("/")
async def root():
    return {"status": "OmniMind Pro System Online"}

@app.post("/synthesize")
async def synthesize_speech(
    text: str = Form(...), 
    lang: str = Form("English"), 
    gender: str = Form("Male")
):
    """
    Converts text to high-fidelity audio with Gender and Language selection.
    """
    try:
        # 1. Select the correct voice based on language and gender
        lang_voices = VOICE_MAP.get(lang, VOICE_MAP["English"])
        voice = lang_voices.get(gender, lang_voices["Male"])
        
        # 2. Clean Markdown and Special Characters (so TTS doesn't read 'star star')
        clean_text = re.sub(r'[*#_>\\-]', '', text)
        
        # 3. Use a unique filename to prevent "File in Use" errors when playing multiple audios
        unique_id = str(uuid.uuid4())[:8]
        output_path = f"speech_{unique_id}.mp3"
        
        # 4. Synthesize using edge-tts
        communicate = edge_tts.Communicate(clean_text, voice)
        await communicate.save(output_path)
        
        # 5. Return the file
        return FileResponse(output_path, media_type="audio/mpeg")

    except Exception as e:
        print(f"TTS Synthesis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/process")
async def process_data(
    file: UploadFile = File(...), 
    mode: str = Form(...),
    target_lang: str = Form("English")
):
    """
    Handles Multi-Modal extraction: Vision, OCR, Audio, and Translation.
    """
    try:
        file_bytes = await file.read()
        
        # --- MODE 1: VISION/DOCUMENT ENGINE (Gemini 1.5 Flash) ---
        if mode == "document":
            model = genai.GenerativeModel('gemini-3-flash-preview')
            
            prompt = f"""
    You are a High-Fidelity Extraction Engine.
    1. OCR: Extract all text from this source.
    2. SUMMARY: Provide a clear, concise summary at the very beginning.
    3. ENRICHMENT: Identify and define technical jargon.
    4. TRANSLATION: Translate the entire response into {target_lang}. 
    
    Format the output strictly with these headers in {target_lang}:
    --- SUMMARY ---
    (Your summary here)
    
    --- DETAILED CONTENT ---
    (Your extracted text here)
    
    --- JARGON DEFINITIONS ---
    (Definitions here)
    """
            
            response = model.generate_content([
                prompt, 
                {"mime_type": file.content_type, "data": file_bytes}
            ])
            
            return {"text": response.text}

        # --- MODE 2: ACOUSTIC/LYRICS ENGINE (Groq + Gemini Translation) ---
        elif mode == "audio":
            temp_file = f"temp_{uuid.uuid4()}.mp3"
            with open(temp_file, "wb") as buffer:
                buffer.write(file_bytes)

            try:
                with open(temp_file, "rb") as audio_file:
                    # High-speed transcription
                    transcription = groq_client.audio.transcriptions.create(
                        file=(temp_file, audio_file.read()),
                        model="whisper-large-v3",
                        response_format="verbose_json",
                    )
                
                raw_lyrics = ""
                for segment in transcription.segments:
                    start_time = f"[{int(segment['start'] // 60):02}:{int(segment['start'] % 60):02}]"
                    raw_lyrics += f"{start_time} {segment['text']}\n"

                # If translation is requested for Audio
                if target_lang.lower() != "english":
                    translator = genai.GenerativeModel('gemini-3-flash-preview')
                    translate_prompt = f"""
                    Translate the following lyrics into {target_lang}. 
                    Keep the timestamps [00:00] exactly as they are.
                    Content:
                    {raw_lyrics}
                    """
                    translated_response = translator.generate_content(translate_prompt)
                    return {"text": translated_response.text}
                
                return {"text": raw_lyrics}
            
            finally:
                if os.path.exists(temp_file):
                    os.remove(temp_file)

        else:
            raise HTTPException(status_code=400, detail="Invalid Mode")

    except Exception as e:
        print(f"Server Processing Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)