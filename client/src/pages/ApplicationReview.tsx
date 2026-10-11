import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import applicationService from '../services/application.service';
import { Application } from '../types/application.types';
import { Alert } from '../components/Alert';
import {
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  FileText,
  RotateCw,
  Check,
  X,
} from 'lucide-react';

export const ApplicationReview: React.FC = () => {

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Reject Modal State
  const [rejectAppId, setRejectAppId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getFacultyApplications();
      setApplications(data.applications);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load project applications.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (app: Application) => {
    if (
      !window.confirm(
        `Approve application for "${app.project.title}"?\n\nThis will atomically allocate project capacity and automatically withdraw this team's applications from other projects.`
      )
    ) {
      return;
    }

    setActionLoading(app._id);
    setFeedback(null);

    try {
      const res = await applicationService.evaluateApplication(app._id, {
        status: 'approved',
        feedback: 'Approved by faculty mentor after academic credentials review.',
      });

      setFeedback({
        type: 'success',
        message: res.message,
      });
      fetchApplications();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to approve application.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectAppId) return;

    setActionLoading(rejectAppId);
    setFeedback(null);

    try {
      const res = await applicationService.evaluateApplication(rejectAppId, {
        status: 'rejected',
        feedback: rejectReason || 'Application declined by faculty mentor.',
      });

      setFeedback({
        type: 'success',
        message: res.message,
      });
      setRejectAppId(null);
      setRejectReason('');
      fetchApplications();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to reject application.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Group applications by status
  const pendingApps = applications.filter((a) => a.status === 'pending');
  const approvedApps = applications.filter((a) => a.status === 'approved');
  const rejectedApps = applications.filter((a) => a.status === 'rejected');

  const calculateTeamCgpa = (app: Application): number => {
    if (app.group && app.group.members && app.group.members.length > 0) {
      const sum = app.group.members.reduce((acc, m) => acc + (m.cgpa || 0), 0);
      return sum / app.group.members.length;
    }
    return app.appliedBy?.cgpa || 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Application Review Workspace
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Faculty Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Evaluate student proposals, inspect academic credentials, and allocate project slots.
            </p>
          </div>

          <button
            onClick={fetchApplications}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all self-start sm:self-auto shadow-sm"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            Refresh Board
          </button>
        </div>

        {feedback && (
          <div className="mb-6">
            <Alert
              type={feedback.type}
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          </div>
        )}

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Pending Review */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-yellow-600" /> Pending Review
              </span>
              <span className="text-xs font-mono font-bold bg-yellow-100 px-2 py-0.5 rounded-md">
                {pendingApps.length}
              </span>
            </div>

            {pendingApps.length === 0 ? (
              <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-sm">
                No pending applications awaiting evaluation.
              </div>
            ) : (
              pendingApps.map((app) => {
                const avgCgpa = calculateTeamCgpa(app);
                const isGroup = !!app.group;
                const members = isGroup ? app.group?.members || [] : [app.appliedBy];

                return (
                  <div
                    key={app._id}
                    className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
                  >
                    {/* Project & Domain */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {app.project.domain}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-2">
                        {app.project.title}
                      </h3>
                    </div>

                    {/* Applicant / Group Info */}
                    <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {isGroup ? app.group?.name : app.appliedBy?.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-blue-600">
                          {isGroup ? `${members.length} Members` : 'Solo'}
                        </span>
                      </div>

                      {/* Members Avatars & Roll Nos */}
                      <div className="space-y-1">
                        {members.map((m) => (
                          <div key={m._id || m.id || m.email} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-700 truncate max-w-[150px]">{m.name}</span>
                            <span className="font-mono text-slate-500">{m.rollNumber}</span>
                          </div>
                        ))}
                      </div>

                      {/* Average CGPA */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-slate-600 text-[11px] flex items-center gap-1 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> Team Average CGPA
                        </span>
                        <span className="font-bold text-green-600 font-mono">
                          {avgCgpa.toFixed(2)} / 10.0
                        </span>
                      </div>
                    </div>

                    {/* Statement of Purpose */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-blue-500" /> Statement of Purpose:
                      </span>
                      <p className="text-xs text-slate-700 bg-white p-2.5 rounded-md border border-slate-200 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {app.statementOfPurpose}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                      <button
                        onClick={() => handleApprove(app)}
                        disabled={actionLoading === app._id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>

                      <button
                        onClick={() => setRejectAppId(app._id)}
                        disabled={actionLoading === app._id}
                        className="px-3 py-2 rounded-md text-xs font-medium text-red-700 hover:text-red-800 bg-white hover:bg-red-50 border border-red-200 shadow-sm transition-all disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Column 2: Approved / Allocated */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-green-50 border border-green-200 text-green-800">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Approved & Allocated
              </span>
              <span className="text-xs font-mono font-bold bg-green-100 px-2 py-0.5 rounded-md border border-green-200">
                {approvedApps.length}
              </span>
            </div>

            {approvedApps.length === 0 ? (
              <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-sm">
                No approved applications yet.
              </div>
            ) : (
              approvedApps.map((app) => (
                <div
                  key={app._id}
                  className="p-5 rounded-xl bg-white border border-green-200 shadow-sm space-y-3"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-green-100 text-green-800 border border-green-200">
                      Capacity Reserved
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-2">
                      {app.project.title}
                    </h3>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-green-700 block">
                      {app.group ? app.group.name : app.appliedBy?.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Approved on{' '}
                      {app.evaluatedAt
                        ? new Date(app.evaluatedAt).toLocaleDateString()
                        : 'Recently'}
                    </span>
                  </div>

                  {app.feedback && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-md border border-slate-100">
                      "{app.feedback}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Column 3: Rejected / Withdrawn */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-slate-500" /> Rejected / Withdrawn
              </span>
              <span className="text-xs font-mono font-bold bg-slate-200 px-2 py-0.5 rounded-md text-slate-700 border border-slate-300">
                {rejectedApps.length}
              </span>
            </div>

            {rejectedApps.length === 0 ? (
              <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-sm">
                No rejected applications.
              </div>
            ) : (
              rejectedApps.map((app) => (
                <div
                  key={app._id}
                  className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm opacity-75 space-y-2"
                >
                  <h3 className="font-bold text-slate-700 text-xs line-clamp-1">
                    {app.project.title}
                  </h3>
                  <span className="text-xs text-slate-500 block">
                    Applicant: {app.group ? app.group.name : app.appliedBy?.name}
                  </span>
                  <p className="text-[11px] text-red-700 bg-red-50 p-2 rounded-md border border-red-100">
                    {app.feedback || 'Application declined.'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reject Modal with Feedback */}
        {rejectAppId && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200 relative">
              <button
                onClick={() => setRejectAppId(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-slate-900 mb-2">Decline Application</h2>
              <p className="text-xs text-slate-500 mb-4">
                Provide feedback to the student team regarding prerequisites, capacity, or problem alignment.
              </p>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Faculty Feedback / Reason for Decline
                  </label>
                  <textarea
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Project scope requires advanced computer vision coursework not yet completed by applicants..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRejectAppId(null)}
                    className="px-4 py-2 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
