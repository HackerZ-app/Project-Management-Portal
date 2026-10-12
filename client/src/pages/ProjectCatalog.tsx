import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/Navbar';
import projectService from '../services/project.service';
import applicationService from '../services/application.service';
import groupService from '../services/group.service';
import { Project, CourseType } from '../types/project.types';
import { Group } from '../types/group.types';
import { Alert } from '../components/Alert';
import { ProjectDetailsDrawer } from '../components/ProjectDetailsDrawer';
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
  Send,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
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

// High-fidelity enterprise mock data fallback for populated states
const MOCK_PROJECTS: (Project & { techStack: string[] })[] = [
  {
    _id: 'mock-proj-1',
    title: 'Autonomous UAV Swarm Coordination for Disaster Response',
    description:
      'Designing and validating decentralized consensus protocols for heterogeneous drone swarms during urban search-and-rescue. Includes obstacle avoidance using LiDAR telemetry, distributed task allocation, and real-time mesh communications under severe packet loss.',
    domain: 'Artificial Intelligence',
    courseType: 'Capstone Project',
    faculty: {
      id: 'fac-1',
      name: 'Dr. Aris Thorne',
      email: 'aris.thorne@srmap.edu.in',
      department: 'Computer Science and Engineering',
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    } as any,
    requirements: 'Proficiency in Python/C++, basic familiarity with ROS2 or PX4 autopilot, and linear algebra/state estimation foundations.',
    maxStudents: 4,
    currentStudents: 1,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    techStack: ['ROS2', 'PyTorch', 'PX4 Autopilot', 'C++', 'Docker'],
  },
  {
    _id: 'mock-proj-2',
    title: 'Zero-Knowledge Rollup Optimization for Layer-2 Blockchains',
    description:
      'Benchmarking SNARK vs STARK proof generation bottlenecks in EVM-compatible rollup sequencers. Focuses on recursive circuit compression and reducing state verification gas overhead for decentralized academic credential verification.',
    domain: 'Blockchain & Web3',
    courseType: 'Research Project',
    faculty: {
      id: 'fac-2',
      name: 'Dr. Sarah Lin',
      email: 'sarah.lin@srmap.edu.in',
      department: 'Computer Science and Engineering',
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    } as any,
    requirements: 'Strong grasp of applied cryptography, abstract algebra, and Rust or Solidity systems programming.',
    maxStudents: 3,
    currentStudents: 2,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString(),
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    techStack: ['Rust', 'ZK-SNARKs', 'Solidity', 'Go', 'Web3.js'],
  },
  {
    _id: 'mock-proj-3',
    title: 'Real-Time End-to-End Encrypted Telemetry for Connected Vehicles',
    description:
      'Implementation of a secure CAN-bus to cloud gateway leveraging asymmetric hardware-accelerated elliptic curves. Incorporates an edge-based anomaly detection engine to identify spoofing and denial-of-service attempts on vehicle networks.',
    domain: 'IoT & Embedded Systems',
    courseType: 'Industrial Project',
    faculty: {
      id: 'fac-3',
      name: 'Prof. Rajesh Kumar',
      email: 'rajesh.kumar@srmap.edu.in',
      department: 'Electronics & Communication',
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    } as any,
    requirements: 'Embedded C/C++, MQTT protocol understanding, and familiarity with microcontrollers (ESP32/STM32).',
    maxStudents: 4,
    currentStudents: 0,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    techStack: ['Embedded C++', 'MQTT', 'FreeRTOS', 'AWS IoT', 'Kafka'],
  },
  {
    _id: 'mock-proj-4',
    title: 'Automated Formal Verification of Smart Contract Protocols',
    description:
      'Building an automated symbolic execution framework with SMT solvers to verify invariance rules in DeFi lending pools. Formulates mathematical proofs to prevent reentrancy, flash loan attacks, and precision loss vulnerabilities.',
    domain: 'Cybersecurity',
    courseType: 'Capstone Project',
    faculty: {
      id: 'fac-4',
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@srmap.edu.in',
      department: 'Computer Science and Engineering',
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    } as any,
    requirements: 'Discrete mathematics, logic synthesis, and experience with symbolic execution or smart contract auditing.',
    maxStudents: 4,
    currentStudents: 2,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(),
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    techStack: ['Z3 Solver', 'Coq', 'Solidity', 'TypeScript', 'Foundry'],
  },
  {
    _id: 'mock-proj-5',
    title: 'High-Throughput Distributed Graph Neural Network Training',
    description:
      'Designing a partitioned graph execution runtime for multi-GPU training on trillion-edge academic citation and molecular property graphs. Evaluates communication-reducing caching strategies and dynamic gradient quantization.',
    domain: 'Cloud & Distributed Systems',
    courseType: 'Research Project',
    faculty: {
      id: 'fac-5',
      name: 'Dr. Vikram Malhotra',
      email: 'vikram.m@srmap.edu.in',
      department: 'Computer Science and Engineering',
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    } as any,
    requirements: 'Distributed systems primitives, PyTorch Geometric or DGL, and CUDA parallel programming principles.',
    maxStudents: 3,
    currentStudents: 1,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    techStack: ['Ray Cluster', 'PyG', 'Kubernetes', 'gRPC', 'CUDA'],
  },
  {
    _id: 'mock-proj-6',
    title: 'Multimodal Clinical Diagnosis Assistant via Visual Language Models',
    description:
      'Fine-tuning vision-language foundation models on high-resolution chest radiography and MRI pathology datasets. Implements attention heat-map explainability to supply clinicians with calibrated confidence intervals.',
    domain: 'Machine Learning',
    courseType: 'Capstone Project',
    faculty: {
      id: 'fac-6',
      name: 'Dr. Ananya Sharma',
      email: 'ananya.sharma@srmap.edu.in',
      department: 'Computer Science and Engineering',
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    } as any,
    requirements: 'Deep learning frameworks, computer vision architectures, and experience handling DICOM medical imaging datasets.',
    maxStudents: 4,
    currentStudents: 3,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    techStack: ['PyTorch', 'Transformers', 'FastAPI', 'Next.js', 'DICOM'],
  },
  {
    _id: 'mock-proj-7',
    title: 'Decentralized Federated Learning on Edge Devices',
    description:
      'Investigating differential privacy mechanisms and model aggregation algorithms under non-IID data distributions on ARM micro-controllers and mobile devices without transmitting raw user training data.',
    domain: 'Artificial Intelligence',
    courseType: 'Mini Project',
    faculty: {
      id: 'fac-7',
      name: 'Prof. David Chen',
      email: 'david.chen@srmap.edu.in',
      department: 'Computer Science and Engineering',
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    } as any,
    requirements: 'Python, machine learning basics, and mobile or Linux edge environments.',
    maxStudents: 2,
    currentStudents: 1,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 16).toISOString(),
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    techStack: ['TensorFlow Lite', 'Kotlin', 'WebSockets', 'Python'],
  },
  {
    _id: 'mock-proj-8',
    title: 'Micro-Frontend Orchestration Framework with Zero-Config State',
    description:
      'Developing an enterprise Module Federation framework supporting independent team deployments, decoupled route handling, dynamic component pre-fetching, and shared synchronized memory state across disparate frontend bundles.',
    domain: 'Web & Full Stack',
    courseType: 'Mini Project',
    faculty: {
      id: 'fac-8',
      name: 'Prof. Meera Nair',
      email: 'meera.nair@srmap.edu.in',
      department: 'Computer Science and Engineering',
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    } as any,
    requirements: 'Advanced TypeScript, React component lifecycle, build tool pipelines (Vite/Webpack), and web performance metrics.',
    maxStudents: 4,
    currentStudents: 2,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    techStack: ['React', 'Vite', 'TypeScript', 'Tailwind', 'Node.js'],
  },
];

export const ProjectCatalog: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [apiProjects, setApiProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCourseType, setSelectedCourseType] = useState<CourseType | 'All'>('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Density View Toggle: 'grid' vs 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Faculty toggle for their own projects
  const [facultyFilter, setFacultyFilter] = useState<'all' | 'mine'>('all');

  // Drawer for project details
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
        setApiProjects(response.projects || []);
        setTotalCount(response.count || 0);
        setTotalPages(1);
      } else {
        const response = await projectService.getProjects({
          page,
          limit: 9,
          search: searchQuery,
          domain: selectedDomain === 'All' ? undefined : selectedDomain,
          courseType: selectedCourseType === 'All' ? undefined : selectedCourseType,
        });
        setApiProjects(response.projects || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalCount(response.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to load projects from API, falling back to mock dataset', err);
      setApiProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, selectedDomain, selectedCourseType, facultyFilter]);

  // Compute displayed projects: if live API is empty, fall back to realistic mock projects
  const displayedProjects = useMemo(() => {
    if (apiProjects.length > 0) {
      return apiProjects;
    }

    // Filter mock projects based on local filter criteria
    return MOCK_PROJECTS.filter((proj) => {
      const matchesSearch =
        !searchQuery.trim() ||
        proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (proj.techStack && proj.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesDomain = selectedDomain === 'All' || proj.domain === selectedDomain;
      const matchesCourse = selectedCourseType === 'All' || proj.courseType === selectedCourseType;

      return matchesSearch && matchesDomain && matchesCourse;
    });
  }, [apiProjects, searchQuery, selectedDomain, selectedCourseType]);

  const activeCount = apiProjects.length > 0 ? totalCount : displayedProjects.length;

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {feedback && (
          <div className="mb-6">
            <Alert
              type={feedback.type}
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Academic Project Catalog
              </h1>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                AY 2026-27
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore faculty-sponsored capstone, mini, and research projects with verified allocation seats.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 text-slate-900 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-slate-100 text-slate-900 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Dense table view"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            {isFacultyOrAdmin && (
              <>
                <button
                  onClick={() => {
                    setFacultyFilter(facultyFilter === 'all' ? 'mine' : 'all');
                    setPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    facultyFilter === 'mine'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {facultyFilter === 'mine' ? 'My Proposals Active' : 'My Proposals'}
                </button>

                <button
                  onClick={() => navigate('/projects/create')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4" /> Propose Project
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sticky Filters and Search Header Bar */}
        <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md pt-1 pb-4 border-b border-slate-200/80 mb-6 space-y-3.5">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by keywords, technical stack (e.g., PyTorch, Rust, ROS2), or mentor..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-2xs shrink-0 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              Filter
            </button>
          </form>

          {/* Domain Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {DOMAINS.map((domain) => (
              <button
                key={domain}
                onClick={() => {
                  setSelectedDomain(domain);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
                  selectedDomain === domain
                    ? 'bg-blue-600 text-white border border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>

          {/* Course Category Filter + Results Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Category:
              </span>
              <div className="flex items-center gap-1">
                {COURSE_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedCourseType(type);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedCourseType === type
                        ? 'bg-slate-900 text-white font-medium'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-slate-500 flex items-center gap-2">
              <span>
                Showing <strong className="text-slate-900 font-semibold">{activeCount}</strong> academic projects
              </span>
              {apiProjects.length === 0 && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" /> Populated Catalog
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section: Grid View vs Table View */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm"
              />
            ))}
          </div>
        ) : displayedProjects.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white border border-slate-200 shadow-sm max-w-lg mx-auto my-8">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No matching academic projects align with your filter criteria. Try resetting filters or search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedDomain('All');
                setSelectedCourseType('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* High-Density Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedProjects.map((project) => {
              const faculty =
                typeof project.faculty === 'object' && project.faculty !== null
                  ? project.faculty
                  : null;

              const deadlineDate = new Date(project.deadline);
              const daysLeft = Math.ceil(
                (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );

              const availableSlots = Math.max(0, project.maxStudents - (project.currentStudents || 0));
              const techList: string[] =
                (project as any).techStack || ['Python', 'FastAPI', 'Docker', 'PostgreSQL'];

              return (
                <div
                  key={project._id}
                  onClick={() => setSelectedProject(project)}
                  className="group rounded-xl bg-white border border-slate-200 hover:border-slate-300 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer relative"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 truncate max-w-[170px]">
                        {project.domain}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {project.courseType}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {project.description}
                    </p>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {techList.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          {tech}
                        </span>
                      ))}
                      {techList.length > 4 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          +{techList.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {/* Faculty Mentor & Details */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-3.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {faculty?.avatar ? (
                          <img
                            src={faculty.avatar}
                            alt={faculty.name}
                            className="w-6 h-6 rounded-full border border-slate-200 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold shrink-0">
                            {faculty?.name?.charAt(0) || <UserIcon className="w-3 h-3" />}
                          </div>
                        )}
                        <span className="text-slate-700 font-medium truncate max-w-[130px]">
                          {faculty?.name || 'Faculty Guide'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`flex items-center gap-1 font-mono text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                            availableSlots > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <Users className="w-3 h-3" />
                          {availableSlots}/{project.maxStudents} open
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {daysLeft > 0 ? `${daysLeft}d` : 'Ended'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Footer */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-blue-600 group-hover:underline flex items-center gap-1">
                        View Details & Milestones <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </span>

                      {user?.role === 'student' && availableSlots > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenApply(project);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-all flex items-center gap-1"
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
        ) : (
          /* High-Density Enterprise Data Table */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                    <th className="py-3.5 px-4">Project Title & Domain</th>
                    <th className="py-3.5 px-4">Course Category</th>
                    <th className="py-3.5 px-4">Faculty Advisor</th>
                    <th className="py-3.5 px-4">Tech Stack</th>
                    <th className="py-3.5 px-4 text-center">Open Seats</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {displayedProjects.map((project) => {
                    const faculty =
                      typeof project.faculty === 'object' && project.faculty !== null
                        ? project.faculty
                        : null;
                    const availableSlots = Math.max(0, project.maxStudents - (project.currentStudents || 0));
                    const techList: string[] =
                      (project as any).techStack || ['Python', 'Docker', 'FastAPI'];

                    return (
                      <tr
                        key={project._id}
                        onClick={() => setSelectedProject(project)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {project.title}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-medium text-blue-600">{project.domain}</span>
                            <span>&bull;</span>
                            <span className="font-mono text-slate-400">ID: {project._id.slice(-6)}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {project.courseType}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {faculty?.avatar ? (
                              <img
                                src={faculty.avatar}
                                alt={faculty.name}
                                className="w-6 h-6 rounded-full border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                                {faculty?.name?.charAt(0) || 'F'}
                              </div>
                            )}
                            <span className="font-medium text-slate-800">{faculty?.name || 'Faculty Guide'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {techList.slice(0, 3).map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700"
                              >
                                {tech}
                              </span>
                            ))}
                            {techList.length > 3 && (
                              <span className="text-[10px] text-slate-400">+{techList.length - 3}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                              availableSlots > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {availableSlots} / {project.maxStudents}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProject(project);
                              }}
                              className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                              Inspect
                            </button>
                            {user?.role === 'student' && availableSlots > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenApply(project);
                                }}
                                className="px-3 py-1 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-colors flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" /> Apply
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Navigation */}
        {totalPages > 1 && facultyFilter === 'all' && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs text-slate-500 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-2xs"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Reusable Slide-Out Project Details Drawer */}
        <ProjectDetailsDrawer
          isOpen={Boolean(selectedProject)}
          project={selectedProject as any}
          onClose={() => setSelectedProject(null)}
          onApply={(proj) => handleOpenApply(proj)}
          userRole={user?.role}
        />

        {/* Application Submission Modal */}
        {applyProject && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 relative">
              <button
                onClick={() => setApplyProject(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {applyProject.courseType}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">Apply for Academic Project</h2>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{applyProject.title}</p>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                {/* Mode Selector: Solo vs Group */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Application Roster Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setApplyMode('solo')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        applyMode === 'solo'
                          ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Individual / Solo (1 Student)
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplyMode('group')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        applyMode === 'group'
                          ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Apply with Locked Team Roster
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
                        className="w-full px-3.5 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      >
                        {availableGroups.map((g) => (
                          <option key={g._id} value={g._id}>
                            {g.name} ({g.members.length} members)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-600 inline mr-1.5" />
                        No locked groups found for {applyProject.courseType}. Go to{' '}
                        <span
                          onClick={() => navigate('/groups')}
                          className="text-blue-600 underline cursor-pointer font-bold"
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
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 shadow-2xs leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Minimum 50 characters required</span>
                    <span className={statementOfPurpose.length >= 50 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                      {statementOfPurpose.length} / 50
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setApplyProject(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
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
                    className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition-all focus:ring-2 focus:ring-blue-500"
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
