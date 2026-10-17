import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, LogOut, User, LayoutDashboard, History } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel border-b border-dark-border sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="bg-indigo-600/10 p-2 rounded-xl border border-indigo-500/20 group-hover:border-indigo-500/50 transition-all duration-300">
            <BrainCircuit className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white group-hover:text-indigo-200 transition-colors">
            Interv<span className="text-indigo-400">AI</span>
          </span>
        </Link>

        {/* Action Links / Auth status */}
        {isAuthenticated ? (
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-slate-400 hover:text-white flex items-center space-x-1.5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            <div className="h-4 w-px bg-dark-border"></div>

            {/* Profile indicator & logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-800/40 border border-slate-700/30 px-3 py-1.5 rounded-xl">
                <User className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-slate-300 max-w-[120px] truncate">{user?.username}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                title="Log Out"
                id="logout_btn"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
