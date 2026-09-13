import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import projectService from '../services/project.service';
import assessmentService from '../services/assessment.service';
import { Project } from '../types/project.types';
import { Assessment, Submission } from '../types/assessment.types';
import { Alert } from '../components/Alert';
import {
  Calendar,
  Award,
  ExternalLink,
  Download,
  RotateCw,
  Plus,
  X,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
} from 'lucide-react';

export const AssessmentManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [loading, setLoading] = useState(true);
  const [subsLoading, setSubsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Create Assessment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Grading Modal State
  const [selectedSubForGrade, setSelectedSubForGrade] = useState<{
    sub: Submission;
    assessment: Assessment;
  } | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number | ''>('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [gradeModalError, setGradeModalError] = useState<string | null>(null);

  const openGradingModal = (sub: Submission, assessment: Assessment) => {
    setSelectedSubForGrade({ sub, assessment });
    setGradeMarks(sub.marks !== undefined ? sub.marks : '');
    setGradeFeedback(sub.feedback || '');
    setGradeModalError(null);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForGrade) return;

    const { sub, assessment } = selectedSubForGrade;
    if (gradeMarks === '' || isNaN(Number(gradeMarks))) {
      setGradeModalError('Marks must be a valid number.');
      return;
    }

    const numMarks = Number(gradeMarks);
    if (numMarks < 0 || numMarks > assessment.maxMarks) {
      setGradeModalError(`Marks must be between 0 and ${assessment.maxMarks}.`);
      return;
    }

    try {
      setGrading(true);
      setGradeModalError(null);

      const res = await assessmentService.gradeSubmission(sub._id, {
        marks: numMarks,
        feedback: gradeFeedback,
      });

      // Update local submissions list
      setSubmissions((prev) => ({
        ...prev,
        [assessment._id]: (prev[assessment._id] || []).map((s) =>
          s._id === sub._id ? res.submission : s
        ),
      }));

      setSelectedSubForGrade(null);
      setFeedback({
        type: 'success',
        message: res.isReEvaluation
          ? 'Marks and feedback updated successfully!'
          : 'Submission graded successfully! Real-time notifications dispatched to students.',
      });
    } catch (err: any) {
      setGradeModalError(err.response?.data?.message || 'Failed to submit grade.');
    } finally {
      setGrading(false);
    }
  };

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

  const fetchProjectAssessments = async (projectId: string) => {
    try {
      setLoading(true);
      const res = await assessmentService.getProjectAssessments(projectId);
      setAssessments(res.assessments);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load project assessments.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectAssessments(selectedProjectId);
    }
  }, [selectedProjectId]);

  const toggleExpandAssessment = async (assessmentId: string) => {
    if (expandedAssessmentId === assessmentId) {
      setExpandedAssessmentId(null);
      return;
    }

    setExpandedAssessmentId(assessmentId);

    // Fetch submissions if not already loaded
    if (!submissions[assessmentId]) {
      try {
        setSubsLoading(true);
        const res = await assessmentService.getAssessmentSubmissions(assessmentId);
        setSubmissions((prev) => ({ ...prev, [assessmentId]: res.submissions }));
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err.response?.data?.message || 'Failed to load submissions for milestone.',
        });
      } finally {
        setSubsLoading(false);
      }
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!title.trim() || !description.trim() || !deadline) {
      setModalError('Please fill in all required fields.');
      return;
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate.getTime() <= Date.now()) {
      setModalError('Assessment deadline must be in the future.');
      return;
    }

    try {
      setCreating(true);
      const res = await assessmentService.createAssessment({
        title: title.trim(),
        description: description.trim(),
        projectId: selectedProjectId,
        deadline: deadlineDate.toISOString(),
        maxMarks: Number(maxMarks),
      });

      setFeedback({
        type: 'success',
        message: res.message || 'Milestone assessment published successfully!',
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setDeadline('');
      setMaxMarks(100);
      fetchProjectAssessments(selectedProjectId);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to publish assessment.');
    } finally {
      setCreating(false);
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Assessment & Milestone Manager
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Faculty Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create project milestones, inspect student deliverables from Cloudinary, and evaluate
              code repositories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => selectedProjectId && fetchProjectAssessments(selectedProjectId)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all shadow-sm"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              Refresh
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!selectedProjectId}
              className="flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Publish Milestone
            </button>
          </div>
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

        {/* Project Selector Bar */}
        <div className="mb-8 p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">
                Select Project to Manage:
              </span>
              {projects.length > 0 ? (
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-900 font-bold text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mt-0.5"
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.courseType})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-slate-500">No projects found for your account.</span>
              )}
            </div>
          </div>

          {selectedProject && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-medium px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                Capacity: {selectedProject.currentStudents} / {selectedProject.maxStudents}
              </span>
              <span className="text-[11px] uppercase font-bold px-3 py-1 rounded-md bg-green-100 text-green-800 border border-green-200">
                {selectedProject.status}
              </span>
            </div>
          )}
        </div>

        {/* Assessments List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="p-12 rounded-xl bg-white border border-slate-200 text-center space-y-3 text-xs text-slate-500 shadow-sm">
            <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <h3 className="font-bold text-slate-900 text-base">No Milestones Published</h3>
            <p>Publish an assessment milestone or deadline for your allocated student cohort.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 px-5 py-2 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create First Milestone
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {assessments.map((assessment, index) => {
              const isExpanded = expandedAssessmentId === assessment._id;
              const subList = submissions[assessment._id] || [];

              return (
                <div
                  key={assessment._id}
                  className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Milestone Card Header */}
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700 font-mono">
                        #{index + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{assessment.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {assessment.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="font-mono">
                          {new Date(assessment.deadline).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-600 font-mono font-semibold">
                        <Award className="w-4 h-4 text-blue-500" />
                        {assessment.maxMarks} pts
                      </div>

                      <button
                        onClick={() => toggleExpandAssessment(assessment._id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors text-xs font-medium shadow-sm"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                        Submissions ({subList.length})
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submissions Table (Expanded) */}
                  {isExpanded && (
                    <div className="p-6 space-y-4 animate-in fade-in-50 duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Student Deliverables for {assessment.title}
                        </h4>
                        <span className="text-xs text-slate-600 font-mono font-medium">
                          Total Submitted: {subList.length}
                        </span>
                      </div>

                      {subsLoading && !submissions[assessment._id] ? (
                        <div className="py-8 text-center text-xs text-slate-500">
                          Loading submissions...
                        </div>
                      ) : subList.length === 0 ? (
                        <div className="py-8 rounded-md bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                          No student submissions received for this milestone yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-700 border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase font-semibold">
                                <th className="pb-3 px-3">Submitter / Group</th>
                                <th className="pb-3 px-3">Submitted At</th>
                                <th className="pb-3 px-3">Status</th>
                                <th className="pb-3 px-3">Cloudinary Deliverable</th>
                                <th className="pb-3 px-3">GitHub Repository</th>
                                <th className="pb-3 px-3 text-right">Grading (Phase 5)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {subList.map((sub) => (
                                <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-3.5 px-3">
                                    <div className="font-semibold text-slate-900">
                                      {sub.group ? sub.group.name : sub.submittedBy?.name}
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-mono">
                                      {sub.submittedBy?.rollNumber || sub.submittedBy?.email}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-3 font-mono text-slate-600">
                                    {new Date(sub.createdAt).toLocaleString()}
                                  </td>

                                  <td className="py-3.5 px-3">
                                    {sub.status === 'late' ? (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-200 flex items-center gap-1 w-fit">
                                        <Clock className="w-2.5 h-2.5 text-yellow-600" /> Late
                                      </span>
                                    ) : sub.status === 'graded' ? (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800 border border-green-200 flex items-center gap-1 w-fit">
                                        <Award className="w-2.5 h-2.5 text-green-600" /> Graded
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit">
                                        On Time
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-3.5 px-3">
                                    <a
                                      href={sub.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 hover:text-blue-700 transition-colors font-medium shadow-sm"
                                    >
                                      <Download className="w-3 h-3" /> Download File
                                    </a>
                                  </td>

                                  <td className="py-3.5 px-3">
                                    <a
                                      href={sub.githubUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 hover:text-blue-700 transition-colors font-mono text-[11px] shadow-sm font-medium"
                                    >
                                      <ExternalLink className="w-3 h-3" /> View Code
                                    </a>
                                  </td>

                                  <td className="py-3.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {sub.status === 'graded' ? (
                                        <>
                                          <span className="font-bold text-xs text-green-600 font-mono">
                                            {sub.marks}/{assessment.maxMarks}
                                          </span>
                                          <button
                                            onClick={() => openGradingModal(sub, assessment)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm"
                                            title="Re-evaluate Submission"
                                          >
                                            Re-evaluate
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => openGradingModal(sub, assessment)}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                                        >
                                          <Award className="w-3 h-3" /> Grade
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create Milestone Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full rounded-xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200 relative">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 mb-1">Publish Project Milestone</h2>
              <p className="text-xs text-slate-500 mb-6">
                Create a milestone deliverable with a strict deadline and maximum marks.
              </p>

              {modalError && (
                <div className="mb-4">
                  <Alert type="error" message={modalError} onClose={() => setModalError(null)} />
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Milestone Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sprint 1 Report: Literature Review & Architecture"
                    className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description & Deliverable Guidelines
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Specify expectations, report formatting (PDF/DOCX), and GitHub repository structure..."
                    className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Deadline (Date & Time)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Maximum Marks (pts)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={1000}
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={creating}
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-1.5"
                  >
                    {creating ? 'Publishing...' : 'Publish Assessment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Grade Submission Modal */}
        {selectedSubForGrade && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200 relative">
              <button
                onClick={() => setSelectedSubForGrade(null)}
                disabled={grading}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedSubForGrade.sub.status === 'graded' ? 'Re-evaluate Submission' : 'Grade Submission'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                {selectedSubForGrade.sub.group
                  ? `Group: ${selectedSubForGrade.sub.group.name}`
                  : `Student: ${selectedSubForGrade.sub.submittedBy?.name}`}
              </p>
              <div className="p-3 mb-5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                <div className="text-slate-600">
                  Milestone: <span className="text-slate-900 font-semibold">{selectedSubForGrade.assessment.title}</span>
                </div>
                <div className="text-slate-600 mt-0.5">
                  Maximum Marks: <span className="text-blue-600 font-bold">{selectedSubForGrade.assessment.maxMarks} pts</span>
                </div>
              </div>

              {gradeModalError && (
                <div className="mb-4">
                  <Alert type="error" message={gradeModalError} onClose={() => setGradeModalError(null)} />
                </div>
              )}

              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Marks Awarded (0 - {selectedSubForGrade.assessment.maxMarks})
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={selectedSubForGrade.assessment.maxMarks}
                    value={gradeMarks}
                    onChange={(e) => setGradeMarks(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={`Enter marks between 0 and ${selectedSubForGrade.assessment.maxMarks}`}
                    className="w-full px-3.5 py-2.5 text-sm rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Feedback & Evaluation Notes
                  </label>
                  <textarea
                    rows={4}
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    placeholder="Constructive feedback, rubric notes, or areas for improvement..."
                    className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={grading}
                    onClick={() => setSelectedSubForGrade(null)}
                    className="px-4 py-2 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={grading}
                    className="px-5 py-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-1.5"
                  >
                    {grading
                      ? 'Saving Grade...'
                      : selectedSubForGrade.sub.status === 'graded'
                      ? 'Update Marks'
                      : 'Publish Grade'}
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

export default AssessmentManager;
