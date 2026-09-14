import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { ShieldCheck, Sparkles, Code2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Alert } from '../components/Alert';
import { UserRole } from '../types/auth.types';

const LOGO_URL = 'https://upload.wikimedia.org/wikipedia/en/f/f5/SRM_University%2C_Andhra_Pradesh_logo.png';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, devLogin, isAuthenticated, error, clearError, isLoading } = useAuthStore();

  const [devRole, setDevRole] = useState<UserRole>('student');
  const [devEmail, setDevEmail] = useState('student@srmap.edu.in');
  const [devName, setDevName] = useState('Arjun Kumar');
  const [isSubmittingDev, setIsSubmittingDev] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Top Left Navigation Back */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 mb-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-white shadow-soft flex-shrink-0 bg-white">
            <img src={LOGO_URL} alt="SRM AP Logo" className="w-full h-full object-cover p-1.5" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Sign in to your university project workspace
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-float border border-slate-100">
          
          <div className="mb-6 p-3 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3 text-xs text-indigo-800 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>
              Restricted portal. Only official <strong className="font-semibold">@srmap.edu.in</strong> Google accounts are permitted.
            </span>
          </div>

          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} onClose={clearError} />
            </div>
          )}

          <div className="space-y-4 mt-2">
            <div className="flex flex-col items-center justify-center w-full min-h-[44px]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                shape="pill"
                size="large"
                text="signin_with"
                width="100%"
              />
            </div>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-10 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-coreshift-orange flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" /> Dev Sandbox
                </span>
                <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                  Local Dev Only
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {(['student', 'faculty', 'coordinator', 'admin'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDevRoleChange(role)}
                    className={`py-1.5 text-xs capitalize rounded-xl font-medium transition-all ${
                      devRole === role
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <form onSubmit={handleDevSubmit} className="space-y-3">
                <div>
                  <input
                    type="email"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    required
                    placeholder="name@srmap.edu.in"
                    className="w-full px-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingDev || isLoading}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-coreshift-blue hover:bg-blue-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Sign In as {devRole.toUpperCase()}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          SRM University-AP &bull; Project Management Portal
        </p>
      </div>
    </div>
  );
};
