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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Warning */}
        {user && !user.isProfileComplete && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-yellow-800">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
              <span>
                Your academic profile is incomplete. Please confirm your roll number and departmental details to enable automated project enrollment.
              </span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-1.5 rounded-md font-medium bg-yellow-100 hover:bg-yellow-200 text-yellow-900 transition-colors shrink-0"
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 mb-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-xl border border-slate-200 object-cover shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Welcome, {user?.name}
                  </h1>
                  <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {user?.role}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {user?.department} &bull; <span className="text-slate-700">{user?.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                <FolderGit2 className="w-4 h-4" />
                <span>Explore Projects</span>
              </button>

              {(user?.role === 'faculty' || user?.role === 'coordinator' || user?.role === 'admin') && (
                <button
                  onClick={() => navigate('/projects/create')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all"
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
          <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    RBAC Authorization Middleware Tester
                  </h2>
                  <p className="text-xs text-slate-500">
                    Test the <code className="bg-slate-100 text-slate-700 px-1 rounded">verifyToken</code> and <code className="bg-slate-100 text-slate-700 px-1 rounded">checkRole</code> backend guards
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => testEndpoint('Admin Resource', authService.testAdminAccess)}
                disabled={testing}
                className="p-3 rounded-md bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>/api/auth/admin-only</span>
                </div>
                <p className="text-[11px] text-slate-500">Restricted to Admin</p>
              </button>

              <button
                onClick={() => testEndpoint('Faculty Resource', authService.testFacultyAccess)}
                disabled={testing}
                className="p-3 rounded-md bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>/api/auth/faculty-only</span>
                </div>
                <p className="text-[11px] text-slate-500">Faculty, Coord, Admin</p>
              </button>

              <button
                onClick={() => testEndpoint('Student Resource', authService.testStudentAccess)}
                disabled={testing}
                className="p-3 rounded-md bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>/api/auth/student-only</span>
                </div>
                <p className="text-[11px] text-slate-500">Student & Admin</p>
              </button>
            </div>

            {/* Test Output Box */}
            <div
              className={`p-4 rounded-md border transition-all text-xs ${
                testResult.status === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : testResult.status === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold mb-1">
                {testResult.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
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
                <div className="p-2 rounded-md bg-green-50 text-green-600 border border-green-100">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Phase 1 Architecture Status</h2>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200">
                  <span>Domain Policy</span>
                  <span className="font-mono text-green-700">@srmap.edu.in</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200">
                  <span>Google hd Claim</span>
                  <span className="font-mono text-green-700">Enforced</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200">
                  <span>JWT Token Guard</span>
                  <span className="font-mono text-green-700">verifyToken Active</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200">
                  <span>Session Hydration</span>
                  <span className="font-mono text-green-700">/auth/me on mount</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200">
                  <span>Socket.IO Ready</span>
                  <span className="font-mono text-green-700">http.Server Wrapped</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portal Capabilities Overview */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Upcoming Academic Modules</h2>
          <span className="text-xs text-slate-500">Scheduled for subsequent phases</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 w-fit mb-3">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Project Registry</h3>
            <p className="text-xs text-slate-500 mt-1">
              Capstone & mini-project proposals, synopsis tracking, and faculty guide allocation.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 w-fit mb-3">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Team Formation</h3>
            <p className="text-xs text-slate-500 mt-1">
              Student group creation, invitations, cross-department team management, and approvals.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 w-fit mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Rubrics & Evaluation</h3>
            <p className="text-xs text-slate-500 mt-1">
              Mid-term reviews, viva schedules, continuous assessment marks, and rubrics matrix.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 w-fit mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Mentorship Meetings</h3>
            <p className="text-xs text-slate-500 mt-1">
              Real-time schedule synchronization, guide notes, and milestone sign-offs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
