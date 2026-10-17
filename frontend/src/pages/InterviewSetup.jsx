import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { LoadingState } from '../components/LoadingState';
import { ArrowLeft, Sparkles, BookOpen, Layers, Award } from 'lucide-react';

const COMMON_TOPICS = [
  { id: 'javascript', label: 'JavaScript (Frontend Core)' },
  { id: 'react', label: 'React.js (Frontend Framework)' },
  { id: 'hr', label: 'HR & Behavioral Competencies' },
  { id: 'sql', label: 'SQL & Database Queries' },
  { id: 'python', label: 'Python & Data Structures' },
  { id: 'system_design', label: 'System Design & Architecture' }
];

export const InterviewSetup = () => {
  const navigate = useNavigate();
  const [topicType, setTopicType] = useState('common'); // 'common' or 'custom'
  const [selectedTopic, setSelectedTopic] = useState('javascript');
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const topic = topicType === 'common' ? selectedTopic : customTopic;
    if (!topic || topic.trim() === '') {
      setError('Please choose or enter a valid interview topic.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/interviews/start', {
        topic: topic.trim(),
        difficulty,
        questionCount
      });
      // Redirect to the session page
      navigate(`/interviews/${res.data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to start interview and generate questions. Please verify server connection.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center">
        <LoadingState message="AI is customizing your interview questions..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] bg-gradient-radial flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-6 my-8">
        <div className="glass-panel w-full max-w-xl p-8 rounded-3xl border border-dark-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white font-display">Setup Mock Interview</h2>
              <p className="text-xs text-slate-400">Configure parameters for AI question generation</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-sm animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Select */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Choose Interview Domain
              </label>
              
              <div className="flex bg-slate-900/60 p-1 rounded-xl border border-dark-border">
                <button
                  type="button"
                  onClick={() => setTopicType('common')}
                  className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                    topicType === 'common' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Popular Fields
                </button>
                <button
                  type="button"
                  onClick={() => setTopicType('custom')}
                  className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                    topicType === 'custom' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Custom Subject
                </button>
              </div>

              {topicType === 'common' ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-900 border border-dark-border focus:border-indigo-500/80 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {COMMON_TOPICS.map((topic) => (
                      <option key={topic.id} value={topic.id} className="bg-dark-card text-slate-300">
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="relative animate-fadeIn">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Kubernetes, React Native, C++ OOP, Product Management"
                    className="w-full bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-900 border border-dark-border focus:border-indigo-500/80 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* Difficulty Level */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Junior', 'Intermediate', 'Senior'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-3.5 text-center text-xs font-bold rounded-2xl border transition-all ${
                      difficulty === level
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500'
                        : 'bg-slate-900/40 text-slate-400 border-dark-border hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[3, 4, 5, 6].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`py-3 text-center text-xs font-bold rounded-2xl border transition-all ${
                      questionCount === count
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500'
                        : 'bg-slate-900/40 text-slate-400 border-dark-border hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Generate */}
            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/25 flex items-center justify-center space-x-2"
              id="generate_session_btn"
            >
              <Sparkles className="w-4.5 h-4.5" />
              <span>Generate Practice Session</span>
            </button>
          </form>
        </div>
      </main>

      <footer className="py-6 border-t border-dark-border/40 text-center text-xs text-slate-500">
        &copy; 2026 IntervAI. All rights reserved.
      </footer>
    </div>
  );
};
