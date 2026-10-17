import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { StatsChart } from '../components/StatsChart';
import { useAuth } from '../context/AuthContext';
import {
  Play,
  Award,
  Calendar,
  Sparkles,
  TrendingUp,
  ChevronRight,
  BookOpen,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    topicPerformance: {},
    scoreHistory: [],
    areasForImprovement: []
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await axios.get('/api/dashboard/stats');
        const historyRes = await axios.get('/api/interviews/history');
        setStats(statsRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a13] flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Gathering performance metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasInterviews = stats.totalInterviews > 0;

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-between relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-3xl -z-10"></div>
      
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 space-y-10 z-10 relative">
        {/* Welcome Header Hero Banner */}
        <section className="glass-panel p-8 md:p-10 rounded-3xl border border-dark-border/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-display">
              Elevate Your <span className="text-gradient">Placement Skills</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed font-sans">
              Welcome back, <span className="text-indigo-400 font-semibold">{user?.username}</span>! Practice custom technical & HR interviews, listen to speaking AI assistants, and obtain instant feedback powered by Gemini AI models.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/setup')}
            className="shrink-0 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold px-7 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 flex items-center justify-center space-x-2.5 scale-100 hover:scale-[1.02] active:scale-98"
            id="start_interview_btn"
          >
            <Play className="w-5 h-5 fill-current text-white/90" />
            <span>Start Practice Session</span>
          </button>
        </section>

        {/* Overview Stats Widgets */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tile 1: Total Completed */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-border/50 flex items-center space-x-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all"></div>
            <div className="bg-indigo-500/10 text-indigo-400 p-4 rounded-xl border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Sessions Completed</p>
              <h3 className="text-2xl font-bold text-slate-200 mt-0.5">{stats.totalInterviews}</h3>
            </div>
          </div>

          {/* Tile 2: Average Score */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-border/50 flex items-center space-x-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all"></div>
            <div className="bg-cyan-500/10 text-cyan-400 p-4 rounded-xl border border-cyan-500/20 group-hover:border-cyan-500/40 transition-all">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Average AI Score</p>
              <h3 className="text-2xl font-bold text-slate-200 mt-0.5">
                {hasInterviews ? `${stats.averageScore}%` : 'N/A'}
              </h3>
            </div>
          </div>

          {/* Tile 3: Readiness rating */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-border/50 flex items-center space-x-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all"></div>
            <div className="bg-purple-500/10 text-purple-400 p-4 rounded-xl border border-purple-500/20 group-hover:border-purple-500/40 transition-all">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Readiness Status</p>
              <h3 className="text-2xl font-bold text-slate-200 mt-0.5">
                {hasInterviews ? (stats.averageScore >= 80 ? 'Job-Ready' : stats.averageScore >= 60 ? 'Competitive' : 'Improving') : 'Not Started'}
              </h3>
            </div>
          </div>
        </section>

        {/* Detailed Analytics / Charts */}
        {hasInterviews && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-200 tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Performance Insights</span>
            </h2>
            <StatsChart topicPerformance={stats.topicPerformance} scoreHistory={stats.scoreHistory} />
          </section>
        )}

        {/* Dynamic Focus Areas & Recent logs Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Focus suggestions column (col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            <section className="glass-panel p-6 rounded-3xl border border-dark-border/60 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-slate-200 tracking-tight flex items-center space-x-2">
                <Sparkles className="w-4.5 h-4.5 text-yellow-400" />
                <span>AI-Driven Improvements</span>
              </h2>

              {!hasInterviews ? (
                <div className="py-10 text-center text-slate-500 text-sm font-sans">
                  Submit a practice session to receive dynamic guidelines and recommended topics.
                </div>
              ) : stats.areasForImprovement.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm font-sans">
                  🎉 Fantastic! You completed all questions with high scores. Keep maintaining this level!
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.areasForImprovement.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-4 bg-slate-950/40 border border-dark-border/40 p-4.5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-cyan-500"></div>
                      <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase mt-0.5 shrink-0">
                        Score {rec.score}/10
                      </div>
                      <div className="space-y-1 min-w-0 flex-grow">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{rec.topic}</span>
                          <span className="text-slate-700 hidden sm:inline">•</span>
                          <p className="text-xs text-slate-500 truncate max-w-xs md:max-w-md font-sans">{rec.question}</p>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{rec.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* History log list sidebar */}
          <div className="space-y-6">
            <section className="glass-panel p-6 rounded-3xl border border-dark-border/60 shadow-xl flex flex-col space-y-4">
              <h2 className="text-base font-bold text-slate-200 tracking-tight flex items-center space-x-2">
                <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                <span>Practice Log</span>
              </h2>

              {history.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center py-12 text-center text-slate-600 text-sm font-sans">
                  <HelpCircle className="w-8 h-8 mb-2 opacity-30" />
                  <span>No completed interviews</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {history.map((session) => (
                    <div
                      key={session._id}
                      onClick={() => navigate(`/interviews/${session._id}`)}
                      className="group bg-slate-950/20 hover:bg-slate-950/70 border border-dark-border/40 hover:border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300"
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-200 capitalize truncate">{session.topic}</h4>
                          <span className="text-slate-700">•</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{session.difficulty}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {new Date(session.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      {session.status === 'completed' ? (
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                            session.overallScore >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                            session.overallScore >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                            'text-rose-400 bg-rose-500/10 border-rose-500/20'
                          }`}>
                            {session.overallScore}%
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg shrink-0 animate-pulse">
                          Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-dark-border/40 text-center text-xs text-slate-600 mt-12 z-10">
        &copy; 2026 IntervAI. All rights reserved.
      </footer>
    </div>
  );
};
