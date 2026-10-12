import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/Navbar';
import { EligibilityCard } from '../components/EligibilityCard';
import { User } from '../types/auth.types';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  FileSpreadsheet,
  Users2,
  Calendar,
  ShieldCheck,
  Lock,
  PlusCircle,
  X,
  ArrowRight,
  AlertTriangle,
  Clock,
  TrendingUp,
  Database,
  RefreshCw,
  HardDrive,
  FileText,
  UserCheck,
  ChevronRight,
  Award,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
} from 'lucide-react';

// ==========================================
// MOCK DATA CONTRACTS & FIXTURES
// ==========================================

interface PendingTeamApproval {
  id: string;
  groupName: string;
  projectTitle: string;
  domain: string;
  leader: string;
  membersCount: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'declined';
}

interface MentoredGroup {
  id: string;
  groupName: string;
  projectTitle: string;
  domain: string;
  leader: string;
  membersCount: number;
  currentMilestone: string;
  progress: number;
  nextDeadline: string;
}

interface MilestoneDeadline {
  id: string;
  name: string;
  date: string;
  status: 'completed' | 'active' | 'upcoming';
  progressText: string;
}

interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  timeAgo: string;
  badge: { label: string; color: string };
}

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'coordinator' | 'admin';
  department: string;
  status: 'active' | 'pending';
  joinedAt: string;
}

const MOCK_PENDING_APPROVALS: PendingTeamApproval[] = [
  {
    id: 'grp-01',
    groupName: 'Team CyberPulse',
    projectTitle: 'Decentralized Zero-Trust Key Management for Campus IoT',
    domain: 'Cybersecurity & Cryptography',
    leader: 'Rohan Verma',
    membersCount: 4,
    submittedAt: 'Today, 10:15 AM',
    status: 'pending',
  },
  {
    id: 'grp-02',
    groupName: 'Team BioSense',
    projectTitle: 'Edge ML Accelerated Non-Invasive Glucose Monitoring Device',
    domain: 'Healthcare IoT & Edge ML',
    leader: 'Ananya Iyer',
    membersCount: 3,
    submittedAt: 'Yesterday, 4:20 PM',
    status: 'pending',
  },
];

const MOCK_MENTORED_GROUPS: MentoredGroup[] = [
  {
    id: 'grp-101',
    groupName: 'Team NeuroVision',
    projectTitle: 'Low-latency Obstacle Detection for Micro-drones with TensorRT',
    domain: 'Computer Vision & Robotics',
    leader: 'Arjun Kumar',
    membersCount: 4,
    currentMilestone: 'Phase 2: Model Quantization & Testbed Benchmark',
    progress: 68,
    nextDeadline: 'Oct 18, 2026 (Viva Stage 1)',
  },
  {
    id: 'grp-102',
    groupName: 'Team QuantumLedger',
    projectTitle: 'Post-Quantum Lattice-Based Digital Signatures for Transcripts',
    domain: 'Blockchain & Cryptography',
    leader: 'Priya Nair',
    membersCount: 3,
    currentMilestone: 'Phase 1: Architecture Formal Verification',
    progress: 42,
    nextDeadline: 'Oct 22, 2026 (SRS Sign-off)',
  },
  {
    id: 'grp-103',
    groupName: 'Team GreenGrid',
    projectTitle: 'Predictive Energy Dispatch for Distributed Campus Solar Microgrids',
    domain: 'Smart Energy & IoT',
    leader: 'Karthik Reddy',
    membersCount: 4,
    currentMilestone: 'Phase 3: Hardware Field Integration',
    progress: 85,
    nextDeadline: 'Nov 02, 2026 (Pre-Defense)',
  },
  {
    id: 'grp-104',
    groupName: 'Team MediBot',
    projectTitle: 'Multilingual Clinical Triaging Assistant with Local LLM Distillation',
    domain: 'NLP & Healthcare AI',
    leader: 'Sneha Roy',
    membersCount: 3,
    currentMilestone: 'Phase 2: Clinical Evaluation & Prompt Calibration',
    progress: 55,
    nextDeadline: 'Oct 25, 2026 (Interim Demo)',
  },
];

const MOCK_COORDINATOR_MILESTONES: MilestoneDeadline[] = [
  {
    id: 'm1',
    name: 'Team Registration & Capstone Topic Lock',
    date: 'Oct 10, 2026',
    status: 'completed',
    progressText: '142 / 142 Teams Locked',
  },
  {
    id: 'm2',
    name: 'Phase 1 SRS & Architecture Specification',
    date: 'Oct 28, 2026',
    status: 'active',
    progressText: '86 / 142 Submissions In Review',
  },
  {
    id: 'm3',
    name: 'Departmental Mid-Term Review & Viva Defense',
    date: 'Nov 18, 2026',
    status: 'upcoming',
    progressText: 'Panel Assignment Scheduled',
  },
  {
    id: 'm4',
    name: 'Final Code Freeze & Plagiarism Audit',
    date: 'Dec 05, 2026',
    status: 'upcoming',
    progressText: 'Turnitin / Moss Gate Active',
  },
  {
    id: 'm5',
    name: 'Capstone Defense & End-Semester Grading',
    date: 'Dec 20, 2026',
    status: 'upcoming',
    progressText: 'External Evaluator Registry',
  },
];

const MOCK_RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    actor: 'Dr. Sharma',
    action: 'approved capstone synopsis for',
    target: 'Group 4A (Distributed Ledgers for IoT)',
    timeAgo: '12m ago',
    badge: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700' },
  },
  {
    id: 'act-2',
    actor: 'Meera Nambiar',
    action: 'locked team registrations for',
    target: 'Batch 2023-27 (CSE Core & Specialization)',
    timeAgo: '45m ago',
    badge: { label: 'Lock Policy', color: 'bg-slate-100 text-slate-700' },
  },
  {
    id: 'act-3',
    actor: 'Prof. Sambit Kumar',
    action: 'submitted review marks for',
    target: 'Team NeuroVision (Phase 1 Rubrics)',
    timeAgo: '2h ago',
    badge: { label: 'Marks Graded', color: 'bg-emerald-50 text-emerald-700' },
  },
  {
    id: 'act-4',
    actor: 'Team Apex',
    action: 'uploaded architectural deliverable for',
    target: 'Autonomous Delivery Network',
    timeAgo: '4h ago',
    badge: { label: 'Submission', color: 'bg-amber-50 text-amber-800' },
  },
  {
    id: 'act-5',
    actor: 'Dr. K. Rao',
    action: 'confirmed co-guide allocation for',
    target: 'Team QuantumLedger (ECE Dept)',
    timeAgo: '6h ago',
    badge: { label: 'Co-Guide', color: 'bg-slate-100 text-slate-700' },
  },
  {
    id: 'act-6',
    actor: 'System Audit',
    action: 'automated originality check cleared for',
    target: '18 project synopses (< 8% similarity)',
    timeAgo: 'Yesterday',
    badge: { label: 'Audit Passed', color: 'bg-emerald-50 text-emerald-700' },
  },
];

const MOCK_ONBOARDED_USERS: AdminUserRecord[] = [
  {
    id: 'usr-1',
    name: 'Aarav Sharma',
    email: 'aarav_sharma@srmap.edu.in',
    role: 'student',
    department: 'Computer Science',
    status: 'active',
    joinedAt: 'Oct 12, 2026',
  },
  {
    id: 'usr-2',
    name: 'Dr. Sambit Kumar',
    email: 'prof.sambitkumar.m@srmap.edu.in',
    role: 'faculty',
    department: 'Computer Science',
    status: 'active',
    joinedAt: 'Oct 11, 2026',
  },
  {
    id: 'usr-3',
    name: 'Meera Nambiar',
    email: 'coordinator.cse@srmap.edu.in',
    role: 'coordinator',
    department: 'Computer Science',
    status: 'active',
    joinedAt: 'Oct 10, 2026',
  },
  {
    id: 'usr-4',
    name: 'Kavya Patel',
    email: 'kavya_patel@srmap.edu.in',
    role: 'student',
    department: 'Electronics & Comm.',
    status: 'pending',
    joinedAt: 'Oct 10, 2026',
  },
  {
    id: 'usr-5',
    name: 'Dr. Ramesh Babu',
    email: 'dr.ramesh.b@srmap.edu.in',
    role: 'faculty',
    department: 'Mechanical Eng.',
    status: 'active',
    joinedAt: 'Oct 09, 2026',
  },
];

// ==========================================
// SHARED WELCOME BANNER COMPONENT
// ==========================================

interface WelcomeHeaderProps {
  user: User;
  onExploreProjects?: () => void;
  onProposeProject?: () => void;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
  actionButtonIcon?: React.ReactNode;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  user,
  onExploreProjects,
  onProposeProject,
  actionButtonLabel,
  onActionButtonClick,
  actionButtonIcon,
}) => {
  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 mb-6 shadow-xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl border border-slate-200 object-cover shadow-2xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl border border-blue-200">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <span className="capitalize text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                {user?.role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {user?.department || 'Department of Computer Science'} &bull;{' '}
              <span className="text-slate-700 font-mono text-xs">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onExploreProjects && (
            <button
              onClick={onExploreProjects}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Explore Projects</span>
            </button>
          )}

          {onProposeProject && (
            <button
              onClick={onProposeProject}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-all shadow-2xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Propose Project</span>
            </button>
          )}

          {actionButtonLabel && onActionButtonClick && (
            <button
              onClick={onActionButtonClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs focus:ring-2 focus:ring-slate-800 focus:outline-none"
            >
              {actionButtonIcon}
              <span>{actionButtonLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 1. STUDENT DASHBOARD VIEW
// ==========================================

interface StudentDashboardViewProps {
  user: User;
  bannerDismissed: boolean;
  setBannerDismissed: (val: boolean) => void;
  navigate: ReturnType<typeof useNavigate>;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  user,
  bannerDismissed,
  setBannerDismissed,
  navigate,
}) => {
  return (
    <div className="space-y-6">
      {/* Student Incomplete Profile Progress Banner (Shown ONLY to students) */}
      {!user.isProfileComplete && !bannerDismissed && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border border-amber-200 p-5 shadow-xs relative animate-in fade-in slide-in-from-top-2 duration-300">
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
                <span className="p-1 rounded-md bg-amber-100 text-amber-800">
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
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-all flex items-center gap-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <span>Complete Academic Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <WelcomeHeader
        user={user}
        onExploreProjects={() => navigate('/projects')}
      />

      {/* Student Project Standing & Eligibility Card */}
      <EligibilityCard />

      {/* Active Project Standing Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Active Capstone Project</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                  Approved &bull; AY 2026-27
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                CSE-401 Capstone Project &bull; Track: Autonomous Systems & Edge AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/workspace')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Project Title
            </span>
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              Distributed Autonomous Delivery Network using Edge AI & Low-Latency Mesh
            </p>
            <p className="text-xs text-slate-500">
              Faculty Guide: <span className="font-semibold text-slate-700">Dr. Sambit Kumar</span>
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Milestone Standing
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Phase 1 Architecture Complete</span>
              <span className="font-mono text-blue-600 font-bold">45%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full w-[45%]" />
            </div>
            <p className="text-[11px] text-amber-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Phase 2 SRS Submission due Oct 28, 2026</span>
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Team Roster
            </span>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  AK
                </span>
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  RV
                </span>
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  AI
                </span>
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                  PN
                </span>
              </div>
              <span className="text-xs text-slate-600 font-medium">Team Apex (4 Members)</span>
            </div>
            <button
              onClick={() => navigate('/groups')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Manage Group Members</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Academic Portal Modules Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Upcoming Academic Modules</h2>
          <span className="text-xs text-slate-500 font-medium">Enterprise Suite AY 2026-27</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/projects')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 w-fit mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Project Catalog
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Explore approved problem statements, research tracks, and faculty mentorship proposals.
            </p>
          </div>

          <div
            onClick={() => navigate('/groups')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 w-fit mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
              Team Formation
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Student group creation, peer invitations, cross-department team management, and approvals.
            </p>
          </div>

          <div
            onClick={() => navigate('/workspace')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 w-fit mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
              Execution Workspace
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Mid-term reviews, viva schedules, continuous assessment marks, and rubrics matrix.
            </p>
          </div>

          <div
            onClick={() => navigate('/meetings')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 w-fit mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
              Mentorship Meetings
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Weekly sync schedules, faculty minutes of meeting (MoM), and milestone sign-offs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. FACULTY DASHBOARD VIEW
// ==========================================

interface FacultyDashboardViewProps {
  user: User;
  navigate: ReturnType<typeof useNavigate>;
}

export const FacultyDashboardView: React.FC<FacultyDashboardViewProps> = ({ user, navigate }) => {
  const [pendingList, setPendingList] = useState<PendingTeamApproval[]>(MOCK_PENDING_APPROVALS);

  const handleDecision = (id: string, groupName: string, decision: 'approved' | 'declined') => {
    setPendingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
    );
    if (decision === 'approved') {
      toast.success(`${groupName} approved for mentorship!`);
    } else {
      toast.error(`${groupName} application declined.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <WelcomeHeader
        user={user}
        onProposeProject={() => navigate('/projects/create')}
        actionButtonLabel="Review Applications"
        onActionButtonClick={() => navigate('/applications')}
        actionButtonIcon={<FileText className="w-4 h-4" />}
      />

      {/* Top KPI Row: 4 standard metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Mentorships
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">4 / 5</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              1 Slot Free
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Cap reached: 80% quota utilized</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-blue-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {pendingList.filter((p) => p.status === 'pending').length}
            </span>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Team proposals awaiting guide decision</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Deliverables to Grade
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-blue-100">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">12</span>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Phase 1 & 2
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Across 4 active capstone batches</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Upcoming Meetings
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-blue-100">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">3</span>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
              This Week
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Next: Today at 3:30 PM (Team NeuroVision)</p>
        </div>
      </div>

      {/* Actionable Queue: Pending Team Approvals */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Pending Team Approvals</span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                {pendingList.filter((p) => p.status === 'pending').length} In Queue
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review project proposals submitted by student leaders requesting your mentorship
            </p>
          </div>

          <button
            onClick={() => navigate('/applications')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>View All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[11px] bg-slate-50/50">
                <th className="py-3 px-4 rounded-l-xl">Group & Leader</th>
                <th className="py-3 px-4">Project Synopsis</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    <div className="font-bold text-slate-900">{item.groupName}</div>
                    <div className="text-slate-500 text-[11px]">
                      Lead: {item.leader} &bull; {item.membersCount} members
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-700">
                    <span className="line-clamp-1 font-medium">{item.projectTitle}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {item.domain}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                    {item.submittedAt}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDecision(item.id, item.groupName, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleDecision(item.id, item.groupName, 'declined')}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-slate-300 hover:border-red-300 font-semibold text-xs transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    ) : item.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700">
                        Declined
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Groups Grid: 2-column grid of cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Mentored Project Teams</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live milestones and grading progress for your 4 assigned academic groups
            </p>
          </div>
          <button
            onClick={() => navigate('/assessments')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span>Open Assessment Rubrics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {MOCK_MENTORED_GROUPS.map((group) => (
            <div
              key={group.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{group.groupName}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                        {group.domain}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Leader: <span className="text-slate-800 font-semibold">{group.leader}</span> &bull;{' '}
                      {group.membersCount} Members
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50/70 px-2 py-1 rounded-lg">
                    {group.progress}%
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium mb-3 line-clamp-1">
                  {group.projectTitle}
                </p>

                {/* Progress bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">{group.currentMilestone}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${group.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Next Review: <strong className="text-slate-800">{group.nextDeadline}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigate('/workspace')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors text-center"
                >
                  Workspace
                </button>
                <button
                  onClick={() => navigate('/assessments')}
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors text-center"
                >
                  Grade Rubrics
                </button>
                <button
                  onClick={() => navigate('/meetings')}
                  className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors"
                  title="Schedule sync"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. COORDINATOR DASHBOARD VIEW
// ==========================================

interface CoordinatorDashboardViewProps {
  user: User;
  navigate: ReturnType<typeof useNavigate>;
}

export const CoordinatorDashboardView: React.FC<CoordinatorDashboardViewProps> = ({
  user,
  navigate,
}) => {
  const handleExportCSV = () => {
    toast.success('Generating Department AY 2026-27 CSV Evaluation Report...');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header (No student incomplete profile banner here) */}
      <WelcomeHeader
        user={user}
        onExploreProjects={() => navigate('/projects')}
        onProposeProject={() => navigate('/projects/create')}
        actionButtonLabel="Department Analytics"
        onActionButtonClick={() => navigate('/analytics')}
        actionButtonIcon={<BarChart3 className="w-4 h-4" />}
      />

      {/* Top KPI Row: Department-wide metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Department Projects
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">142</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +12% vs last cycle
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Active in B.Tech CSE & ECE batches</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unassigned Students
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">18</span>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
              Matching Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">12 in CSE Core &bull; 6 in AI Specialization</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faculty Allocation Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">92%</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Target: 100%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">46 of 50 faculty mentors actively assigned</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Phase 1 Evaluation Rate
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">78%</span>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
              111 / 142 Graded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">31 synopses awaiting guide sign-off</p>
        </div>
      </div>

      {/* Milestone Timeline: Department Deadlines */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Department Milestone Timeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official academic deadlines and gate reviews for Capstone Cycle AY 2026-27
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Department CSV</span>
          </button>
        </div>

        <div className="space-y-4">
          {MOCK_COORDINATOR_MILESTONES.map((milestone, idx) => (
            <div
              key={milestone.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all gap-4 bg-slate-50/40"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    milestone.status === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : milestone.status === 'active'
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {milestone.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{milestone.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{milestone.progressText}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="text-xs font-mono font-medium text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {milestone.date}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                    milestone.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : milestone.status === 'active'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {milestone.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Department Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit trail of project proposals, marks entries, and mentor allocations
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Live Stream</span>
        </div>

        <div className="space-y-3.5">
          {MOCK_RECENT_ACTIVITIES.map((act) => (
            <div
              key={act.id}
              className="flex items-start sm:items-center justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 sm:mt-0 shrink-0" />
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-semibold">{act.actor}</strong> {act.action}{' '}
                  <span className="font-semibold text-slate-800">{act.target}</span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${act.badge.color}`}
                >
                  {act.badge.label}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{act.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. ADMIN DASHBOARD VIEW
// ==========================================

interface AdminDashboardViewProps {
  user: User;
  navigate: ReturnType<typeof useNavigate>;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ user, navigate }) => {
  const [syncing, setSyncing] = useState(false);
  const [gradingLocked, setGradingLocked] = useState(false);

  const handleSyncERP = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success('ERP Directory synced: 1,248 student & faculty records up to date.');
    }, 1200);
  };

  const handleManageRBAC = () => {
    toast.success('RBAC Domain Policy active: @srmap.edu.in enforced on all routes.');
  };

  const handleToggleGradingLock = () => {
    setGradingLocked(!gradingLocked);
    if (!gradingLocked) {
      toast.error('Global Grading Locked. Marks editing disabled across all panels.');
    } else {
      toast.success('Global Grading Unlocked. Marks editing restored for evaluators.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <WelcomeHeader
        user={user}
        onExploreProjects={() => navigate('/projects')}
        onProposeProject={() => navigate('/projects/create')}
        actionButtonLabel="System Settings"
        onActionButtonClick={() => toast.success('Master Administration Controls Active')}
        actionButtonIcon={<SlidersHorizontal className="w-4 h-4" />}
      />

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Users
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">1,248</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              94% Online
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">1,180 Students &bull; 68 Faculty/Staff</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Database Status
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">Healthy</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              99.98% Uptime
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">MongoDB Cluster &bull; 0.4ms query latency</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Error Logs (24h)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">0 Critical</span>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
              2 Warns
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Zero 5xx server exceptions recorded</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Deliverables Storage
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">42.8 GB</span>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
              / 100 GB
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">AWS S3 Artifact & Code Repository Bucket</p>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">Master Operations & Controls</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute global administrative routines and security policy synchronizations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleSyncERP}
            disabled={syncing}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white text-left transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-lg bg-blue-100/70 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              </div>
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                Sync Job
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                Sync ERP Directory
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Re-hydrate student enrollments, CGPA records, and faculty lists from SRM AP central database.
              </p>
            </div>
          </button>

          <button
            onClick={handleManageRBAC}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-white text-left transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-lg bg-indigo-100/70 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                Security
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">
                Manage RBAC Roles
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inspect privilege boundaries, backend middleware guards, and @srmap.edu.in OAuth claim rules.
              </p>
            </div>
          </button>

          <button
            onClick={handleToggleGradingLock}
            className={`p-4 rounded-xl border text-left transition-all shadow-2xs group flex flex-col justify-between ${
              gradingLocked
                ? 'border-red-300 bg-red-50/50 hover:bg-red-50'
                : 'border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-2.5 rounded-lg transition-colors ${
                  gradingLocked
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-200 text-slate-700 group-hover:bg-slate-900 group-hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  gradingLocked ? 'text-red-700' : 'text-slate-600'
                }`}
              >
                {gradingLocked ? 'Locked' : 'Unlocked'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                {gradingLocked ? 'Unlock Global Grading' : 'Lock Global Grading'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {gradingLocked
                  ? 'Currently locked: marks cannot be edited. Click to unlock evaluation access.'
                  : 'Freeze marks submission and grade modifications across all evaluation panels.'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* User Directory Snapshot */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">User Directory Snapshot</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recently onboarded SRM University-AP institutional accounts (1,248 total)
            </p>
          </div>
          <button
            onClick={() => toast.success('Opening Complete Institutional User Directory')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>View All Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[11px] bg-slate-50/50">
                <th className="py-3 px-4 rounded-l-xl">User & Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_ONBOARDED_USERS.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{usr.name}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{usr.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`capitalize px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        usr.role === 'admin'
                          ? 'bg-purple-50 text-purple-800'
                          : usr.role === 'coordinator'
                          ? 'bg-amber-50 text-amber-800'
                          : usr.role === 'faculty'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{usr.department}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        usr.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          usr.status === 'active' ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}
                      />
                      {usr.status === 'active' ? 'Active' : 'Pending Verification'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500 text-[11px]">
                    {usr.joinedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT WITH RBAC SWITCH
// ==========================================

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Fallback if user is hydrating or null
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center max-w-md">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Loading Academic Dashboard...</h2>
            <p className="text-xs text-slate-500 mt-1">
              Synchronizing permissions and academic roster with SRM University-AP directory.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Conditional rendering block based on user.role */}
        {(() => {
          switch (user.role) {
            case 'faculty':
              return <FacultyDashboardView user={user} navigate={navigate} />;
            case 'coordinator':
              return <CoordinatorDashboardView user={user} navigate={navigate} />;
            case 'admin':
              return <AdminDashboardView user={user} navigate={navigate} />;
            case 'student':
            default:
              return (
                <StudentDashboardView
                  user={user}
                  bannerDismissed={bannerDismissed}
                  setBannerDismissed={setBannerDismissed}
                  navigate={navigate}
                />
              );
          }
        })()}
      </main>
    </div>
  );
};

export default Dashboard;
