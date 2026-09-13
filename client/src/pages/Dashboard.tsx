import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/Navbar';
import { EligibilityCard } from '../components/EligibilityCard';
import authService from '../services/auth.service';
import {
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  FileSpreadsheet,
  Users2,
  Calendar,
  ShieldCheck,
  Database,
  Lock,
  PlusCircle,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [testResult, setTestResult] = useState<{
    endpoint: string;
    status: 'success' | 'error' | 'idle';
    message: string;
    data?: any;
  }>({
    endpoint: '',
    status: 'idle',
    message: 'Click any endpoint above to test role authorization middleware in real time.',
  });
  const [testing, setTesting] = useState(false);

  const testEndpoint = async (
    name: string,
    callFn: () => Promise<any>
  ) => {
    setTesting(true);
    try {
      const data = await callFn();
      setTestResult({
        endpoint: name,
        status: 'success',
        message: data.message || 'Access Authorized (HTTP 200 OK)',
        data,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Access Forbidden (HTTP 403)';
      setTestResult({
        endpoint: name,
        status: 'error',
        message,
        data: err.response?.data,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Warning */}
        {user && !user.isProfileComplete && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Your academic profile is incomplete. Please confirm your roll number and departmental details to enable automated project enrollment.
              </span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-1.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shrink-0"
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel gradient-border mb-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-glow"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-glow">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Welcome, {user?.name}
                  </h1>
                  <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {user?.role}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {user?.department} &bull; <span className="text-indigo-400">{user?.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow transition-all"
              >
                <FolderGit2 className="w-4 h-4" />
                <span>Explore Projects</span>
              </button>

              {(user?.role === 'faculty' || user?.role === 'coordinator' || user?.role === 'admin') && (
                <button
                  onClick={() => navigate('/projects/create')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Propose Project</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Phase 2: Embedded Student Eligibility Status Card */}
        {user?.role === 'student' && (
          <div className="mb-8">
            <EligibilityCard />
          </div>
        )}

        {/* Phase 1 Architecture Verification Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Module 1 & 2 RBAC Live Tester */}
          <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    RBAC Authorization Middleware Tester
                  </h2>
                  <p className="text-xs text-slate-400">
                    Test the <code className="text-indigo-400">verifyToken</code> and <code className="text-indigo-400">checkRole</code> backend guards
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => testEndpoint('Admin Resource', authService.testAdminAccess)}
                disabled={testing}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-purple-400 mb-1 flex items-center justify-between">
                  <span>/api/auth/admin-only</span>
                </div>
                <p className="text-[11px] text-slate-400">Restricted to Admin</p>
              </button>

              <button
                onClick={() => testEndpoint('Faculty Resource', authService.testFacultyAccess)}
                disabled={testing}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-blue-400 mb-1 flex items-center justify-between">
                  <span>/api/auth/faculty-only</span>
                </div>
                <p className="text-[11px] text-slate-400">Faculty, Coord, Admin</p>
              </button>

              <button
                onClick={() => testEndpoint('Student Resource', authService.testStudentAccess)}
                disabled={testing}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                  <span>/api/auth/student-only</span>
                </div>
                <p className="text-[11px] text-slate-400">Student & Admin</p>
              </button>
            </div>

            {/* Test Output Box */}
            <div
              className={`p-4 rounded-xl border transition-all text-xs ${
                testResult.status === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : testResult.status === 'error'
                  ? 'bg-red-950/30 border-red-500/30 text-red-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold mb-1">
                {testResult.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : testResult.status === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {testResult.endpoint ? `${testResult.endpoint} Result:` : 'Awaiting Test Execution'}
                </span>
              </div>
              <p className="pl-6 font-mono text-[11px] leading-relaxed">
                {testResult.message}
              </p>
            </div>
          </div>

          {/* System Architecture Checklist */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-white">Phase 1 Architecture Status</h2>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Domain Policy</span>
                  <span className="font-mono text-emerald-400">@srmap.edu.in</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Google hd Claim</span>
                  <span className="font-mono text-emerald-400">Enforced</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>JWT Token Guard</span>
                  <span className="font-mono text-emerald-400">verifyToken Active</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Session Hydration</span>
                  <span className="font-mono text-emerald-400">/auth/me on mount</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Socket.IO Ready</span>
                  <span className="font-mono text-emerald-400">http.Server Wrapped</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portal Capabilities Overview */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Upcoming Academic Modules</h2>
          <span className="text-xs text-slate-500">Scheduled for subsequent phases</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit mb-3">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Project Registry</h3>
            <p className="text-xs text-slate-400 mt-1">
              Capstone & mini-project proposals, synopsis tracking, and faculty guide allocation.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit mb-3">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Team Formation</h3>
            <p className="text-xs text-slate-400 mt-1">
              Student group creation, invitations, cross-department team management, and approvals.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Rubrics & Evaluation</h3>
            <p className="text-xs text-slate-400 mt-1">
              Mid-term reviews, viva schedules, continuous assessment marks, and rubrics matrix.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Mentorship Meetings</h3>
            <p className="text-xs text-slate-400 mt-1">
              Real-time schedule synchronization, guide notes, and milestone sign-offs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
