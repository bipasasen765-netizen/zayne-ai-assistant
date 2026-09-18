'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Settings, 
  X, 
  Volume2, 
  CheckCheck, 
  Check, 
  Languages, 
  ChevronDown,
  MessageSquareOff,
  MessageSquare,
  Music,
  Tv,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

export default function ChatbotPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micLang, setMicLang] = useState('en-US'); 
  const [history, setHistory] = useState([
    { 
      role: 'assistant', 
      text: 'Online and ready. Zayne executive employee active.', 
      time: '05:17 PM' 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('Standby');
  const [isChatOpen, setIsChatOpen] = useState(true);

  const [musicTrack, setMusicTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [whatsAppModal, setWhatsAppModal] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState('standard'); 
  const [greenConfig, setGreenConfig] = useState({
    apiUrl: '',
    idInstance: '',
    apiToken: '',
  });

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const recordedTextRef = useRef('');
  const inputRef = useRef(null);
  const chatScrollRef = useRef(null);
  const isListeningRef = useRef(false);
  const silenceTimerRef = useRef(null);

  const [agentPhase, setAgentPhase] = useState('idle');
  const agentPhaseRef = useRef('idle');
  const isSpeakingRef = useRef(false);
  const ignoreUntilRef = useRef(0);
  const isMediaActiveRef = useRef(false);
  const forceStopRef = useRef(false);
  const isPoweredOffRef = useRef(false);

  useEffect(() => {
    isMediaActiveRef.current = Boolean(musicTrack || videoTrack);
  }, [musicTrack, videoTrack]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => {});
  }, []);

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('zayne_whatsapp_mode') || 'standard';
    const savedConfig = localStorage.getItem('zayne_green_config');
    setMode(savedMode);
    if (savedConfig) {
      try { setGreenConfig(JSON.parse(savedConfig)); } catch (e) {}
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('zayne_whatsapp_mode', mode);
    localStorage.setItem('zayne_green_config', JSON.stringify(greenConfig));
    setShowSettings(false);
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [history]);

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const startFreshRecognition = (customStatus) => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isPoweredOffRef.current || isSpeakingRef.current || forceStopRef.current) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch (e) {}
    }

    setTimeout(() => {
      if (isPoweredOffRef.current || isSpeakingRef.current || forceStopRef.current) return;

      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = micLang;

        rec.onstart = () => {
          isListeningRef.current = true;
          setIsListening(true);
          if (customStatus) setStatusText(customStatus);
        };

        rec.onresult = (event) => {
          const isAudioPlaying = typeof window !== 'undefined' && window.speechSynthesis?.speaking;
          if (isPoweredOffRef.current || isSpeakingRef.current || isAudioPlaying || Date.now() < ignoreUntilRef.current || forceStopRef.current) {
            return;
          }

          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          const cleaned = currentTranscript.trim().toLowerCase();
          if (!cleaned) return;

          if (isMediaActiveRef.current) {
            if (/\b(stop|pause|ruko|rok do|band karo)\b/i.test(cleaned)) {
              handleStopMediaAndAskNext();
            }
            return;
          }

          if (isSpeakingRef.current) {
            if (/\b(stop|pause|quiet|halt|ruko)\b/i.test(cleaned)) {
              forceStopRef.current = true;
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              isSpeakingRef.current = false;
              ignoreUntilRef.current = Date.now() + 600;
              setStatusText('Standby');
              return;
            }
            return;
          }

          if (/\b(switch off|turn off|power off|system off|bye zayne|sleep now)\b/i.test(cleaned)) {
            handleSwitchOff();
            return;
          }

          if (agentPhaseRef.current === 'idle' && !isMediaActiveRef.current) {
            const isWakeIntent = /\b(listen me|listening me|can you listen|hey jane|hey zayne|hey jen)\b/i.test(cleaned);

            if (isWakeIntent) {
              agentPhaseRef.current = 'waiting_command';
              setAgentPhase('waiting_command');
              setTranscript('');
              recordedTextRef.current = '';

              speakAsAgent('Yes Boss, I am listening.', () => {
                recordedTextRef.current = '';
                setTranscript('');
                startFreshRecognition('Listening Command...');

                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                  if (agentPhaseRef.current === 'waiting_command') {
                    agentPhaseRef.current = 'idle';
                    setAgentPhase('idle');
                    setStatusText('Standby');
                  }
                }, 5000);
              });
              return;
            }
          }

          if (agentPhaseRef.current === 'waiting_command') {
            const rawCommand = cleaned
              .replace(/\b(yes boss|i am listening|listen me|listening me|can you listen|hey jane|hey zayne|hey jen)\b/gi, '')
              .replace(/^[^\w\u0900-\u097F]+/, '')
              .trim();

            const finalCommand = rawCommand || cleaned;

            if (finalCommand.length > 1) {
              setTranscript(finalCommand);
              recordedTextRef.current = finalCommand;

              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

              silenceTimerRef.current = setTimeout(() => {
                const autoQuery = recordedTextRef.current.trim();
                if (autoQuery && autoQuery.length > 1) {
                  try {
                    if (recognitionRef.current) recognitionRef.current.abort();
                  } catch (e) {}
                  isListeningRef.current = false;
                  setIsListening(false);
                  setTranscript('');
                  recordedTextRef.current = '';
                  handleSend(autoQuery);
                }
              }, 1200); 
            }
          }
        };

        rec.onerror = () => {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          if (isPoweredOffRef.current || forceStopRef.current || isSpeakingRef.current) return;
          setTimeout(() => { startFreshRecognition('Standby'); }, 200);
        };

        rec.onend = () => {
          if (isPoweredOffRef.current || isSpeakingRef.current || forceStopRef.current) return;
          setTimeout(() => { startFreshRecognition('Standby'); }, 100);
        };

        recognitionRef.current = rec;
        rec.start();
        isListeningRef.current = true;
        setIsListening(true);
        if (customStatus) setStatusText(customStatus);
      } catch (e) {}
    }, 60);
  };

  // খাঁটি রাশভারী ও গম্ভীর মেল ভয়েস ইঞ্জিন (আগের অরিজিনাল ব্যারিটোন টোন)
  const speakAsAgent = (text, onFinishedCallback) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onFinishedCallback) onFinishedCallback();
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch (e) {}
      }
      isListeningRef.current = false;
      setIsListening(false);

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recordedTextRef.current = '';
      setTranscript('');

      window.speechSynthesis.cancel();
      isSpeakingRef.current = true;
      forceStopRef.current = false;
      setStatusText('Speaking ...');

      const hasHindi = /[\u0900-\u097F]/.test(text);
      const cleanSpokenText = text
        .replace(/^(with\s+\w+\s+expression:?|\[.*?\]|\(.*?\))/gi, '')
        .replace(/\*.*?\*/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
      utterance.lang = hasHindi ? 'hi-IN' : 'en-US';

      // পূর্বের খাঁটি গম্ভীর ব্যারিটোন টোনের রেট ও পিচ
      utterance.rate = 0.88;
      utterance.pitch = 0.76;

      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      const femaleKeywords = ['female', 'swara', 'kalpana', 'heera', 'zira', 'susan', 'hazel', 'geeta', 'shruti', 'ananya'];
      const isFemale = (name) => femaleKeywords.some((kw) => name.toLowerCase().includes(kw));

      if (hasHindi) {
        selectedVoice = voices.find(
          (v) =>
            v.lang.includes('hi') &&
            (v.name.includes('Madhur') || v.name.toLowerCase().includes('male')) &&
            !isFemale(v.name)
        );
        if (!selectedVoice) {
          selectedVoice = voices.find((v) => v.lang.includes('hi') && !isFemale(v.name));
        }
      } else {
        selectedVoice = voices.find(
          (v) =>
            (v.name.includes('Christopher') ||
              v.name.includes('David') ||
              v.name.includes('Guy') ||
              v.name.toLowerCase().includes('male')) &&
            !isFemale(v.name)
        );
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      let finished = false;
      const onDone = () => {
        if (finished) return;
        finished = true;
        isSpeakingRef.current = false;
        ignoreUntilRef.current = Date.now() + 800;

        if (isPoweredOffRef.current || forceStopRef.current) {
          isListeningRef.current = false;
          setIsListening(false);
          setStatusText('System Off');
          return;
        }

        if (onFinishedCallback) onFinishedCallback();
        else {
          agentPhaseRef.current = 'idle';
          setAgentPhase('idle');
          startFreshRecognition('Standby');
        }
      };

      utterance.onend = onDone;
      utterance.onerror = onDone;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
      isSpeakingRef.current = false;
      if (onFinishedCallback) onFinishedCallback();
    }
  };

  const handleSwitchOff = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    isPoweredOffRef.current = true;
    forceStopRef.current = true;
    isListeningRef.current = false;
    setIsListening(false);
    isSpeakingRef.current = false;
    agentPhaseRef.current = 'idle';
    setAgentPhase('idle');
    setStatusText('System Off');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch (e) {}
    }

    window.speechSynthesis.cancel();
    setMusicTrack(null);
    setVideoTrack(null);
    isMediaActiveRef.current = false;

    speakAsAgent('System shutting down. Goodbye, Boss.', () => {
      isListeningRef.current = false;
      setIsListening(false);
      setStatusText('System Off');
    });
  };

  const handleStopMediaAndAskNext = () => {
    setMusicTrack(null);
    setVideoTrack(null);
    isMediaActiveRef.current = false;
    speakAsAgent('What is your next task Boss?', () => {
      agentPhaseRef.current = 'waiting_command';
      setAgentPhase('waiting_command');
      startFreshRecognition('Listening Command...');
    });
  };

  useEffect(() => {
    startFreshRecognition('Standby');
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, [micLang]);

  const toggleMic = () => {
    if (isSpeakingRef.current) {
      forceStopRef.current = true;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
      setStatusText('Standby');
      return;
    }

    if (isPoweredOffRef.current) {
      isPoweredOffRef.current = false;
      forceStopRef.current = false;
      startFreshRecognition('Standby');
      return;
    }

    if (isListening) {
      handleSwitchOff();
      return;
    }

    startFreshRecognition('Listening...');
  };

  const handleSend = async (manualInput) => {
    const query = typeof manualInput === 'string' ? manualInput : transcript;
    if (!query || !query.trim() || loading) return;

    const trimmedQuery = query.trim();

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }
    isListeningRef.current = false;
    setIsListening(false);
    setTranscript('');
    recordedTextRef.current = '';

    if (!isChatOpen) setIsChatOpen(true);

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentHistory = [...history, { role: 'user', text: trimmedQuery, time: currentTime }];
    setHistory(currentHistory);

    // ১. লোকাল তারিখ হ্যান্ডলার (০ মিলিসেকেন্ড ল্যাটেন্সি)
    const isDateQuery = /\b(date|today's date|current date|aaj ki tarikh|tarikh)\b/i.test(trimmedQuery.toLowerCase());
    if (isDateQuery) {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = now.toLocaleDateString(micLang === 'hi-IN' ? 'hi-IN' : 'en-US', options);

      const dateReply = micLang === 'hi-IN' ? `बॉस, आज ${formattedDate} है।` : `Boss, today is ${formattedDate}.`;
      setHistory((prev) => [...prev, { role: 'assistant', text: dateReply, time: currentTime }]);

      speakAsAgent(dateReply, () => {
        agentPhaseRef.current = 'idle';
        setAgentPhase('idle');
        startFreshRecognition('Standby');
      });
      return;
    }

    // ২. হোয়াটসঅ্যাপ তাৎক্ষণিক ব্যাকগ্রাউন্ড ডিসপ্যাচ
    const isWhatsAppInstantIntent = /\b(whatsapp|message|bhejo|sandesh|karo)\b/i.test(trimmedQuery.toLowerCase());
    if (isWhatsAppInstantIntent) {
      const instantReply = micLang === 'hi-IN'
        ? "बॉस, मैं आपका संदेश तुरंत भेज रहा हूँ। आपका अगला आदेश क्या है?"
        : "I'm dispatching your message right now, Boss. It might take just a moment. What is your next task?";

      setHistory((prev) => [...prev, { role: 'assistant', text: instantReply, time: currentTime }]);

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedQuery,
          history: currentHistory,
          customGreenApi: mode === 'auto' ? greenConfig : null,
        }),
      }).catch(() => {});

      speakAsAgent(instantReply, () => {
        agentPhaseRef.current = 'waiting_command';
        setAgentPhase('waiting_command');
        startFreshRecognition('Listening Command...');
      });
      return;
    }

    setLoading(true);
    setStatusText('Thinking...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedQuery,
          history: currentHistory,
          customGreenApi: mode === 'auto' ? greenConfig : null,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Standing by, Boss.';
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setHistory((prev) => [...prev, { role: 'assistant', text: replyText, time: replyTime }]);

      if (data.action === 'youtube_play_inline' && data.videoId) {
        setVideoTrack(null);
        setMusicTrack({ videoId: data.videoId, title: data.query || 'Music' });
        isMediaActiveRef.current = true;
      } else if (data.action === 'youtube_redirect' && data.url) {
        const extractedId = extractYouTubeVideoId(data.url);
        if (extractedId) {
          setMusicTrack(null);
          setVideoTrack({ videoId: extractedId, title: data.query || 'Video' });
          isMediaActiveRef.current = true;
        } else {
          window.open(data.url, '_blank');
        }
      }

      speakAsAgent(replyText, () => {
        agentPhaseRef.current = 'idle';
        setAgentPhase('idle');
        startFreshRecognition('Standby');
      });
    } catch (err) {
      setStatusText('Standby');
      setHistory((prev) => [
        ...prev,
        { role: 'assistant', text: 'Standing by, Boss. What is your command?', time: currentTime }
      ]);
      agentPhaseRef.current = 'idle';
      setAgentPhase('idle');
      startFreshRecognition('Standby');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white select-none font-sans flex flex-col justify-between p-5 sm:p-7">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none brightness-95 contrast-[1.03]"
      >
        <source src="/chatbot.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/40 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60 pointer-events-none z-[1]" />

      <header className="relative z-20 flex items-start justify-between w-full">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-serif tracking-[0.42em] text-[#e8ded1] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Z A Y N E
          </h1>
          <p className="text-[8.5px] sm:text-[9.5px] font-mono tracking-[0.24em] text-[#a49a8d] uppercase mt-0.5">
            YOUR THINKING COMPANION
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMicLang((prev) => (prev === 'en-US' ? 'hi-IN' : 'en-US'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-xs text-[#d8cebe] hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Languages size={13} className="text-[#beb3a2]" />
            <span className="tracking-wide">{micLang === 'en-US' ? 'English' : 'हिन्दी'}</span>
            <ChevronDown size={12} className="opacity-70" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-xs text-[#d8cebe] hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Settings size={13} className="text-[#beb3a2]" />
            <span className="tracking-wide">Settings</span>
          </button>
        </div>
      </header>

      <div className="relative z-10 w-full flex-1 flex items-center justify-between my-auto px-2">
        <div className="hidden lg:flex flex-col justify-center space-y-6 w-[200px] shrink-0">
          <nav className="flex flex-col space-y-2 text-sm text-[#cfc5b8] font-serif tracking-wider">
            <span className="text-[#a49a8d] hover:text-white transition-colors cursor-pointer">Think</span>
            <span className="text-[#a49a8d] hover:text-white transition-colors cursor-pointer">Ask</span>
            <span className="text-[#a49a8d] hover:text-white transition-colors cursor-pointer">Explore</span>
            <span className="text-[#a49a8d] hover:text-white transition-colors cursor-pointer">Together</span>
          </nav>
          <div className="w-8 h-[1px] bg-white/20" />
          <p className="font-serif italic text-sm text-[#beb4a6] leading-relaxed max-w-[210px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            “A mind that listens beyond words.”
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <h2 className="text-1xl sm:text-1xl font-serif text-[#ece3d6] leading-[1.25] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] translate-x-[80px] mb-40">
              More <br /> Than Answers. <br /> A Conversation <br /> That Understands.
            </h2>
            <div className="w-10 h-[1.5px] bg-[#d4af37]/60 mx-auto mt-3 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-0/2 flex flex-col items-center pointer-events-auto z-20">
            <button
              onClick={toggleMic}
              className={`relative w-19 h-19 sm:w-25 sm:h-25 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-700 cursor-pointer translate-y-1 ${
                isListening
                  ? 'border-2 border-white bg-white/20 scale-105 silver-metallic-glow'
                  : 'border-[1.8px] border-[#fde68a] bg-black/40 hover:border-amber-200 hover:scale-105 gold-metallic-glow'
              }`}
            >
              <svg viewBox="0 0 120 50" className={`w-20 sm:w-24 h-auto overflow-visible ${isListening ? 'silver-audio-wave' : 'gold-audio-wave'}`}>
                <defs>
                  <linearGradient id="ribbonSurfaceGradGold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
                    <stop offset="25%" stopColor="#fef08a" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
                    <stop offset="75%" stopColor="#fbbf24" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="ribbonSurfaceGradSilver" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity="0" />
                    <stop offset="25%" stopColor="#e2e8f0" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="75%" stopColor="#cbd5e1" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="ribbonEdgeGlowGold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="20%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#fffbeb" stopOpacity="1" />
                    <stop offset="80%" stopColor="#fef08a" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="ribbonEdgeGlowSilver" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="20%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#f8fafc" stopOpacity="1" />
                    <stop offset="80%" stopColor="#e2e8f0" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
                  </linearGradient>

                  <filter id="ribbonBlurGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <line x1="5" y1="25" x2="115" y2="25" stroke={isListening ? "rgba(255, 255, 255, 0.45)" : "rgba(255, 235, 180, 0.25)"} strokeWidth="0.75" strokeDasharray="2 4" />
                <path d="M 12 25 C 35 12, 50 14, 62 25 C 74 36, 88 36, 108 25 C 88 30, 74 30, 62 21 C 50 11, 35 19, 12 25 Z" fill={isListening ? "url(#ribbonSurfaceGradSilver)" : "url(#ribbonSurfaceGradGold)"} filter="url(#ribbonBlurGlow)" />
                <path d="M 12 25 C 35 12, 50 14, 62 25 C 74 36, 88 36, 108 25 C 88 30, 74 30, 62 21 C 50 11, 35 19, 12 25 Z" fill="none" stroke={isListening ? "url(#ribbonEdgeGlowSilver)" : "url(#ribbonEdgeGlowGold)"} strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 12 25 C 35 19, 50 11, 62 21 C 74 30, 88 30, 108 25" fill="none" stroke={isListening ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 240, 180, 0.55)"} strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>

            <span className="mt-3 text-xs font-serif tracking-widest text-[#d6ccc0] transition-colors duration-300">
              {isListening ? (
                <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] animate-pulse">{statusText}</span>
              ) : (
                <span className="hover:text-white">{statusText === 'System Off' ? 'System Off (Tap to wake)' : 'Tap to speak'}</span>
              )}
            </span>
          </div>
        </div>

        <div className={`w-full max-w-[380px] shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${isChatOpen ? 'opacity-100 scale-100 translate-x-0 block' : 'opacity-0 scale-95 translate-x-10 hidden lg:block'}`}>
          <div className="w-full h-[370px] bg-black/60 backdrop-blur-xl border border-white/15 rounded-3xl p-5 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif tracking-[0.2em] text-[#e8ded1] text-sm uppercase">ZAYNE</h3>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-0.5 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                </span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 rounded-md text-white/40 hover:text-white cursor-pointer">
                <X size={13} />
              </button>
            </div>

            <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3 my-3 pr-1 text-xs">
              {history.map((msg, i) => (
                <div key={i} className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${msg.role === 'user' ? 'ml-auto bg-[#3a3026]/90 border border-amber-500/30 text-[#f7efe6]' : 'mr-auto bg-[#1b191c]/90 border border-white/10 text-[#d8cebe]'}`}>
                  <p>{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-white/40">
                    <span>{msg.time || '05:18 PM'}</span>
                    {msg.role === 'user' ? <CheckCheck size={12} className="text-amber-300/80" /> : <Volume2 size={11} className="text-white/40 hover:text-white cursor-pointer" onClick={() => speakAsAgent(msg.text)} />}
                  </div>
                </div>
              ))}
              {loading && <div className="mr-auto bg-[#1b191c]/90 border border-white/10 p-3 rounded-2xl text-[10px] font-mono text-white/50 animate-pulse">Processing...</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 w-full flex flex-col items-center pb-2">
        <div className="w-full max-w-md sm:max-w-lg flex items-center justify-center gap-2">
          <button onClick={() => setIsChatOpen((prev) => !prev)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-sans bg-[#121113]/90 border border-white/15 text-white/70 hover:text-white cursor-pointer shadow-lg shrink-0">
            {isChatOpen ? <MessageSquareOff size={13} /> : <MessageSquare size={13} />}
            <span className="text-[11px] font-medium tracking-wide">History</span>
          </button>

          <div className="flex-1 flex items-center gap-1.5 bg-[#121113]/90 backdrop-blur-xl border border-white/15 rounded-full px-3 py-1 shadow-lg min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                recordedTextRef.current = e.target.value;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={micLang === 'en-US' ? "Ask Zayne anything (English)..." : "मुझसे कुछ भी पूछें (हिन्दी)..."}
              className="flex-1 bg-transparent border-none text-[11px] text-white placeholder-white/30 focus:outline-none px-1 font-sans tracking-wide min-w-0"
            />
            <button onClick={() => handleSend()} disabled={loading} className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#94682a] via-[#d4af37] to-[#fae392] flex items-center justify-center text-black hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer shadow-md shrink-0">
              <Send size={11} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {musicTrack && (
        <div className="fixed bottom-20 right-6 z-40 flex items-center gap-3 p-2.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-amber-400/40 shadow-2xl animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300">
            <Music size={15} className="animate-pulse" />
          </div>
          <span className="text-xs font-serif text-white tracking-wide max-w-[170px] truncate">{musicTrack.title}</span>
          <button onClick={handleStopMediaAndAskNext} className="p-1 rounded-md text-zinc-400 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
          <iframe key={musicTrack.videoId} width="0" height="0" src={`https://www.youtube.com/embed/${musicTrack.videoId}?autoplay=1&enablejsapi=1`} title="Music" allow="autoplay" className="hidden" />
        </div>
      )}

      {videoTrack && (
        <div className="fixed bottom-20 right-6 z-40 flex flex-col p-3 rounded-2xl bg-black/85 backdrop-blur-xl border border-sky-400/40 shadow-2xl animate-fadeIn space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif text-white tracking-wide max-w-[180px] truncate">{videoTrack.title}</span>
            <button onClick={handleStopMediaAndAskNext} className="p-1 rounded-md text-zinc-400 hover:text-white cursor-pointer">
              <X size={14} />
            </button>
          </div>
          <div className="w-[280px] h-[155px] rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner">
            <iframe key={videoTrack.videoId} width="100%" height="100%" src={`https://www.youtube.com/embed/${videoTrack.videoId}?autoplay=1&enablejsapi=1`} title="Video" allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full border-0" />
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121113] border border-white/15 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-serif tracking-wider text-[#fae392] flex items-center gap-2">
                <Settings size={16} /> WhatsApp Settings
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div onClick={() => setMode('standard')} className={`p-3 rounded-xl border cursor-pointer ${mode === 'standard' ? 'bg-amber-500/10 border-amber-400/60' : 'bg-black/50 border-white/10'}`}>
                <span className="text-xs font-semibold text-white">Mode 1: Standard (Free)</span>
              </div>
              <div onClick={() => setMode('auto')} className={`p-3 rounded-xl border cursor-pointer ${mode === 'auto' ? 'bg-amber-500/10 border-amber-400/60' : 'bg-black/50 border-white/10'}`}>
                <span className="text-xs font-semibold text-white">Mode 2: Auto-Dispatch (Green-API)</span>
              </div>
            </div>

            {mode === 'auto' && (
              <div className="space-y-2.5 p-3 bg-black/60 rounded-xl border border-white/10 text-xs">
                <input type="text" placeholder="API URL" value={greenConfig.apiUrl} onChange={(e) => setGreenConfig({ ...greenConfig, apiUrl: e.target.value })} className="w-full bg-zinc-900 border border-white/15 rounded px-2.5 py-1.5 text-white" />
                <input type="text" placeholder="Id Instance" value={greenConfig.idInstance} onChange={(e) => setGreenConfig({ ...greenConfig, idInstance: e.target.value })} className="w-full bg-zinc-900 border border-white/15 rounded px-2.5 py-1.5 text-white" />
                <input type="password" placeholder="API Token" value={greenConfig.apiToken} onChange={(e) => setGreenConfig({ ...greenConfig, apiToken: e.target.value })} className="w-full bg-zinc-900 border border-white/15 rounded px-2.5 py-1.5 text-white" />
              </div>
            )}

            <button onClick={saveSettings} className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs cursor-pointer">
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </main>
  );
}