import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from 'axios';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Clock,
  ChevronLeft,
  AlertTriangle,
  Volume2,
  VolumeX,
  RefreshCw,
  Sliders,
  Sparkles,
  Terminal,
  Mic
} from 'lucide-react';

export const InterviewSession = ({ interview, onCompleted }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const candidateName = user?.username || 'Candidate';
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // Speech synthesis states
  const utteranceRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Initialize answers list based on questions count
  useEffect(() => {
    if (interview && interview.questions) {
      setAnswers(new Array(interview.questions.length).fill(''));
    }
  }, [interview]);

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      const defaultVoice = availableVoices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft'))
      ) || availableVoices.find((v) => v.lang.startsWith('en')) || availableVoices[0];
      
      if (defaultVoice) {
        setSelectedVoiceName(defaultVoice.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    if (isMuted || !text) {
      setIsSpeaking(false);
      return;
    }

    // Keep utterance referenced in ref to prevent garbage collection cutoffs
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    
    if (selectedVoiceName) {
      const selectedVoice = voices.find((v) => v.name === selectedVoiceName);
      if (selectedVoice) utteranceRef.current.voice = selectedVoice;
    }

    utteranceRef.current.rate = speechRate;
    utteranceRef.current.pitch = speechPitch;

    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => setIsSpeaking(false);
    utteranceRef.current.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utteranceRef.current);
  };

  // Trigger speech whenever question changes
  useEffect(() => {
    if (interview && interview.questions && interview.questions[currentIndex]) {
      let qText = interview.questions[currentIndex].questionText;
      
      // Personalize the question greeting
      const initialGreeting = currentIndex === 0
        ? `Hello ${candidateName}! Thank you for joining the mock session. Let's start with the first question: ${qText}`
        : qText;

      const timeout = setTimeout(() => {
        speakQuestion(initialGreeting);
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, interview, selectedVoiceName, speechRate, speechPitch, candidateName]);

  const handleMuteToggle = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      if (interview?.questions?.[currentIndex]) {
        speakQuestion(interview.questions[currentIndex].questionText);
      }
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleTextChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < interview.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    window.speechSynthesis.cancel();
    setSubmitting(true);
    try {
      const res = await axiosInstance.post(`/api/interviews/${interview._id}/submit`, {
        answers
      });
      onCompleted(res.data);
    } catch (err) {
      console.error(err);
      alert('An error occurred while compiling answers. Please try again.');
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#070a13]">
        <LoadingState message="Gemini AI is analyzing your answers & compiling feedback..." />
      </div>
    );
  }

  const currentQuestion = interview?.questions?.[currentIndex];
  const progressPercent = interview?.questions?.length 
    ? Math.round(((currentIndex + 1) / interview.questions.length) * 100)
    : 0;
  const wordsTyped = (answers[currentIndex] || '').trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 animate-fadeIn text-[#f8fafc]">
      {/* Session Top Bar */}
      <div className="flex items-center justify-between border-b border-dark-border pb-4">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            {interview?.topic}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-800/40 px-2 py-0.5 rounded-full border border-slate-700/20">
            {interview?.difficulty} Level
          </span>
        </div>
        
        {/* Timer Box */}
        <div className="flex items-center space-x-2 bg-slate-900/60 border border-dark-border px-4 py-2 rounded-2xl font-mono text-sm text-slate-300 shadow-md">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>{formatTime(timeElapsed)}</span>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: AI Assistant console (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-dark-border shadow-xl flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[360px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
            
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-6 flex items-center space-x-1.5 font-display">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Placement Officer</span>
            </h4>

            {/* Animated Robot AI Face */}
            <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-20 blur-xl transition-all duration-300 ${isSpeaking ? 'animate-pulse scale-110' : ''}`}></div>
              
              <div className={`w-32 h-32 rounded-[2rem] bg-slate-950 border-2 flex flex-col items-center justify-between p-4.5 relative overflow-hidden transition-all duration-500 z-10 ${
                isSpeaking ? 'border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.25)]' : 'border-indigo-500/20'
              }`}>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:6px_6px] pointer-events-none"></div>
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-slate-800'} transition-colors`}></div>
                
                {/* Glowing LED Eyes */}
                <div className="flex justify-between w-full px-5 mt-1">
                  <div className="relative">
                    <div className={`w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] flex items-center justify-center robot-eye`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className={`w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] flex items-center justify-center robot-eye`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                    </div>
                  </div>
                </div>
                
                {/* Mouth Line */}
                <div className="w-20 h-6 flex items-center justify-center">
                  {isSpeaking ? (
                    <div className="flex items-center justify-center space-x-1 w-full h-3">
                      <span className="w-1 h-2.5 bg-cyan-400 rounded-full animate-pulse"></span>
                      <span className="w-1 h-3.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                      <span className="w-1 h-3.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1 h-2.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></span>
                    </div>
                  ) : (
                    <div className="w-12 h-1 bg-indigo-500/25 rounded-full transition-all duration-300 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Speaking Status */}
            <div className="h-10 flex flex-col items-center justify-center">
              {isSpeaking ? (
                <div className="flex items-center space-x-1.5">
                  <span className="soundwave-bar soundwave-bar-1 h-3"></span>
                  <span className="soundwave-bar soundwave-bar-2 h-5"></span>
                  <span className="soundwave-bar soundwave-bar-3 h-7"></span>
                  <span className="soundwave-bar soundwave-bar-4 h-4"></span>
                  <span className="soundwave-bar soundwave-bar-5 h-6"></span>
                  <span className="soundwave-bar soundwave-bar-6 h-8"></span>
                  <span className="soundwave-bar soundwave-bar-7 h-4"></span>
                  <span className="soundwave-bar soundwave-bar-8 h-6"></span>
                  <span className="soundwave-bar soundwave-bar-9 h-3"></span>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest pl-2">Speaking...</span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {isMuted ? 'Voice Muted' : 'Voice Standby'}
                </span>
              )}
            </div>

            {/* Speech Actions */}
            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={handleMuteToggle}
                className={`p-3 rounded-2xl border transition-all ${
                  isMuted
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-slate-900 border-dark-border text-slate-400 hover:text-white hover:border-slate-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => speakQuestion(currentQuestion?.questionText)}
                className="bg-slate-900 border border-dark-border hover:border-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Repeat Question</span>
              </button>

              <button
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className={`p-3 rounded-2xl border transition-all ${
                  showVoiceSettings
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                    : 'bg-slate-900 border-dark-border text-slate-400 hover:text-white hover:border-slate-700'
                }`}
                title="Voice Configuration"
              >
                <Sliders className="w-5 h-5" />
              </button>
            </div>

            {/* Voice Settings drawer */}
            {showVoiceSettings && (
              <div className="w-full mt-6 pt-5 border-t border-dark-border/60 text-left space-y-4 animate-slideDown">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Voice Engine</label>
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => setSelectedVoiceName(e.target.value)}
                    className="w-full bg-slate-900 border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
                  >
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Speed</span>
                      <span className="text-slate-400">{speechRate}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.4"
                      step="0.05"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Pitch</span>
                      <span className="text-slate-400">{speechPitch}</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.4"
                      step="0.1"
                      value={speechPitch}
                      onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper progress */}
          <div className="glass-panel p-6 rounded-3xl border border-dark-border space-y-4">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Progress</h5>
            <div className="space-y-3.5 relative pl-3">
              <div className="absolute top-3 bottom-3 left-[17px] w-0.5 bg-dark-border"></div>
              {interview?.questions?.map((q, idx) => (
                <div key={q.id} className="flex items-center space-x-3.5 relative z-10">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                    idx === currentIndex
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 scale-105'
                      : idx < currentIndex
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-900/70 text-slate-500 border-dark-border'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-xs font-medium truncate max-w-[200px] md:max-w-xs transition-colors ${idx === currentIndex ? 'text-slate-200 font-semibold' : 'text-slate-500'}`}>
                    {q.questionText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Question & Text Response (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-7 rounded-3xl border border-dark-border flex flex-col space-y-3 relative overflow-hidden min-h-[140px] justify-center">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Active Question Prompt ({currentIndex + 1}/{interview?.questions?.length})</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 leading-relaxed font-display">
              {currentQuestion?.questionText}
            </h3>
          </div>

          {/* Typing Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Answer Response
              </label>
              <span className="text-xs text-slate-500 font-mono bg-slate-900 border border-dark-border px-2.5 py-1 rounded-lg">
                {wordsTyped} words
              </span>
            </div>
            <textarea
              value={answers[currentIndex] || ''}
              onChange={handleTextChange}
              placeholder="Structure your answer clearly. Try to provide descriptions, code context, or architectural concepts..."
              className="w-full h-80 bg-slate-900/40 hover:bg-slate-900/60 focus:bg-slate-900 border border-dark-border focus:border-indigo-500/80 rounded-3xl p-6 text-slate-200 placeholder-slate-600 outline-none transition-all leading-relaxed font-sans text-sm resize-none shadow-inner"
              id={`answer_textarea_${currentIndex}`}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="bg-slate-900 hover:bg-slate-800 border border-dark-border disabled:opacity-30 disabled:pointer-events-none text-slate-300 px-5 py-3 rounded-2xl transition-all flex items-center space-x-2 text-xs font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            <button
              onClick={() => setShowExitWarning(true)}
              className="text-xs text-slate-600 hover:text-rose-400 transition-colors uppercase tracking-widest font-bold"
            >
              Quit Interview
            </button>

            {currentIndex < (interview?.questions?.length - 1) ? (
              <button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/25 flex items-center space-x-2 text-xs font-bold"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-7 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-600/15 hover:shadow-emerald-500/30 flex items-center space-x-2 text-xs"
                id="submit_interview_btn"
              >
                <Save className="w-4.5 h-4.5" />
                <span>Finish & Analyze Answers</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exit Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-panel w-full max-w-sm p-7 rounded-3xl border border-dark-border flex flex-col items-center text-center space-y-4 shadow-2xl relative animate-fadeIn">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500"></div>
            <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full mt-2">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-white font-display">Abandon Session?</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">Quitting now will delete this practice progress and erase your answers. This action cannot be undone.</p>
            <div className="flex w-full space-x-3.5 pt-3">
              <button
                onClick={() => setShowExitWarning(false)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 border border-dark-border text-slate-400 hover:text-white py-3 rounded-2xl text-xs font-semibold transition-all"
              >
                Resume
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-2xl text-xs font-semibold shadow-md shadow-rose-600/15 transition-all"
              >
                Quit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
