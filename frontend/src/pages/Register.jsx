import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Mail, Lock, UserPlus, AlertCircle, ArrowRight, User } from 'lucide-react';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error, setError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear global auth errors when mounting
    setError(null);
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    if (!username || !email || !password) {
      setLocalError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] bg-gradient-radial flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-6 my-8">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-dark-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-display text-white">Create Account</h2>
            <p className="text-slate-400 text-sm mt-1.5">Join IntervAI and start practicing interviews</p>
          </div>

          {(localError || error) && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl flex items-start space-x-2.5 text-sm animate-pulse">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-900 border border-dark-border focus:border-indigo-500/80 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
                  id="username_input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-900 border border-dark-border focus:border-indigo-500/80 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
                  id="email_input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min. 6 chars)"
                  className="w-full bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-900 border border-dark-border focus:border-indigo-500/80 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
                  id="password_input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-2xl transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
              id="register_submit_btn"
            >
              <span>{isSubmitting ? 'Registering...' : 'Register'}</span>
              {!isSubmitting && <UserPlus className="w-4.5 h-4.5" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-dark-border text-center text-sm text-slate-400">
            <span>Already have an account? </span>
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-0.5">
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-dark-border/40 text-center text-xs text-slate-500">
        &copy; 2026 IntervAI. All rights reserved.
      </footer>
    </div>
  );
};
