import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';

export const InterviewFeedback = ({ interview }) => {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState(0);

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 6) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getOverallScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-8 animate-fadeIn">
      {/* Back Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-dark-border">
        <button
          onClick={() => navigate('/')}
          className="p-2.5 rounded-xl bg-slate-900 border border-dark-border text-slate-400 hover:text-white hover:border-slate-700 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white font-display">Evaluation Summary</h2>
          <p className="text-xs text-slate-400 font-sans">Detailed analysis computed by Gemini models</p>
        </div>
      </div>

      {/* Main Score Showcase Banner */}
      <div className={`glass-panel border p-8 rounded-3xl flex flex-col md:flex-row items-center md:justify-between gap-6 relative overflow-hidden shadow-2xl ${getOverallScoreColor(interview.overallScore)}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="space-y-3.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2.5">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              {interview.topic}
            </span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-500/20 uppercase tracking-wider">
              {interview.difficulty} Level
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-100 font-display">Performance Report</h3>
          <p className="text-slate-300 max-w-lg leading-relaxed text-sm font-sans">
            {interview.overallFeedback}
          </p>
        </div>

        {/* Big Overall Grade Badge */}
        <div className="shrink-0 flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 border-slate-800 relative bg-slate-900 shadow-inner">
          <Award className="w-5 h-5 text-indigo-400 absolute top-4 animate-pulse" />
          <span className="text-3xl font-extrabold text-white mt-4 font-display">{interview.overallScore}%</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-1">Final Score</span>
        </div>
      </div>

      {/* Expandable detailed results list */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-200 tracking-tight flex items-center space-x-2">
          <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
          <span>Detailed Questions Graded</span>
        </h3>

        <div className="space-y-3">
          {interview.questions.map((q, idx) => {
            const evalItem = interview.feedback.find(f => f.questionId === q.id) || {};
            const isExpanded = expandedIndex === idx;
            const answer = interview.answers[idx] || '';

            return (
              <div
                key={q.id}
                className={`glass-panel rounded-2xl border transition-all duration-300 overflow-hidden shadow-md ${
                  isExpanded ? 'border-indigo-500/35 bg-slate-900/40' : 'border-dark-border hover:border-slate-700/80'
                }`}
              >
                {/* Header */}
                <div
                  onClick={() => toggleExpand(idx)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none gap-4"
                >
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 border transition-all ${
                      isExpanded ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-dark-border text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-200 leading-snug truncate max-w-sm md:max-w-xl font-display">
                      {q.questionText}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${getScoreColor(evalItem.score || 0)}`}>
                      Grade {evalItem.score || 0}/10
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {/* Dropdown Body */}
                {isExpanded && (
                  <div className="px-5 pb-6 border-t border-dark-border/40 bg-slate-950/20 space-y-6 pt-5 animate-slideDown">
                    {/* User Answer */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Submitted Answer</span>
                      </div>
                      <p className="bg-slate-900/80 border border-dark-border/40 p-4.5 rounded-2xl text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {answer.trim() || <span className="text-slate-600 italic">Candidate did not input any response.</span>}
                      </p>
                    </div>

                    {/* AI evaluation */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Score Analysis</span>
                      </div>
                      <div className="bg-indigo-950/20 border border-indigo-500/10 p-4.5 rounded-2xl text-slate-300 text-sm leading-relaxed font-sans relative">
                        <div className="absolute top-4 right-4 text-indigo-500/20 font-display font-extrabold text-4xl">AI</div>
                        {evalItem.evaluation || 'No detailed analysis provided.'}
                      </div>
                    </div>

                    {/* Standard Objectives */}
                    {q.sampleAnswer && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Standard Answer Objectives</span>
                        </div>
                        <p className="bg-cyan-950/20 border border-cyan-500/10 p-4.5 rounded-2xl text-slate-300 text-sm leading-relaxed font-sans">
                          {q.sampleAnswer}
                        </p>
                      </div>
                    )}

                    {/* Recommendations */}
                    {evalItem.tips && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Key Recommendations</span>
                        </div>
                        <p className="bg-emerald-950/20 border border-emerald-500/10 p-4.5 rounded-2xl text-slate-300 text-sm leading-relaxed font-sans">
                          {evalItem.tips}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
