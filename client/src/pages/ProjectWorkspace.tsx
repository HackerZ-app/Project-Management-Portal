import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import applicationService from '../services/application.service';
import assessmentService from '../services/assessment.service';
import { Application } from '../types/application.types';
import { Assessment, Submission } from '../types/assessment.types';
import { SubmissionModal } from '../components/SubmissionModal';
import { Alert } from '../components/Alert';
import {
  FolderGit2,
  Users,
  Calendar,
  Award,
  ExternalLink,
  CheckCircle2,
  Clock,
  RotateCw,
  Crown,
  FileCheck,
  Download,
  AlertTriangle,
  Send,
  Video,
} from 'lucide-react';
import meetingService from '../services/meeting.service';
import { Meeting } from '../types/meeting.types';
import { useNavigate } from 'react-router-dom';

export const ProjectWorkspace: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [approvedApp, setApprovedApp] = useState<Application | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, Submission | null>>({});
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState<'milestones' | 'meetings'>('milestones');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Modal state
  const [activeModalAssessment, setActiveModalAssessment] = useState<Assessment | null>(null);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      // 1. Fetch student's approved applications
      const appData = await applicationService.getMyApplications();
      const allocated = appData.applications.find((app) => app.status === 'approved');

      if (!allocated) {
        setApprovedApp(null);
        setAssessments([]);
        setLoading(false);
        return;
      }

      setApprovedApp(allocated);

      // 2. Fetch project assessments
      const projectId = allocated.project._id;
      const assessData = await assessmentService.getProjectAssessments(projectId);
      setAssessments(assessData.assessments);

      // 3. Fetch submissions for each assessment
      const subMap: Record<string, Submission | null> = {};
      await Promise.all(
        assessData.assessments.map(async (ass) => {
          try {
            const subRes = await assessmentService.getMySubmission(ass._id);
            subMap[ass._id] = subRes.submission || null;
          } catch {
            subMap[ass._id] = null;
          }
        })
      );
      setSubmissionsMap(subMap);

      // 4. Fetch project meetings & logs
      try {
        const meetRes = await meetingService.getProjectMeetings(projectId);
        setMeetings(meetRes.meetings || []);
      } catch {
        setMeetings([]);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load project workspace data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Project Execution Workspace
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800 border border-green-200">
                Active Project
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track project milestones, upload deliverables to Cloudinary, and collaborate with your
              faculty mentor.
            </p>
          </div>

          <button
            onClick={fetchWorkspaceData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all shadow-sm self-start sm:self-auto"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            Refresh Workspace
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !approvedApp ? (
          /* Empty State: Not Allocated */
          <div className="p-12 rounded-xl bg-white border border-slate-200 shadow-sm text-center space-y-4 max-w-lg mx-auto my-12">
            <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto">
              <FolderGit2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No Active Allocated Project</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              You do not currently have an approved project allocation. Explore available faculty
              projects in the catalog or form a team in My Groups.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => navigate('/projects')}
                className="px-5 py-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
              >
                Browse Projects
              </button>
              <button
                onClick={() => navigate('/groups')}
                className="px-5 py-2 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                My Groups
              </button>
            </div>
          </div>
        ) : (
          /* Allocated Project Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Project Overview & Team Roster */}
            <div className="space-y-6">
              {/* Project Card */}
              <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {approvedApp.project.courseType}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-2">
                    {approvedApp.project.title}
                  </h2>
                  <span className="text-xs text-slate-500 font-mono block mt-1">
                    Domain: {approvedApp.project.domain}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-200">
                  {approvedApp.project.description}
                </p>

                {/* Faculty Mentor */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Faculty Mentor:</span>
                  <span className="font-semibold text-slate-900">
                    {typeof approvedApp.project.faculty === 'object'
                      ? approvedApp.project.faculty.name
                      : 'Faculty Mentor'}
                  </span>
                </div>
              </div>

              {/* Team Roster Card */}
              <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" /> Team Roster
                  </h3>
                  <span className="text-xs font-bold text-blue-600 font-mono">
                    {approvedApp.group ? approvedApp.group.name : 'Solo Allocation'}
                  </span>
                </div>

                <div className="space-y-2">
                  {approvedApp.group && approvedApp.group.members ? (
                    approvedApp.group.members.map((member: any) => {
                      const isLeader =
                        typeof approvedApp.group?.leader === 'object'
                          ? approvedApp.group.leader._id === member._id
                          : approvedApp.group?.leader === member._id;

                      return (
                        <div
                          key={member._id}
                          className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">{member.name}</span>
                              {isLeader && (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold text-yellow-700 bg-yellow-100 px-1 py-0.5 rounded border border-yellow-200">
                                  <Crown className="w-2.5 h-2.5" /> Leader
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {member.rollNumber || member.email}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      Solo Student: {approvedApp.appliedBy?.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (2 cols): Milestones & Assessments Timeline OR Meetings & Minutes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Switcher */}
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setActiveTab('milestones')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'milestones'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Milestones & Deliverables
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'milestones' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {assessments.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('meetings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'meetings'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Meetings & Minutes
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'meetings' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {meetings.length}
                  </span>
                </button>
              </div>

              {/* Tab 1: Milestones Content */}
              {activeTab === 'milestones' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Assessment Milestones
                      </h2>
                      <p className="text-xs text-slate-500">
                        Submit reports, code repositories, and deliverables before each deadline.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-200">
                      {assessments.length} Milestones
                    </span>
                  </div>

                  {assessments.length === 0 ? (
                    <div className="p-12 rounded-xl bg-white border border-slate-200 shadow-sm text-center space-y-2 text-xs text-slate-500">
                      <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="font-semibold text-slate-700">No Milestones Published Yet</p>
                      <p>Your faculty mentor has not yet scheduled milestone deadlines for this project.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assessments.map((assessment, index) => {
                        const submission = submissionsMap[assessment._id];
                        const isPassed = new Date() > new Date(assessment.deadline);

                        return (
                          <div
                            key={assessment._id}
                            className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-sm relative overflow-hidden transition-shadow hover:shadow-md"
                          >
                            {/* Milestone Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700 font-mono">
                                  #{index + 1}
                                </span>
                                <h3 className="text-base font-bold text-slate-900">{assessment.title}</h3>
                              </div>

                              {/* Status Badge */}
                              <div>
                                {submission ? (
                                  submission.status === 'graded' ? (
                                    <span className="text-xs font-bold px-3 py-1 rounded-md bg-green-100 text-green-800 border border-green-200 flex items-center gap-1.5">
                                      <Award className="w-3.5 h-3.5 text-green-600" /> Graded (
                                      {submission.marks} / {assessment.maxMarks})
                                    </span>
                                  ) : submission.status === 'late' ? (
                                    <span className="text-xs font-bold px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-200 flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-yellow-600" /> Submitted (Late)
                                    </span>
                                  ) : (
                                    <span className="text-xs font-bold px-3 py-1 rounded-md bg-green-100 text-green-800 border border-green-200 flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Submitted
                                    </span>
                                  )
                                ) : isPassed ? (
                                  <span className="text-xs font-bold px-3 py-1 rounded-md bg-red-100 text-red-800 border border-red-200 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Overdue
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold px-3 py-1 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Pending Submission
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {assessment.description}
                            </p>

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>Deadline:</span>
                                <span className="font-mono text-slate-900 font-semibold">
                                  {new Date(assessment.deadline).toLocaleString()}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-slate-500">
                                <Award className="w-4 h-4 text-blue-500" />
                                <span>Max Marks:</span>
                                <span className="font-mono font-bold text-slate-900">
                                  {assessment.maxMarks} pts
                                </span>
                              </div>
                            </div>

                            {/* Evaluation Feedback if Graded */}
                            {submission && submission.status === 'graded' && submission.feedback && (
                              <div className="p-3.5 rounded-md bg-blue-50 border border-blue-200 text-xs">
                                <span className="font-bold text-blue-800 block mb-1">
                                  Faculty Evaluation & Feedback:
                                </span>
                                <p className="text-blue-900 whitespace-pre-wrap leading-relaxed">
                                  {submission.feedback}
                                </p>
                              </div>
                            )}

                            {/* Submission Details or Action */}
                            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {submission ? (
                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                  <span className="text-slate-500 flex items-center gap-1">
                                    <FileCheck className="w-3.5 h-3.5 text-green-600" />
                                    Submitted on{' '}
                                    {new Date(submission.createdAt).toLocaleDateString()}
                                  </span>

                                  {/* Cloudinary Deliverable Link */}
                                  <a
                                    href={submission.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 hover:text-blue-700 transition-colors font-medium shadow-sm"
                                  >
                                    <Download className="w-3 h-3" /> View Deliverable
                                  </a>

                                  {/* GitHub Link */}
                                  <a
                                    href={submission.githubUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 hover:text-blue-700 transition-colors font-medium shadow-sm"
                                  >
                                    <ExternalLink className="w-3 h-3" /> GitHub Repo
                                  </a>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end w-full">
                                  <button
                                    onClick={() => setActiveModalAssessment(assessment)}
                                    className="px-5 py-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-1.5 transition-all"
                                  >
                                    <Send className="w-3.5 h-3.5" /> Submit Deliverable
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Meetings & Minutes Content */}
              {activeTab === 'meetings' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Project Sync Meetings & Logs
                    </h2>
                    <p className="text-xs text-slate-500">
                      Join video review conferences with your mentor and view historical minutes of meetings.
                    </p>
                  </div>

                  {meetings.length === 0 ? (
                    <div className="p-12 rounded-xl bg-white border border-slate-200 shadow-sm text-center space-y-2 text-xs text-slate-500">
                      <Video className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="font-semibold text-slate-700">No Meetings Scheduled Yet</p>
                      <p>Your faculty mentor has not scheduled any live review calls for this project yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Upcoming Meetings */}
                      {meetings.filter((m) => m.status === 'scheduled').length > 0 && (
                        <div>
                          <h3 className="text-xs uppercase font-bold tracking-wider text-blue-600 mb-3 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> Upcoming Scheduled Calls
                          </h3>
                          <div className="space-y-3">
                            {meetings
                              .filter((m) => m.status === 'scheduled')
                              .map((m) => (
                                <div
                                  key={m._id}
                                  className="p-5 rounded-xl bg-blue-50 border border-blue-200 space-y-3 shadow-sm"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                      <h4 className="font-bold text-blue-900 text-sm">{m.title}</h4>
                                      <p className="text-xs text-blue-800 mt-1">{m.agenda}</p>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 border border-blue-200 self-start sm:self-center">
                                      Scheduled
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-blue-100">
                                    <div className="flex items-center gap-2 text-xs text-blue-700">
                                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                                      <span className="font-medium">{new Date(m.scheduledAt).toLocaleString()}</span>
                                    </div>

                                    <a
                                      href={m.meetingLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium text-xs shadow-sm transition-all"
                                    >
                                      <Video className="w-3.5 h-3.5" /> Join Google Meet
                                    </a>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Completed Meetings & Minutes */}
                      <div>
                        <h3 className="text-xs uppercase font-bold tracking-wider text-green-600 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed Meeting Minutes
                        </h3>
                        {meetings.filter((m) => m.status === 'completed').length === 0 ? (
                          <div className="p-6 rounded-md bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                            No completed meeting logs recorded yet.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {meetings
                              .filter((m) => m.status === 'completed')
                              .map((m) => (
                                <div
                                  key={m._id}
                                  className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                                      <span className="text-xs text-slate-500 block mt-0.5">
                                        Held on {new Date(m.scheduledAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800 border border-green-200">
                                      Completed
                                    </span>
                                  </div>

                                  <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                                    <span className="font-bold text-slate-700 block mb-1">
                                      Recorded Minutes & Action Points:
                                    </span>
                                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                      {m.meetingMinutes || 'No minutes logged.'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submission Modal */}
        {activeModalAssessment && (
          <SubmissionModal
            assessment={activeModalAssessment}
            isOpen={!!activeModalAssessment}
            onClose={() => setActiveModalAssessment(null)}
            onSuccess={() => {
              setFeedback({
                type: 'success',
                message: 'Deliverable submitted successfully!',
              });
              fetchWorkspaceData();
            }}
          />
        )}
      </main>
    </div>
  );
};

export default ProjectWorkspace;
