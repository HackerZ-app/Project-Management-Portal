import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import {
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Code2,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Alert } from '../components/Alert';
import { UserRole } from '../types/auth.types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, devLogin, isAuthenticated, error, clearError, isLoading } =
    useAuthStore();

  const [devRole, setDevRole] = useState<UserRole>('student');
  const [devEmail, setDevEmail] = useState('student@srmap.edu.in');
  const [devName, setDevName] = useState('Arjun Kumar');
  const [isSubmittingDev, setIsSubmittingDev] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const success = await loginWithGoogle(credentialResponse.credential);
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  const handleGoogleError = () => {
    useAuthStore.setState({
      error: 'Google Sign-In was cancelled or encountered an error. Please try again.',
    });
  };

  const handleDevRoleChange = (role: UserRole) => {
    setDevRole(role);
    switch (role) {
      case 'student':
        setDevEmail('student@srmap.edu.in');
        setDevName('Arjun Kumar');
        break;
      case 'faculty':
        setDevEmail('prof.ramesh@srmap.edu.in');
        setDevName('Dr. Ramesh Babu');
        break;
      case 'coordinator':
        setDevEmail('coordinator.cse@srmap.edu.in');
        setDevName('Prof. Priya Sharma');
        break;
      case 'admin':
        setDevEmail('admin@srmap.edu.in');
        setDevName('System Admin');
        break;
    }
  };

  const handleDevSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDev(true);
    const success = await devLogin({
      email: devEmail,
      name: devName,
      role: devRole,
      department: 'Computer Science and Engineering',
    });
    setIsSubmittingDev(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* University Header Brand */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-glow border border-indigo-400/30 animate-in zoom-in duration-300">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-3xl font-extrabold tracking-tight text-white">
          Academic Project Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          SRM University-AP Project Management & Evaluation System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl shadow-2xl border border-slate-800">
          {/* Domain Restriction Notice */}
          <div className="mb-6 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2.5 text-xs text-indigo-200">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>
              Restricted portal. Only official <strong className="text-white font-semibold">@srmap.edu.in</strong> Google accounts are permitted.
            </span>
          </div>

          {/* Error Alert Display */}
          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} onClose={clearError} />
            </div>
          )}

          {/* Primary Action: Google Sign-In */}
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center w-full min-h-[44px]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="filled_black"
                shape="pill"
                size="large"
                text="signin_with"
                width="100%"
              />
            </div>

            <p className="text-center text-xs text-slate-500 pt-2">
              Authentication secured with Google Identity & University Single Sign-On
            </p>
          </div>

          {/* Development Sandbox Mode */}
          {import.meta.env.DEV && (
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> Dev Sandbox Simulator
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  Local Dev Only
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Simulate role-based logins instantly before configuring live Google credentials:
              </p>

              {/* Role Selector Tabs */}
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {(['student', 'faculty', 'coordinator', 'admin'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDevRoleChange(role)}
                    className={`py-1.5 text-xs capitalize rounded-lg font-medium transition-all ${
                      devRole === role
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <form onSubmit={handleDevSubmit} className="space-y-2">
                <div>
                  <input
                    type="email"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    required
                    placeholder="name@srmap.edu.in"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingDev || isLoading}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Sign In as {devRole.toUpperCase()}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500">
          SRM University-AP &bull; Project Management Portal &bull; Phase 1
        </p>
      </div>
    </div>
  );
};
