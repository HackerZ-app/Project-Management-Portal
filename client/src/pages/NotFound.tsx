import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 mb-6 shadow-glow">
        <FileQuestion className="w-16 h-16" />
      </div>

      <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
        404 - Page Not Found
      </h1>

      <p className="mt-3 max-w-md text-sm text-slate-400">
        The academic portal route you requested could not be located.
      </p>

      <div className="mt-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow transition-colors"
        >
          <Home className="w-4 h-4" /> Go to Portal Dashboard
        </button>
      </div>
    </div>
  );
};
