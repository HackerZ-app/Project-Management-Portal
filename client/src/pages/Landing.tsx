import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Lightbulb, Shield, Users, BookOpen, Clock } from 'lucide-react';

const LOGO_URL = 'https://upload.wikimedia.org/wikipedia/en/f/f5/SRM_University%2C_Andhra_Pradesh_logo.png';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-center">
        <div className="max-w-5xl w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full shadow-sm flex items-center justify-between px-6 py-2">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 flex-shrink-0 bg-white">
              <img src={LOGO_URL} alt="SRM AP Logo" className="w-full h-full object-cover p-1" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">SRM<span className="text-coreshift-blue">AP</span> Projects</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-slate-900 transition-colors">About</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Guidelines</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Faculty</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
              Sign in
            </Link>
            <button className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all shadow-md">
              Request a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-4 relative flex flex-col items-center justify-center min-h-[90vh]">
        
        {/* Floating Diagram Area */}
        <div className="relative w-full max-w-4xl h-[300px] mb-12 hidden md:block">
          
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <line x1="20%" y1="30%" x2="45%" y2="50%" stroke="#e2e8f0" strokeWidth="2" className="animate-draw-line" />
            <line x1="25%" y1="70%" x2="45%" y2="50%" stroke="#e2e8f0" strokeWidth="2" className="animate-draw-line" />
            <line x1="80%" y1="20%" x2="55%" y2="50%" stroke="#e2e8f0" strokeWidth="2" className="animate-draw-line" />
            <line x1="75%" y1="80%" x2="55%" y2="50%" stroke="#e2e8f0" strokeWidth="2" className="animate-draw-line" />
            <line x1="90%" y1="60%" x2="75%" y2="80%" stroke="#e2e8f0" strokeWidth="2" className="animate-draw-line" />
            
            {/* Connection Dots */}
            <circle cx="20%" cy="30%" r="4" fill="#a5b4fc" />
            <circle cx="25%" cy="70%" r="4" fill="#a5b4fc" />
            <circle cx="80%" cy="20%" r="4" fill="#a5b4fc" />
            <circle cx="75%" cy="80%" r="4" fill="#a5b4fc" />
            <circle cx="90%" cy="60%" r="4" fill="#a5b4fc" />
          </svg>

          {/* Central Block */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl shadow-float flex items-center justify-center animate-float">
            <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Floating Block 1 (Top Left) */}
          <div className="absolute top-[20%] left-[15%] z-10 w-16 h-16 bg-coreshift-yellow rounded-2xl shadow-soft flex items-center justify-center animate-float-delayed">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>

          {/* Floating Block 2 (Bottom Left) */}
          <div className="absolute bottom-[20%] left-[20%] z-10 w-20 h-20 bg-coreshift-blue rounded-2xl shadow-soft flex items-center justify-center animate-float">
            <Users className="w-10 h-10 text-white" />
          </div>

          {/* Floating Block 3 (Top Right) */}
          <div className="absolute top-[10%] right-[20%] z-10 w-20 h-20 bg-coreshift-red rounded-2xl shadow-soft flex items-center justify-center animate-float">
            <Shield className="w-10 h-10 text-white" />
          </div>

          {/* Floating Block 4 (Bottom Right) */}
          <div className="absolute bottom-[10%] right-[25%] z-10 w-16 h-16 rounded-2xl shadow-soft overflow-hidden border-4 border-white animate-float-delayed">
             <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Student" className="w-full h-full object-cover" />
          </div>

          {/* Floating Block 5 (Far Right) */}
          <div className="absolute top-[50%] right-[10%] z-10 w-16 h-16 bg-white rounded-2xl shadow-soft flex items-center justify-center animate-float">
            <BookOpen className="w-8 h-8 text-slate-800" />
          </div>

          {/* Floating Block 6 (Far Left User) */}
          <div className="absolute top-[40%] left-[5%] z-10 w-24 h-24 rounded-3xl shadow-soft overflow-hidden border-4 border-white animate-float">
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Student" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Text Content */}
        <div className="max-w-3xl text-center z-10 relative mt-8 md:mt-0">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            All-in-one Project <br /> management portal
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
            SRM University AP is a modern, all-in-one academic platform designed to perfectly fit your project collaboration, tracking, and evaluation needs.
          </p>
          <Link to="/login" className="inline-block px-8 py-4 bg-coreshift-orange text-white rounded-full text-lg font-semibold shadow-[0_10px_20px_-10px_rgba(255,92,53,0.5)] hover:shadow-[0_10px_25px_-5px_rgba(255,92,53,0.6)] transform hover:-translate-y-0.5 transition-all">
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
};
