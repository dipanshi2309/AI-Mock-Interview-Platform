import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, BookOpen, Compass } from 'lucide-react';

const TIPS = [
  "Use the STAR method (Situation, Task, Action, Result) for behavioral questions.",
  "When solving coding challenges, think out loud. Interviewers care about your process.",
  "If you don't know the answer, explain how you would troubleshoot or research the topic.",
  "Maintain steady pacing. Taking 5-10 seconds to structure your thoughts is perfectly normal.",
  "For system design questions, clarify requirements first before drawing architectures.",
  "Quantify your achievements: 'optimized database performance by 40%' sounds stronger than 'made queries faster'."
];

export const LoadingState = ({ message = "AI Engine is analyzing your answers..." }) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto">
      {/* Outer Rotating Halo */}
      <div className="relative flex items-center justify-center w-28 h-28 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-500/30 animate-spin" style={{ animationDuration: '12s' }}></div>
        <div className="absolute inset-2 rounded-full border-4 border-dotted border-cyan-400/40 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
        <div className="absolute inset-4 bg-indigo-600/10 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-100 font-display mb-2">{message}</h3>
      <p className="text-sm text-slate-400 mb-8 max-w-sm">Please hold on, this process might take up to a minute depending on model analysis speeds.</p>

      {/* Dynamic Tip Box */}
      <div className="glass-panel w-full p-5 rounded-2xl border border-dark-border text-left relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-cyan-500"></div>
        <div className="flex items-start space-x-3.5 pl-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
            {tipIndex % 3 === 0 ? <Compass className="w-4 h-4" /> : tipIndex % 3 === 1 ? <Terminal className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Interview Tip</h4>
            <p className="text-sm text-slate-300 transition-all duration-500 leading-relaxed font-sans">{TIPS[tipIndex]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
