import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/Navbar';
import projectService from '../services/project.service';
import applicationService from '../services/application.service';
import groupService from '../services/group.service';
import { Project, CourseType } from '../types/project.types';
import { Group } from '../types/group.types';
import { Alert } from '../components/Alert';
import {
  Search,
  Plus,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  User as UserIcon,
  X,
  FileText,
  Send,
  AlertCircle,
} from 'lucide-react';

const DOMAINS = [
  'All',
  'Artificial Intelligence',
  'Machine Learning',
  'Cybersecurity',
  'Cloud & Distributed Systems',
  'IoT & Embedded Systems',
  'Blockchain & Web3',
  'Web & Full Stack',
];

const COURSE_TYPES: (CourseType | 'All')[] = [
  'All',
  'Capstone Project',
  'Mini Project',
  'Industrial Project',
  'Research Project',
];

export const ProjectCatalog: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCourseType, setSelectedCourseType] = useState<CourseType | 'All'>('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Faculty toggle for their own projects
  const [facultyFilter, setFacultyFilter] = useState<'all' | 'mine'>('all');

  // Modal for project details
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Apply Modal State
  const [applyProject, setApplyProject] = useState<Project | null>(null);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [applyMode, setApplyMode] = useState<'solo' | 'group'>('solo');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [statementOfPurpose, setStatementOfPurpose] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'coordinator' || user?.role === 'admin';

  const fetchProjects = async () => {
    setLoading(true);
    try {
      if (facultyFilter === 'mine' && isFacultyOrAdmin) {
        const response = await projectService.getFacultyProjects();
        setProjects(response.projects);
        setTotalCount(response.count);
        setTotalPages(1);
      } else {
        const response = await projectService.getProjects({
          page,
          limit: 9,
          search: searchQuery,
          domain: selectedDomain === 'All' ? undefined : selectedDomain,
          courseType: selectedCourseType === 'All' ? undefined : selectedCourseType,
        });
        setProjects(response.projects);
        setTotalPages(response.pagination.totalPages);
        setTotalCount(response.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, selectedDomain, selectedCourseType, facultyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const handleOpenApply = async (project: Project) => {
    setApplyProject(project);
    setSelectedProject(null);
    setStatementOfPurpose('');
    setApplyMode('solo');
    setFeedback(null);

    try {
      const data = await groupService.getMyGroups();
      // Filter for groups where student is leader, locked, and matching courseType
      const eligibleGroups = data.groups.filter(
        (g) =>
          g.status === 'locked' &&
          g.courseType === project.courseType &&
          (typeof g.leader === 'object'
            ? (g.leader as any)._id === user?.id || (g.leader as any).id === user?.id
            : (g.leader as any) === user?.id)
      );
      setAvailableGroups(eligibleGroups);
      if (eligibleGroups.length > 0) {
        setSelectedGroupId(eligibleGroups[0]._id);
      }
    } catch {
      setAvailableGroups([]);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyProject) return;

    setSubmittingApp(true);
    setFeedback(null);

    try {
      const res = await applicationService.submitApplication({
        projectId: applyProject._id,
        groupId: applyMode === 'group' ? selectedGroupId : undefined,
        statementOfPurpose,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Project application submitted successfully to faculty mentor for evaluation!',
        });
        setApplyProject(null);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit application.',
      });
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {feedback && (
          <div className="mb-6">
            <Alert
              type={feedback.type}
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          </div>
        )}

        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Academic Project Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore approved university capstone, mini, and research projects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isFacultyOrAdmin && (
              <>
                <button
                  onClick={() => {
                    setFacultyFilter(facultyFilter === 'all' ? 'mine' : 'all');
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-md text-xs font-semibold border transition-all ${
                    facultyFilter === 'mine'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {facultyFilter === 'mine' ? 'Showing My Proposals' : 'My Proposals'}
                </button>

                <button
                  onClick={() => navigate('/projects/create')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Propose Project
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="space-y-4 mb-8">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by keywords, technical stack, problem statement..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Domain Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {DOMAINS.map((domain) => (
              <button
                key={domain}
                onClick={() => {
                  setSelectedDomain(domain);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  selectedDomain === domain
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>

          {/* Course Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Category:
            </span>
            {COURSE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedCourseType(type);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedCourseType === type
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <span>
            Found <strong className="text-slate-900">{totalCount}</strong> projects available
          </span>
          {totalPages > 1 && (
            <span>
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white border border-slate-200 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No matching academic projects align with your filter criteria. Try clearing search filters or check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const faculty =
                typeof project.faculty === 'object' && project.faculty !== null
                  ? project.faculty
                  : null;

              const deadlineDate = new Date(project.deadline);
              const daysLeft = Math.ceil(
                (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );

              const availableSlots = project.maxStudents - (project.currentStudents || 0);

              return (
                <div
                  key={project._id}
                  className="rounded-xl bg-white hover:shadow-md border border-slate-200 p-6 flex flex-col justify-between transition-shadow shadow-sm"
                >
                  <div>
                    {/* Tags */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[160px]">
                        {project.domain}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                          project.status === 'allocated'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : project.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-green-100 text-green-800 border-green-200'
                        }`}
                      >
                        {project.status === 'allocated'
                          ? 'Allocated'
                          : project.status === 'draft'
                          ? 'Draft'
                          : project.courseType}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 line-clamp-2">
                      {project.title}
                    </h3>

                    {/* Description snippet */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {project.description}
                    </p>

                    {/* Requirements */}
                    {project.requirements && (
                      <div className="mb-4 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                        <span className="text-slate-500 block font-medium mb-0.5">Requirements:</span>
                        <p className="line-clamp-2">{project.requirements}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Faculty Mentor & Details */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-2">
                        {faculty?.avatar ? (
                          <img
                            src={faculty.avatar}
                            alt={faculty.name}
                            className="w-6 h-6 rounded-full border border-slate-200"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <UserIcon className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-slate-700 font-medium truncate max-w-[120px]">
                          {faculty?.name || 'Faculty Guide'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          {availableSlots}/{project.maxStudents} open
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                          {daysLeft > 0 ? `${daysLeft}d left` : 'Closed'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="flex-1 py-2 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
                      >
                        Details
                      </button>

                      {user?.role === 'student' && project.status === 'published' && availableSlots > 0 && (
                        <button
                          onClick={() => handleOpenApply(project)}
                          className="px-4 py-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" /> Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Navigation */}
        {totalPages > 1 && facultyFilter === 'all' && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-50 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Detailed Project Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-2xl w-full rounded-xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedProject.domain}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedProject.courseType}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-4">{selectedProject.title}</h2>

              <div className="space-y-4 text-xs text-slate-700">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" /> Full Problem Scope & Methodology
                  </h4>
                  <div className="p-4 rounded-md bg-slate-50 border border-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedProject.description}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Required Skills & Prerequisites
                  </h4>
                  <p className="p-3 rounded-md bg-slate-50 border border-slate-200">
                    {selectedProject.requirements || 'Standard prerequisites apply.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-0.5">Capacity Allocation</span>
                    <span className="font-bold text-slate-900">
                      {selectedProject.currentStudents || 0} / {selectedProject.maxStudents} Students Enrolled
                    </span>
                  </div>
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block mb-0.5">Application Deadline</span>
                    <span className="font-bold text-yellow-600">
                      {new Date(selectedProject.deadline).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-md text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Close
                </button>
                {user?.role === 'student' && selectedProject.status === 'published' && (
                  <button
                    onClick={() => handleOpenApply(selectedProject)}
                    className="px-5 py-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Apply for Project
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Project Application Modal */}
        {applyProject && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full rounded-xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200 relative">
              <button
                onClick={() => setApplyProject(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 mb-1">Apply for Academic Project</h2>
              <p className="text-xs text-slate-500 mb-4 line-clamp-1">{applyProject.title}</p>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                {/* Mode Selector: Solo vs Group */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Application Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setApplyMode('solo')}
                      className={`py-2 px-3 rounded-md text-xs font-medium border transition-all ${
                        applyMode === 'solo'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Individual / Solo (1 Student)
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplyMode('group')}
                      className={`py-2 px-3 rounded-md text-xs font-medium border transition-all ${
                        applyMode === 'group'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Apply with Team Roster
                    </button>
                  </div>
                </div>

                {/* If Group Mode: Choose locked group */}
                {applyMode === 'group' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Locked Team ({applyProject.courseType})
                    </label>
                    {availableGroups.length > 0 ? (
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        {availableGroups.map((g) => (
                          <option key={g._id} value={g._id}>
                            {g.name} ({g.members.length} members)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-xs text-yellow-800">
                        <AlertCircle className="w-4 h-4 text-yellow-600 inline mr-1.5" />
                        No locked groups found for {applyProject.courseType}. Go to{' '}
                        <span
                          onClick={() => navigate('/groups')}
                          className="text-yellow-900 underline cursor-pointer font-semibold"
                        >
                          My Groups
                        </span>{' '}
                        to form and lock your team.
                      </div>
                    )}
                  </div>
                )}

                {/* Statement of Purpose */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Statement of Purpose (SOP) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={statementOfPurpose}
                    onChange={(e) => setStatementOfPurpose(e.target.value)}
                    required
                    minLength={50}
                    placeholder="Briefly state your technical background, research motivation, proposed approach, and why your team is well-suited for this project (minimum 50 characters)..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    {statementOfPurpose.length} / 50 characters minimum
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setApplyProject(null)}
                    className="px-4 py-2 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submittingApp ||
                      statementOfPurpose.length < 50 ||
                      (applyMode === 'group' && availableGroups.length === 0)
                    }
                    className="px-5 py-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingApp ? 'Submitting...' : 'Submit Application'}
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

export default ProjectCatalog;
