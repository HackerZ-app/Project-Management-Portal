import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 rounded-3xl bg-red-950/40 border border-red-500/30 text-red-400 mb-6 shadow-glow">
        <ShieldAlert className="w-16 h-16" />
      </div>

      <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
        403 - Access Forbidden
      </h1>

      <p className="mt-3 max-w-md text-sm text-slate-400">
        You do not have the necessary role permissions to access this university resource. Your current role is{' '}
        <span className="font-semibold text-indigo-400 uppercase tracking-wide">
          {user?.role || 'unassigned'}
        </span>.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow transition-colors"
        >
          <Home className="w-4 h-4" /> Return to Dashboard
        </button>
      </div>
    </div>
  );
};
