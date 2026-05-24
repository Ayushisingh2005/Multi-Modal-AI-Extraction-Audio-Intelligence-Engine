"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Brain, Cpu, Zap, Mic, Eye, Play, 
  Languages, Volume2, Loader2, Square, User
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://multi-modal-ai-extraction-audio-sjlf.onrender.com";
// --- 1. JAVASCRIPT MOVING GRID COMPONENT ---
const MovingGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let offset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gridSize = 50;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)'; 

      offset += 0.5; 
      if (offset > gridSize) offset = 0;

      for (let x = offset; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = offset; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      const scanY = (offset * 5) % canvas.height;
      const gradient = ctx.createLinearGradient(0, scanY - 50, 0, scanY);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0.4)'); 
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 2, canvas.width, 2);

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-[#020617]" />;
};

// --- 2. MAIN DASHBOARD ---
export default function Home() {
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [mode, setMode] = useState('document'); 
  const [targetLang, setTargetLang] = useState('English');
  const [voiceGender, setVoiceGender] = useState('Male');
  const [result, setResult] = useState(null);
  
  // Audio Controller
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null); 

  const languages = [
    { name: 'English', flag: '🇺🇸' }, { name: 'Hindi', flag: '🇮🇳' },
    { name: 'Spanish', flag: '🇪🇸' }, { name: 'French', flag: '🇫🇷' },
    { name: 'German', flag: '🇩🇪' }, { name: 'Japanese', flag: '🇯🇵' }
  ];

  // Helper to stop any currently playing audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleUpload = async (e) => {
    if (!e.target.files[0]) return;
    stopAudio();
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('mode', mode);
    formData.append('target_lang', targetLang);

    try {
      const res = await axios.post(`${BACKEND_URL}/process`, formData);
      setResult(res.data.text);
    } catch (err) {
      alert("Backend Connection Failed. Run python main.py first.");
    }
    setLoading(false);
  };

  const handlePlayAudio = async (textType) => {
    if (!result) return;
    stopAudio();
    setAudioLoading(true);

    let textToRead = "";

    if (textType === 'summary') {
      // Regex to find text between summary headers
      const regex = new RegExp('--- SUMMARY ---([\\s\\S]*?)--- DETAILED CONTENT ---', 'i');
      const match = result.match(regex);
      
      if (match && match[1]) {
        textToRead = match[1].trim(); 
      } else {
        // Fallback: If headers are missing, take the first 400 characters
        textToRead = result.substring(0, 400);
      }
    } else {
      // Read everything but remove formatting dashes
      textToRead = result.replaceAll('---', '');
    }

    const formData = new FormData();
    formData.append('text', textToRead);
    formData.append('lang', targetLang);
    formData.append('gender', voiceGender);

    try {
      const response = await axios.post(`${BACKEND_URL}/synthesize`, formData, {
  responseType: 'blob',
});
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => setIsPlaying(false);
    } catch (err) {
      console.error("Audio Error:", err);
      alert("Audio Synthesis Error");
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <>
      <MovingGrid />
      
      <main className="relative z-10 p-4 md:p-10 min-h-screen max-w-7xl mx-auto flex flex-col">
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-6xl font-black italic glow-text tracking-tighter uppercase">
              LexiScript <span className="text-cyan-400">PRO</span>
            </h1>
            <p className="text-gray-500 font-mono text-[10px] mt-1 uppercase tracking-[0.4em]">
              Neural Synthesis // Multi-Modal v2.5
            </p>
          </motion.div>

          {/* ENGINE & GENDER TOGGLES */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="glass-card p-1.5 flex gap-2 border border-white/10">
                <button onClick={() => setVoiceGender('Male')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all ${voiceGender === 'Male' ? 'bg-cyan-500 text-black' : 'text-gray-500'}`}>
                    <User size={12} /> MALE
                </button>
                <button onClick={() => setVoiceGender('Female')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all ${voiceGender === 'Female' ? 'bg-purple-500 text-black' : 'text-gray-500'}`}>
                    <User size={12} /> FEMALE
                </button>
            </div>

            <div className="glass-card p-1.5 flex gap-2 border border-white/10">
                <button onClick={() => setMode('document')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'document' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'text-gray-400'}`}>VISION ENGINE</button>
                <button onClick={() => setMode('audio')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'audio' ? 'bg-purple-500 text-black shadow-lg shadow-purple-500/30' : 'text-gray-400'}`}>LYRICS ENGINE</button>
            </div>
          </div>
        </header>

        {/* LANGUAGE SELECTOR */}
        <div className="glass-card mb-8 p-4 flex items-center gap-4 overflow-x-auto no-scrollbar border-white/5">
          <div className="flex items-center gap-2 text-cyan-400 border-r border-white/10 pr-4 shrink-0">
            <Languages size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Language:</span>
          </div>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang.name}
                onClick={() => { setTargetLang(lang.name); stopAudio(); }}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                  targetLang === lang.name ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-transparent text-gray-500 hover:border-white/20'
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 border-t-2 border-t-cyan-500/50 h-fit">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Zap size={18} className="text-cyan-400" /> System Input
              </h3>
              <input type="file" onChange={handleUpload} id="file-up" className="hidden" />
              <label htmlFor="file-up" className="block w-full py-16 border-2 border-dashed border-white/5 rounded-2xl text-center hover:border-cyan-400/50 transition-all cursor-pointer group">
                <Upload className="mx-auto mb-4 text-gray-600 group-hover:text-cyan-400 transition-colors" size={40} />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Push Data Stream</span>
              </label>
            </div>

            <div className="glass-card p-6">
              <h4 className="text-[10px] font-bold text-gray-600 tracking-widest uppercase mb-6">Intelligence Layers</h4>
              <div className="space-y-5">
                 <CapabilityItem icon={<Eye className="text-cyan-400" />} title="Multilingual OCR" desc="Image to native text synthesis." />
                 <CapabilityItem icon={<Mic className="text-purple-400" />} title="Acoustic Mapping" desc="Vocals to time-synced lyrics." />
                 <CapabilityItem icon={<Volume2 className="text-emerald-400" />} title="Neural TTS" desc="Male/Female voice cloning." />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col">
            <div className="glass-card flex-grow min-h-[550px] flex flex-col border-t-2 border-t-purple-500/50 relative">
              <div className="p-4 border-b border-white/5 flex justify-between bg-white/2 items-center">
                <div className="flex items-center gap-3">
                  <Brain className="text-purple-400" size={20} />
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Extraction Result</span>
                </div>
                
                <div className="flex gap-2">
                    {result && (
                      <>
                        <button onClick={() => handlePlayAudio('summary')} disabled={audioLoading} className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-[10px] font-bold hover:bg-emerald-500 hover:text-black transition-all">
                            {audioLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} PLAY SUMMARY
                        </button>
                        <button onClick={() => handlePlayAudio('full')} disabled={audioLoading} className="flex items-center gap-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-4 py-1.5 rounded-full text-[10px] font-bold hover:bg-cyan-400 hover:text-black transition-all">
                            <Volume2 size={12} /> PLAY FULL
                        </button>
                      </>
                    )}
                    {isPlaying && (
                        <button onClick={stopAudio} className="bg-red-500/20 text-red-400 p-2 rounded-full border border-red-500/30 hover:bg-red-500 hover:text-black transition-all">
                            <Square size={12} fill="currentColor" />
                        </button>
                    )}
                </div>
              </div>

              <div className="p-8 flex-grow overflow-y-auto font-mono text-sm leading-relaxed text-gray-300">
                <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-cyan-400 text-[10px] uppercase tracking-[0.3em] animate-pulse">Analyzing Neural Stems...</p>
                  </motion.div>
                ) : result ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="whitespace-pre-wrap">
                    {result}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <Brain size={100} strokeWidth={1} />
                    <p className="mt-4 text-xs">Waiting for Neural Ingestion...</p>
                  </div>
                )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function CapabilityItem({ icon, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-[11px] font-bold text-white uppercase">{title}</p>
        <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">{desc}</p>
      </div>
    </div>
  );
}
