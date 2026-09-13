import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import projectService from '../services/project.service';
import meetingService from '../services/meeting.service';
import { Project } from '../types/project.types';
import { Meeting } from '../types/meeting.types';
import { Alert } from '../components/Alert';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  X,
  FileText,
  CheckCircle2,
  BookOpen,
  RotateCw,
} from 'lucide-react';
import { z } from 'zod';

const VALID_MEETING_URL_REGEX =
  /^https:\/\/(www\.)?([a-zA-Z0-9-]+\.)*(meet\.google\.com|zoom\.us|teams\.microsoft\.com)(\/.*)?$/i;

const meetingFormSchema = z.object({
  title: z.string().min(3, 'Meeting title must be at least 3 characters'),
  agenda: z.string().min(5, 'Agenda must be at least 5 characters'),
  scheduledAt: z.string().min(1, 'Scheduled date and time is required'),
  meetingLink: z
    .string()
    .trim()
    .refine(
      (val) => !val || VALID_MEETING_URL_REGEX.test(val),
      'Meeting link must be a valid HTTPS Google Meet, Zoom, or Teams URL (e.g. https://meet.google.com/...)'
    ),
});

export const MeetingManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Schedule Meeting Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Log Minutes Modal State
  const [selectedMeetingForMinutes, setSelectedMeetingForMinutes] = useState<Meeting | null>(null);
  const [minutesText, setMinutesText] = useState('');
  const [submittingMinutes, setSubmittingMinutes] = useState(false);
  const [minutesError, setMinutesError] = useState<string | null>(null);

  const fetchFacultyProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getFacultyProjects();
      setProjects(res.projects);
      if (res.projects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(res.projects[0]._id);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load faculty projects.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMeetings = async (projectId: string) => {
    try {
      setMeetingsLoading(true);
      const res = await meetingService.getProjectMeetings(projectId);
      setMeetings(res.meetings);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load project meetings.',
      });
    } finally {
      setMeetingsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectMeetings(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    // Edge Case Hardening: Zod URL and form validation
    const validation = meetingFormSchema.safeParse({
      title,
      agenda,
      scheduledAt,
      meetingLink: meetingLink.trim(),
    });

    if (!validation.success) {
      setScheduleError(validation.error.issues[0]?.message || 'Validation error');
      return;
    }

    try {
      setScheduling(true);
      setScheduleError(null);

      const res = await meetingService.scheduleMeeting({
        projectId: selectedProjectId,
        title,
        agenda,
        scheduledAt,
        meetingLink: meetingLink.trim() || undefined,
      });

      setMeetings((prev) => [res.meeting, ...prev]);
      setShowScheduleModal(false);
      setTitle('');
      setAgenda('');
      setScheduledAt('');
      setMeetingLink('');
      setFeedback({
        type: 'success',
        message: 'Meeting scheduled successfully! Real-time notifications dispatched to students.',
      });
    } catch (err: any) {
      setScheduleError(err.response?.data?.message || 'Failed to schedule meeting.');
    } finally {
      setScheduling(false);
    }
  };

  const openMinutesModal = (meeting: Meeting) => {
    setSelectedMeetingForMinutes(meeting);
    setMinutesText(meeting.meetingMinutes || '');
    setMinutesError(null);
  };

  const handleMinutesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeetingForMinutes) return;

    if (!minutesText.trim()) {
      setMinutesError('Minutes content cannot be empty.');
      return;
    }

    try {
      setSubmittingMinutes(true);
      setMinutesError(null);

      const res = await meetingService.logMeetingMinutes(
        selectedMeetingForMinutes._id,
        minutesText.trim()
      );

      setMeetings((prev) =>
        prev.map((m) => (m._id === selectedMeetingForMinutes._id ? res.meeting : m))
      );

      setSelectedMeetingForMinutes(null);
      setFeedback({
        type: 'success',
        message: 'Meeting minutes logged and marked as Completed! Students notified.',
      });
    } catch (err: any) {
      setMinutesError(err.response?.data?.message || 'Failed to record meeting minutes.');
    } finally {
      setSubmittingMinutes(false);
    }
  };

  const scheduledMeetings = meetings.filter((m) => m.status === 'scheduled');
  const completedMeetings = meetings.filter((m) => m.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-xs uppercase font-bold tracking-widest text-blue-600">
                Module 10 & 11 • Mentorship Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Meetings & Minutes Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Schedule live sync calls, broadcast Google Meet links, and log historical meeting minutes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {projects.length > 0 && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Schedule Meeting
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback Alert */}
        {feedback && (
          <div className="mt-6">
            <Alert
              type={feedback.type}
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          </div>
        )}

        {/* Project Selector Bar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="text-xs text-slate-500 block">Select Active Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="mt-0.5 text-sm font-bold bg-transparent text-slate-900 border-0 focus:ring-0 cursor-pointer focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p._id} value={p._id} className="bg-white text-slate-900">
                    {p.title} ({p.courseType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => selectedProjectId && fetchProjectMeetings(selectedProjectId)}
              disabled={meetingsLoading}
              className="p-2 rounded-md bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Refresh Meetings"
            >
              <RotateCw className={`w-4 h-4 ${meetingsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="mt-12 text-center text-slate-500 text-sm">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="mt-12 text-center p-12 rounded-xl bg-white border border-slate-200 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No Projects Found</h3>
            <p className="text-xs text-slate-500">
              You do not have any active mentoring projects assigned yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {/* Upcoming / Scheduled Meetings */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Scheduled Sync Sessions</h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                  {scheduledMeetings.length}
                </span>
              </div>

              {scheduledMeetings.length === 0 ? (
                <div className="p-8 rounded-md bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No upcoming meetings scheduled for this project.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scheduledMeetings.map((meeting) => (
                    <div
                      key={meeting._id}
                      className="p-5 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">
                            {meeting.title}
                          </h3>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                            Scheduled
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-3 line-clamp-3">
                          {meeting.agenda}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium">{new Date(meeting.scheduledAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium text-xs shadow-sm transition-all"
                        >
                          <Video className="w-3.5 h-3.5" /> Join Call
                        </a>

                        <button
                          onClick={() => openMinutesModal(meeting)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 transition-colors shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" /> Log Minutes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historical Completed Meetings & Minutes */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <h2 className="text-base font-bold text-slate-900">Completed Meetings & Minutes</h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-800 border border-green-200 font-semibold">
                  {completedMeetings.length}
                </span>
              </div>

              {completedMeetings.length === 0 ? (
                <div className="p-8 rounded-md bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No completed meeting logs recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {completedMeetings.map((meeting) => (
                    <div
                      key={meeting._id}
                      className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{meeting.title}</h3>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800 border border-green-200">
                              Completed
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 mt-0.5 block">
                            Conducted on: {new Date(meeting.scheduledAt).toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={() => openMinutesModal(meeting)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors self-start sm:self-center"
                        >
                          Edit Minutes
                        </button>
                      </div>

                      <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-slate-700 block mb-1">
                          Recorded Meeting Minutes & Action Items:
                        </span>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {meeting.meetingMinutes || 'No detailed minutes recorded.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Meeting Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200 relative">
              <button
                onClick={() => setShowScheduleModal(false)}
                disabled={scheduling}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Schedule Sync Session</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Set up a project review meeting. All allocated students will receive real-time notifications.
              </p>

              {scheduleError && (
                <div className="mb-4">
                  <Alert
                    type="error"
                    message={scheduleError}
                    onClose={() => setScheduleError(null)}
                  />
                </div>
              )}

              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sprint 2 Architectural Review & Code Walkthrough"
                    className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Agenda & Objectives
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    placeholder="Describe topics to discuss, demo prerequisites, and student deliverables..."
                    className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Meeting Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/xyz-abcd-efg (auto-generated if empty)"
                    className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Leave empty to automatically generate a secure Google Meet link.
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={scheduling}
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scheduling}
                    className="px-5 py-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-1.5"
                  >
                    {scheduling ? 'Scheduling...' : 'Schedule & Notify'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Log Minutes Modal */}
        {selectedMeetingForMinutes && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full rounded-xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200 relative">
              <button
                onClick={() => setSelectedMeetingForMinutes(null)}
                disabled={submittingMinutes}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold text-slate-900">Record Meeting Minutes</h2>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Meeting: <span className="text-slate-900 font-semibold">{selectedMeetingForMinutes.title}</span>
              </p>
              <p className="text-xs text-slate-500 mb-5">
                Recording minutes will mark the status as Completed and alert students.
              </p>

              {minutesError && (
                <div className="mb-4">
                  <Alert
                    type="error"
                    message={minutesError}
                    onClose={() => setMinutesError(null)}
                  />
                </div>
              )}

              <form onSubmit={handleMinutesSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Minutes & Action Items
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={minutesText}
                    onChange={(e) => setMinutesText(e.target.value)}
                    placeholder="Enter discussion summaries, student progress evaluation, next deliverables, and deadlines..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={submittingMinutes}
                    onClick={() => setSelectedMeetingForMinutes(null)}
                    className="px-4 py-2 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingMinutes}
                    className="px-5 py-2 rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm flex items-center gap-1.5"
                  >
                    {submittingMinutes ? 'Saving Minutes...' : 'Save & Mark Completed'}
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

export default MeetingManager;
