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
  X,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [bannerDismissed, setBannerDismissed] = useState(false);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Full-width Dismissible Profile Progress Banner */}
        {user && !user.isProfileComplete && !bannerDismissed && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border border-amber-200 p-5 shadow-xs relative animate-in fade-in slide-in-from-top-2 duration-300">
            <button
              onClick={() => setBannerDismissed(true)}
              className="absolute top-4 right-4 p-1 rounded-lg text-amber-700/60 hover:text-amber-900 hover:bg-amber-100/60 transition-colors"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pr-8">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Action Required &bull; Academic Profile Incomplete
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  Confirm your SRM AP roll number and departmental skillset to enable project matching
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Your official profile currently lacks verified registration attributes. Completing your profile takes less than 2 minutes and unlocks automated team formation and capstone eligibility verification.
                </p>

                {/* Progress bar */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-amber-900">Setup Progress: 65% Completed</span>
                    <span className="text-slate-500 font-mono">1 Remaining Field</span>
                  </div>
                  <div className="w-full bg-amber-200/80 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full w-[65%] transition-all duration-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all flex items-center gap-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <span>Complete Academic Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="p-6 sm:p-7 rounded-xl bg-white border border-slate-200 mb-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-xl border border-slate-200 object-cover shadow-2xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Welcome back, {user?.name}
                  </h1>
                  <span className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {user?.role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {user?.department} &bull; <span className="text-slate-700">{user?.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                <FolderGit2 className="w-4 h-4" />
                <span>Explore Projects</span>
              </button>

              {(user?.role === 'faculty' || user?.role === 'coordinator' || user?.role === 'admin') && (
                <button
                  onClick={() => navigate('/projects/create')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-all shadow-2xs"
                >
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  <span>Propose Project</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Phase 2: Embedded Student Eligibility Status Card */}
        {user?.role === 'student' && (
          <div className="mb-6">
            <EligibilityCard />
          </div>
        )}

        {/* Phase 1 Architecture Verification Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Module 1 & 2 RBAC Live Tester */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    RBAC Authorization Middleware Tester
                  </h2>
                  <p className="text-xs text-slate-500">
                    Test the <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">verifyToken</code> and <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">checkRole</code> backend guards
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => testEndpoint('Admin Resource', authService.testAdminAccess)}
                disabled={testing}
                className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 text-left transition-all shadow-2xs group"
              >
                <div className="text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="font-mono">/api/auth/admin-only</span>
                </div>
                <p className="text-[11px] text-slate-500">Restricted to Admin</p>
              </button>

              <button
                onClick={() => testEndpoint('Faculty Resource', authService.testFacultyAccess)}
                disabled={testing}
                className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 text-left transition-all shadow-2xs group"
              >
                <div className="text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="font-mono">/api/auth/faculty-only</span>
                </div>
                <p className="text-[11px] text-slate-500">Faculty, Coord, Admin</p>
              </button>

              <button
                onClick={() => testEndpoint('Student Resource', authService.testStudentAccess)}
                disabled={testing}
                className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 text-left transition-all shadow-2xs group"
              >
                <div className="text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="font-mono">/api/auth/student-only</span>
                </div>
                <p className="text-[11px] text-slate-500">Student & Admin</p>
              </button>
            </div>

            {/* Test Output Box */}
            <div
              className={`p-4 rounded-xl border transition-all text-xs ${
                testResult.status === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : testResult.status === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold mb-1">
                {testResult.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : testResult.status === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-600" />
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
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Phase 1 Architecture Status</h2>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span>Domain Policy</span>
                  <span className="font-mono text-emerald-700 font-semibold">@srmap.edu.in</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span>Google hd Claim</span>
                  <span className="font-mono text-emerald-700 font-semibold">Enforced</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span>JWT Token Guard</span>
                  <span className="font-mono text-emerald-700 font-semibold">verifyToken Active</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span>Session Hydration</span>
                  <span className="font-mono text-emerald-700 font-semibold">/auth/me on mount</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span>Socket.IO Ready</span>
                  <span className="font-mono text-emerald-700 font-semibold">http.Server Wrapped</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portal Capabilities Overview */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Academic Portal Modules</h2>
          <span className="text-xs text-slate-500 font-medium">Enterprise Suite AY 2026-27</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/projects')}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 w-fit mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Project Catalog
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Capstone & mini-project proposals, synopsis tracking, and faculty guide allocation.
            </p>
          </div>

          <div
            onClick={() => navigate('/groups')}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 w-fit mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Team Formation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Student group creation, invitations, cross-department team management, and approvals.
            </p>
          </div>

          <div
            onClick={() => navigate('/workspace')}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 w-fit mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Execution Workspace
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Mid-term reviews, viva schedules, continuous assessment marks, and rubrics matrix.
            </p>
          </div>

          <div
            onClick={() => navigate('/meetings')}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 w-fit mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Mentorship Meetings
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Real-time schedule synchronization, guide notes, and milestone sign-offs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
