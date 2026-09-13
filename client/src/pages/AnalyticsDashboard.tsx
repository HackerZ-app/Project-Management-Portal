import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Download,
  RotateCw,
  FolderGit2,
  Users,
  GraduationCap,
  Award,
  CheckCircle2,
  Lock,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import analyticsService from '../services/analytics.service';
import projectService from '../services/project.service';
import { AnalyticsDashboardResponse } from '../types/analytics.types';
import { Project } from '../types/project.types';
import { Alert } from '../components/Alert';

const PIE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626'];
const BAR_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#2563eb', '#0d9488'];

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsDashboardResponse | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [analyticsRes, projectsRes] = await Promise.all([
        analyticsService.getDashboardData(),
        projectService.getProjects({ limit: 100 }),
      ]);
      setData(analyticsRes);
      setProjects(projectsRes.projects || []);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load analytics dashboard data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      await analyticsService.downloadGradesCSV();
      setFeedback({
        type: 'success',
        message: 'Grades report exported successfully! Check your browser downloads.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to generate Excel/CSV export.',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleReleaseGrades = async (projectId: string, projectTitle: string) => {
    try {
      setReleasingId(projectId);
      const res = await projectService.releaseProjectGrades(projectId);
      setFeedback({
        type: 'success',
        message: `Final grades released for "${projectTitle}". Project status closed and students notified!`,
      });
      // Update local project list
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, status: res.project.status } : p))
      );
      // Refresh metrics
      fetchDashboard();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to release project grades.',
      });
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-xs uppercase font-bold tracking-widest text-blue-600">
                Module 16 • Executive Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Academic Analytics & Grade Release
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Aggregated domain distributions, student milestone performance, and official CSV grade exports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="p-2.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
              title="Refresh Analytics"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all"
            >
              <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
              {exporting ? 'Generating CSV...' : 'Export to Excel / CSV'}
            </button>
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

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <div className="mt-12 text-center text-slate-500 text-sm">
            No analytics metrics available.
          </div>
        ) : (
          <div className="space-y-8 mt-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">Total Projects</span>
                  <FolderGit2 className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {data.kpis.totalProjects}
                </div>
                <div className="text-[11px] text-slate-500">
                  {data.kpis.activeProjects} active • {data.kpis.completedProjects} completed
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">Submissions Evaluated</span>
                  <Award className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {data.kpis.totalGraded}
                </div>
                <div className="text-[11px] text-slate-500">
                  out of {data.kpis.totalSubmissions} total uploaded deliverables
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">Enrolled Students</span>
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {data.kpis.totalStudents}
                </div>
                <div className="text-[11px] text-slate-500">
                  Active academic portal candidates
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold">Faculty Mentors</span>
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {data.kpis.totalFaculty}
                </div>
                <div className="text-[11px] text-slate-500">
                  Guiding project research & sprints
                </div>
              </div>
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Project Distribution by Domain */}
              <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-blue-600" /> Projects by Research Domain
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {data.projectsByDomain.length} domains
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.projectsByDomain}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                      <XAxis
                        dataKey="domain"
                        stroke="#64748b"
                        fontSize={11}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          color: '#0f172a',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]}>
                        {data.projectsByDomain.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={BAR_COLORS[index % BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Average Marks by Course Type */}
              <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-600" /> Average Marks per Course Type
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Evaluation Metrics</span>
                </div>

                <div className="h-64 w-full">
                  {data.avgMarksByCourseType.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No graded submissions recorded yet for course comparison.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.avgMarksByCourseType}
                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                        <XAxis
                          dataKey="courseType"
                          stroke="#64748b"
                          fontSize={11}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                        />
                        <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderColor: '#e2e8f0',
                            borderRadius: '8px',
                            color: '#0f172a',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        <Bar
                          dataKey="avgMarks"
                          name="Avg Marks Awarded"
                          fill="#16a34a"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Status Breakdown Pie Chart & Coordinator Grade Release Console */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pie Chart: Project Status */}
              <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-blue-600" /> Lifecycle Status Breakdown
                </h3>

                <div className="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.projectStatusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.projectStatusBreakdown.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          color: '#0f172a',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Coordinator Final Grade Release Console */}
              <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-yellow-600" /> Coordinator Grade Release Desk
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-200">
                      Module 16
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Release final grades and officially close projects. Triggers real-time student notifications and applies the missing deliverable deadlock auto-zero safeguard.
                  </p>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {projects.map((proj) => (
                      <div
                        key={proj._id}
                        className="p-3.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{proj.title}</span>
                            <span
                              className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                                proj.status === 'closed'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {proj.status}
                            </span>
                          </div>
                          <span className="text-slate-500 text-[11px] block">
                            {proj.courseType} • Domain: {proj.domain}
                          </span>
                        </div>

                        <div>
                          {proj.status === 'closed' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-md border border-green-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Grades Released
                            </span>
                          ) : (
                            <button
                              onClick={() => handleReleaseGrades(proj._id, proj.title)}
                              disabled={releasingId === proj._id}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-all disabled:opacity-50"
                            >
                              <Lock className="w-3 h-3" />
                              {releasingId === proj._id ? 'Releasing...' : 'Release Grades'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
