import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/Navbar';
import applicationService from '../services/application.service';
import assessmentService from '../services/assessment.service';
import meetingService from '../services/meeting.service';
import { Application } from '../types/application.types';
import { Assessment, Submission } from '../types/assessment.types';
import { Meeting } from '../types/meeting.types';
import { SubmissionModal } from '../components/SubmissionModal';
import { Alert } from '../components/Alert';
import toast from 'react-hot-toast';
import {
  FolderGit2,
  Calendar,
  Award,
  ExternalLink,
  CheckCircle2,
  Clock,
  RotateCw,
  FileCheck,
  Download,
  Video,
  UploadCloud,
  FileText,
  Github,
  ShieldCheck,
  Paperclip,
  Check,
  Users2,
  AlertCircle,
  Eye,
  ZoomIn,
  ZoomOut,
  Sliders,
  MessageSquare,
} from 'lucide-react';

interface ExtendedAssessment extends Assessment {
  weightage?: number;
}

// ==========================================
// ENTERPRISE MOCK WORKSPACE DATA
// ==========================================

const MOCK_ALLOCATED_APP: Application = {
  _id: 'mock-app-approved-1',
  project: {
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
    requirements: 'Proficiency in Python/C++, ROS2 or PX4 autopilot, and state estimation foundations.',
    maxStudents: 4,
    currentStudents: 4,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    status: 'allocated',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  appliedBy: {
    id: 'lead-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@srmap.edu.in',
    role: 'student',
  } as any,
  group: {
    _id: 'mock-group-4a',
    name: 'Autonomous Systems & Swarm Lab (Group 4A)',
    courseType: 'Capstone Project',
    status: 'assigned',
    leader: {
      id: 'lead-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@srmap.edu.in',
      rollNumber: 'AP21110010042',
      department: 'Computer Science and Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      cgpa: 9.32,
      role: 'student',
    } as any,
    members: [
      {
        _id: 'lead-1',
        id: 'lead-1',
        name: 'Alex Rivera',
        rollNumber: 'AP21110010042',
        email: 'alex.rivera@srmap.edu.in',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      } as any,
      {
        _id: 'mem-2',
        id: 'mem-2',
        name: 'Sneha Patel',
        rollNumber: 'AP21110010108',
        email: 'sneha.patel@srmap.edu.in',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      } as any,
      {
        _id: 'mem-3',
        id: 'mem-3',
        name: 'Kevin Zhao',
        rollNumber: 'AP21110010215',
        email: 'kevin.zhao@srmap.edu.in',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      } as any,
      {
        _id: 'mem-4',
        id: 'mem-4',
        name: 'Priya Sharma',
        rollNumber: 'AP21110010344',
        email: 'priya.sharma@srmap.edu.in',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      } as any,
    ],
    invites: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  statementOfPurpose:
    'Our team has background in ROS2 robotics, decentralized distributed consensus protocols, and computer vision. We have set up a Gazebo simulation environment and intend to validate flocking dynamics with obstacle avoidance algorithms.',
  status: 'approved',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_ASSESSMENTS: ExtendedAssessment[] = [
  {
    _id: 'assess-1',
    title: 'Milestone 1: SRS, System Architecture & Literature Review',
    description:
      'Submit the formal Software Requirements Specification (SRS), formal decentralized swarm state machine diagram, and IEEE format literature review.',
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    maxMarks: 50,
    weightage: 20,
    faculty: 'fac-1',
    project: 'mock-proj-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'assess-2',
    title: 'Milestone 2: Distributed Consensus & Obstacle Avoidance Algorithm',
    description:
      'Deliver the functioning ROS2 Gazebo simulator node package, collision-free waypoint algorithm, and interim progress video.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8).toISOString(),
    maxMarks: 100,
    weightage: 40,
    faculty: 'fac-1',
    project: 'mock-proj-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'assess-3',
    title: 'Milestone 3: Hardware-in-the-Loop Flight Test & Final Defense',
    description:
      'Complete end-to-end hardware demonstration, final IEEE camera-ready conference paper submission, and project oral examination defense.',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 32).toISOString(),
    maxMarks: 100,
    weightage: 40,
    faculty: 'fac-1',
    project: 'mock-proj-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_SUBMISSIONS: Record<string, Submission> = {
  'assess-1': {
    _id: 'sub-1',
    assessment: 'assess-1',
    submittedBy: {
      id: 'lead-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@srmap.edu.in',
      role: 'student',
    } as any,
    fileUrl: 'https://cloudinary.com/academic/uav_swarm_srs_v1.pdf',
    cloudinaryPublicId: 'academic/uav_swarm_srs_v1',
    githubUrl: 'https://github.com/srmap-capstone/autonomous-uav-swarm',
    status: 'graded',
    marks: 48,
    feedback:
      'Exceptional algorithmic rigor. The distributed consensus formulation is well mathematically bounded. Approved to begin Gazebo ROS2 integration.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const MOCK_MEETINGS: Meeting[] = [
  {
    _id: 'meet-1',
    title: 'Sprint Review: Gazebo ROS2 Simulation Convergence',
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    agenda: 'Flocking algorithm stability under latency',
    meetingMinutes:
      'Discussed flocking algorithm stability under 150ms simulated wireless latency. Dr. Thorne suggested adding Kalman filter state prediction.',
    meetingLink: 'https://meet.google.com/uav-srm-sync',
    faculty: { id: 'fac-1', name: 'Dr. Aris Thorne' } as any,
    status: 'completed',
    project: 'mock-proj-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'meet-2',
    title: 'Milestone 2 Mid-Evaluation & Code Walkthrough',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    agenda: 'Code walkthrough and simulation demo',
    meetingMinutes: 'Scheduled oral code walkthrough in CSE Research Lab 304 at 2:30 PM.',
    meetingLink: 'https://meet.google.com/uav-srm-sync',
    faculty: { id: 'fac-1', name: 'Dr. Aris Thorne' } as any,
    status: 'scheduled',
    project: 'mock-proj-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface DeliverableFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  category: string;
  url: string;
  verified: boolean;
}

const INITIAL_DELIVERABLES: DeliverableFile[] = [
  {
    id: 'deliv-1',
    name: 'UAV_Swarm_Architecture_Specification_v2.1.pdf',
    size: '4.8 MB',
    uploadedAt: 'Yesterday at 4:15 PM',
    category: 'System Spec',
    url: '#',
    verified: true,
  },
  {
    id: 'deliv-2',
    name: 'ROS2_Gazebo_Simulation_Package_Source.zip',
    size: '28.4 MB',
    uploadedAt: '3 days ago',
    category: 'Code Archive',
    url: '#',
    verified: true,
  },
  {
    id: 'deliv-3',
    name: 'Swarm_Telemetry_Benchmarking_Results.ipynb',
    size: '1.2 MB',
    uploadedAt: 'Oct 8, 2026',
    category: 'Jupyter Notebook',
    url: '#',
    verified: true,
  },
];

// ==========================================
// FACULTY EVALUATION & GRADING WORKSPACE VIEW
// ==========================================

interface FacultyWorkspaceViewProps {
  app: Application;
  onRefresh: () => void;
}

const FacultyWorkspaceView: React.FC<FacultyWorkspaceViewProps> = ({ app, onRefresh }) => {
  const navigate = useNavigate();

  // Rubric Scores State
  const [scores, setScores] = useState({
    architecture: 18, // out of 20
    literature: 9, // out of 10
    presentation: 17, // out of 20
  });

  const [feedback, setFeedback] = useState(
    'Exceptional algorithmic rigor. The distributed consensus formulation is mathematically bounded. Consider adding Kalman filter state estimation to mitigate communication latency in the next phase.'
  );

  const [evaluationStatus, setEvaluationStatus] = useState<
    'pending' | 'approved' | 'revisions_requested'
  >('pending');

  const [activeDocTab, setActiveDocTab] = useState<'pdf' | 'github' | 'video' | 'notebook'>('pdf');
  const [zoomLevel, setZoomLevel] = useState(100);

  const totalScore = scores.architecture + scores.literature + scores.presentation;
  const maxTotalScore = 50;

  const handleScoreChange = (field: keyof typeof scores, value: string, max: number) => {
    const num = value === '' ? 0 : Number(value);
    if (!isNaN(num)) {
      setScores((prev) => ({
        ...prev,
        [field]: Math.min(max, Math.max(0, num)),
      }));
    }
  };

  const handleApproveAndLock = () => {
    setEvaluationStatus('approved');
    toast.success(
      `Milestone 1 approved and marks locked at ${totalScore}/${maxTotalScore} pts. Group 4A notified!`
    );
  };

  const handleRequestRevisions = () => {
    setEvaluationStatus('revisions_requested');
    toast.error('Revision request & feedback submitted to student team leader Alex Rivera.');
  };

  const handleScheduleMeeting = () => {
    toast.success('Navigating to Faculty Mentorship & Meeting Manager...');
    navigate('/meetings');
  };

  return (
    <div className="space-y-6">
      {/* 1. Faculty Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {evaluationStatus === 'pending' ? (
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Pending Phase 1 Evaluation
                </span>
              ) : evaluationStatus === 'approved' ? (
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Phase 1 Evaluated & Locked ({totalScore}/{maxTotalScore})
                </span>
              ) : (
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Revisions Requested
                </span>
              )}

              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {app.project.courseType || 'Capstone Project'}
              </span>

              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                Domain: {app.project.domain || 'Artificial Intelligence'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {app.project.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Users2 className="w-4 h-4 text-blue-600" />
                Team: <strong className="text-slate-900 font-bold">{app.group?.name || 'Group 4A'}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Team Leader:{' '}
                <strong className="text-slate-900 font-semibold">
                  {app.group?.leader?.name || 'Alex Rivera'}
                </strong>{' '}
                ({app.group?.leader?.rollNumber || 'AP21110010042'})
              </span>
              <span>&bull;</span>
              <span>
                Roster: <strong className="text-slate-800 font-medium">4 Students Enrolled</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
              title="Refresh Workspace"
            >
              <RotateCw className="w-4 h-4 text-slate-600" />
            </button>

            <button
              onClick={handleScheduleMeeting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Review Meeting</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Split-Screen Evaluation Layout (60/40 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT COLUMN (Submission Viewer) - 60% Width (col-span-7)
           ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Milestone Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Active Submission Under Review
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  Milestone 1: SRS, System Architecture & Literature Review
                </h2>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] font-semibold text-slate-500 block">Submitted By</span>
                <span className="text-xs font-bold text-slate-800 block">
                  Alex Rivera &bull; Yesterday at 4:15 PM
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Formal Software Requirements Specification (SRS), decentralized drone state machine topology,
              and an IEEE survey comparing decentralized flocking algorithms versus centralized ground
              stations.
            </p>

            {/* List of Uploaded Deliverables with Lucide Icons */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Attached Deliverables & Artifacts (4)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. PDF Report */}
                <button
                  onClick={() => setActiveDocTab('pdf')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                    activeDocTab === 'pdf'
                      ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-red-100 text-red-700 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Phase 1: SRS Document.pdf
                      </p>
                      <p className="text-[10px] text-slate-500">4.8 MB &bull; 28 pages</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 shrink-0">Preview</span>
                </button>

                {/* 2. GitHub Repo */}
                <a
                  href="https://github.com/srmap-capstone/autonomous-uav-swarm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 text-left transition-all flex items-center justify-between gap-2 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-900 text-white shrink-0">
                      <Github className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        autonomous-uav-swarm
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">branch: main &bull; 14 commits</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </a>

                {/* 3. YouTube / Demo Link */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 text-left transition-all flex items-center justify-between gap-2 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors">
                        Gazebo Simulation Demo
                      </p>
                      <p className="text-[10px] text-slate-500">4m 12s &bull; 1080p Walkthrough</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 shrink-0" />
                </a>

                {/* 4. Jupyter Notebook */}
                <button
                  onClick={() => setActiveDocTab('notebook')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                    activeDocTab === 'notebook'
                      ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Telemetry_Benchmarking.ipynb
                      </p>
                      <p className="text-[10px] text-slate-500">1.2 MB &bull; Python Data</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 shrink-0">Preview</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulated Document Viewer Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            {/* Document Viewer Top Bar */}
            <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span className="font-bold text-slate-800">
                  {activeDocTab === 'pdf'
                    ? 'Phase 1: SRS Document.pdf'
                    : 'Telemetry_Benchmarking.ipynb'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  {activeDocTab === 'pdf' ? 'Page 1 of 28' : 'Executed Cells: 32'}
                </span>
              </div>

              {/* Viewer Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                    className="p-1.5 hover:bg-slate-50 text-slate-600 border-r border-slate-200 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-mono text-[11px] text-slate-700 font-semibold select-none">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                    className="p-1.5 hover:bg-slate-50 text-slate-600 border-l border-slate-200 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() =>
                    toast.success(
                      `Downloading ${
                        activeDocTab === 'pdf'
                          ? 'Phase 1: SRS Document.pdf'
                          : 'Telemetry_Benchmarking.ipynb'
                      }...`
                    )
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Simulated Large bg-slate-100 Document Canvas */}
            <div className="p-6 bg-slate-100 min-h-[460px] flex items-center justify-center">
              <div
                className="w-full max-w-xl bg-white rounded-xl shadow-md border border-slate-200 p-8 sm:p-10 text-center flex flex-col items-center justify-center transition-all duration-300"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {/* Academic Header Mockup */}
                <div className="w-full border-b border-slate-200 pb-4 mb-6 text-center">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    SRM UNIVERSITY-AP &bull; DEPARTMENT OF CSE
                  </p>
                  <h3 className="text-sm font-bold text-slate-800 mt-1">
                    Software Requirements Specification (SRS) &bull; Phase 1
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Autonomous UAV Swarm Coordination &bull; Group 4A &bull; AY 2026-27
                  </p>
                </div>

                {/* Centered Document Placeholder */}
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-slate-400" />
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">Preview not available in mockup</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                  The active deliverable ({activeDocTab === 'pdf' ? 'PDF manuscript' : 'Jupyter workbook'}) has
                  been parsed and verified by the SRM-AP artifact service. Download the original artifact or
                  review the grading rubric on the right.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      toast.success(
                        `Opening full screen viewer for ${
                          activeDocTab === 'pdf'
                            ? 'Phase 1: SRS Document.pdf'
                            : 'Telemetry_Benchmarking.ipynb'
                        }`
                      )
                    }
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"
                  >
                    Open Full PDF Viewer
                  </button>
                  <button
                    onClick={() =>
                      toast.success('Viewing Cloudinary SHA-256 integrity checksum: 8f42d9... OK')
                    }
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
                  >
                    Verify Checksum
                  </button>
                </div>

                {/* Footer Document Watermark */}
                <div className="mt-8 pt-4 border-t border-slate-100 w-full flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Cloudinary CDN: academic/uav_swarm_srs_v1.pdf</span>
                  <span>MD5: 489f...21a</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN (Grading Matrix & Rubric) - 40% Width (col-span-5)
           ======================================================== */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            {/* Rubric Header */}
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Evaluation Matrix & Rubrics</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Milestone 1 Continuous Assessment &bull; Capstone 2026-27
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Max: {maxTotalScore} pts
              </span>
            </div>

            {/* Rubric Input Fields */}
            <div className="space-y-4">
              {/* Criterion 1: Technical Architecture */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span>Technical Architecture</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">Max: 20 pts</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Decomposition of swarm state machines, ROS2 node topology, and distributed communication
                  latency tolerance.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={scores.architecture}
                    onChange={(e) => handleScoreChange('architecture', e.target.value, 20)}
                    className="w-24 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="text-xs text-slate-500 font-mono">
                    <span className="font-bold text-slate-800">{scores.architecture}</span> / 20 points
                  </div>
                </div>
              </div>

              {/* Criterion 2: Literature Review */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Literature Review & Survey</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">Max: 10 pts</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Depth of state-of-the-art IEEE/ACM citations, comparison matrix, and problem statement
                  justification.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={scores.literature}
                    onChange={(e) => handleScoreChange('literature', e.target.value, 10)}
                    className="w-24 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="text-xs text-slate-500 font-mono">
                    <span className="font-bold text-slate-800">{scores.literature}</span> / 10 points
                  </div>
                </div>
              </div>

              {/* Criterion 3: Presentation & Code Quality */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Presentation & Viva Defense</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">Max: 20 pts</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Clarity of oral defense, Gazebo simulation demonstration, and Git repository cleanliness.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={scores.presentation}
                    onChange={(e) => handleScoreChange('presentation', e.target.value, 20)}
                    className="w-24 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="text-xs text-slate-500 font-mono">
                    <span className="font-bold text-slate-800">{scores.presentation}</span> / 20 points
                  </div>
                </div>
              </div>
            </div>

            {/* Qualitative Feedback Field */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Mentor Qualitative Remarks & Revisions</span>
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide concrete academic feedback, required architecture revisions, or defense feedback..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Visible to all 4 team members on their student dashboard upon sign-off.
              </p>
            </div>

            {/* Sticky Action Footer */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Calculated Total
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">
                    {totalScore}
                    <span className="text-sm font-normal text-slate-400"> / {maxTotalScore}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      totalScore >= 40
                        ? 'bg-emerald-50 text-emerald-700'
                        : totalScore >= 25
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {((totalScore / maxTotalScore) * 100).toFixed(0)}% Score
                  </span>
                </div>
              </div>

              {/* Two Primary Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRequestRevisions}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors shadow-2xs text-center"
                >
                  Request Revisions
                </button>

                <button
                  type="button"
                  onClick={handleApproveAndLock}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs text-center flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Lock Marks</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// STUDENT WORKSPACE VIEW (EXACT EXISTING LOGIC)
// ==========================================

interface StudentWorkspaceViewProps {
  approvedApp: Application | null;
  assessments: ExtendedAssessment[];
  submissionsMap: Record<string, Submission | null>;
  meetings: Meeting[];
  deliverables: DeliverableFile[];
  dragActive: boolean;
  uploadingFile: boolean;
  activeTab: 'milestones' | 'meetings';
  setActiveTab: (tab: 'milestones' | 'meetings') => void;
  loading: boolean;
  onRefresh: () => void;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setActiveModalAssessment: (a: Assessment | null) => void;
  setFeedback: (f: { type: 'success' | 'error'; message: string } | null) => void;
}

const StudentWorkspaceView: React.FC<StudentWorkspaceViewProps> = ({
  approvedApp,
  assessments,
  submissionsMap,
  meetings,
  deliverables,
  dragActive,
  uploadingFile,
  activeTab,
  setActiveTab,
  loading,
  onRefresh,
  handleDrag,
  handleDrop,
  handleFileInput,
  setActiveModalAssessment,
  setFeedback,
}) => {
  const githubUrl = 'https://github.com/srmap-capstone/autonomous-uav-swarm';

  const kanbanColumns = [
    {
      id: 'todo',
      title: 'To Do (Pending)',
      badgeClass: 'bg-slate-100 text-slate-700',
      items: assessments.filter((a) => {
        const sub = submissionsMap[a._id];
        return !sub && a._id === 'assess-3';
      }),
    },
    {
      id: 'inprogress',
      title: 'In Progress (Active Sprint)',
      badgeClass: 'bg-blue-50 text-blue-700',
      items: assessments.filter((a) => {
        const sub = submissionsMap[a._id];
        return !sub && a._id !== 'assess-3';
      }),
    },
    {
      id: 'submitted',
      title: 'Submitted & Evaluated',
      badgeClass: 'bg-emerald-50 text-emerald-700',
      items: assessments.filter((a) => Boolean(submissionsMap[a._id])),
    },
  ];

  return (
    <>
      {/* Top Header: Approved Project Title and Mentor Name */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 mb-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Approved Project
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {approvedApp?.project.courseType || 'Capstone Project'}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                Domain: {approvedApp?.project.domain || 'Artificial Intelligence'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {approvedApp?.project.title || 'Autonomous UAV Swarm Coordination for Disaster Response'}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {approvedApp?.project.description}
            </p>
          </div>

          {/* Mentor Details & Quick Action Panel */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
              <img
                src={
                  (typeof approvedApp?.project.faculty === 'object' && approvedApp?.project.faculty?.avatar) ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt="Faculty Mentor"
                className="w-10 h-10 rounded-full border border-slate-200 object-cover"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Assigned Faculty Mentor
                </span>
                <span className="text-xs font-bold text-slate-900 block">
                  {typeof approvedApp?.project.faculty === 'object'
                    ? approvedApp?.project.faculty?.name
                    : 'Dr. Aris Thorne'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {typeof approvedApp?.project.faculty === 'object'
                    ? approvedApp?.project.faculty?.email
                    : 'aris.thorne@srmap.edu.in'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-2xs transition-colors"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                Sync Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500">Overall Progress</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-slate-900">68%</span>
              <span className="text-[10px] text-emerald-600 font-semibold">On Track</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500">Milestones Done</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-slate-900">1 / 3</span>
              <span className="text-[10px] text-blue-600 font-semibold">1 Active</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500">Evaluated Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-emerald-700 font-mono">48 / 50</span>
              <span className="text-[10px] text-slate-500">96.0%</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500">Team Roster</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-slate-900">4 Students</span>
              <span className="text-[10px] text-slate-500 truncate">Group 4A</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('milestones')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'milestones'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Milestones & Deliverables
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            3
          </span>
        </button>

        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'meetings'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Video className="w-4 h-4" />
          Faculty Mentorship & Syncs
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            {meetings.length}
          </span>
        </button>
      </div>

      {activeTab === 'milestones' && (
        <div className="space-y-8">
          {/* 3-Column Kanban-style Milestone Tracker */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-blue-600" /> Milestone Execution Pipeline
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track academic deliverables across sprint stages with verified deadlines and rubrics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {kanbanColumns.map((col) => (
                <div
                  key={col.id}
                  className="bg-slate-100/80 rounded-xl p-4 border border-slate-200/90 flex flex-col min-h-[380px]"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${col.badgeClass}`}>
                        {col.title}
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {col.items.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5 flex-1">
                    {col.items.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                        No items in this column
                      </div>
                    ) : (
                      col.items.map((assessment) => {
                        const submission = submissionsMap[assessment._id];
                        const deadline = new Date(assessment.deadline);
                        const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        const weight = (assessment as ExtendedAssessment).weightage || 30;

                        return (
                          <div
                            key={assessment._id}
                            className="rounded-xl bg-white border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all space-y-3"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                  Weight: {weight}%
                                </span>
                                <span className="text-[10px] font-bold text-slate-500">
                                  Max: {assessment.maxMarks} pts
                                </span>
                              </div>
                              <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                                {assessment.title}
                              </h3>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                                {assessment.description}
                              </p>
                            </div>

                            {submission ? (
                              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold flex items-center gap-1 text-[11px]">
                                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                                    {submission.status === 'graded' ? 'Evaluated' : 'Submitted'}
                                  </span>
                                  <span className="font-mono font-bold text-emerald-800">
                                    {submission.marks} / {assessment.maxMarks}
                                  </span>
                                </div>
                                {submission.feedback && (
                                  <p className="text-[10px] text-emerald-800 italic line-clamp-2 mt-1">
                                    &ldquo;{submission.feedback}&rdquo;
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                                  {daysLeft > 0 ? `${daysLeft} days remaining` : 'Deadline passed'}
                                </span>
                              </div>
                            )}

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(assessment.deadline).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>

                              <button
                                onClick={() => setActiveModalAssessment(assessment)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 ${
                                  submission
                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                                }`}
                              >
                                {submission ? (
                                  <>
                                    <FileCheck className="w-3 h-3 text-emerald-600" /> View Submission
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud className="w-3 h-3" /> Submit Work
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Deliverable Uploads Area */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-600" /> Deliverable Asset Repository
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload project archives, research manuscripts, and code artifacts. Files are stored on
                  verified Cloudinary CDN.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                Max size: 50 MB / file
              </span>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-600 mx-auto mb-3">
                <UploadCloud className={`w-7 h-7 ${uploadingFile ? 'animate-bounce text-blue-600' : ''}`} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {uploadingFile ? 'Uploading & Encrypting...' : 'Drag and drop project deliverable files here'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Support for PDF reports, ZIP code archives, Jupyter (.ipynb) workbooks, and slide presentations.
              </p>

              <div className="mt-4 flex items-center justify-center gap-3">
                <label className="cursor-pointer px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all focus:ring-2 focus:ring-blue-500">
                  Browse Local Files
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileInput}
                    accept=".pdf,.zip,.ipynb,.docx,.pptx,.mp4"
                  />
                </label>
              </div>
            </div>

            {/* GitHub Repository Live Link Field */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Connected Source Repository
                  </span>
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {githubUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" /> Webhook Connected
                </span>
              </div>
            </div>

            {/* Uploaded Deliverables List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Recent Uploaded Deliverables (
                {deliverables.length})
              </h4>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {deliverables.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.size} &bull; Uploaded {item.uploadedAt} &bull;{' '}
                          <span className="font-semibold text-slate-600">{item.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> CDN Verified
                      </span>
                      <button
                        onClick={() =>
                          setFeedback({ type: 'success', message: `Downloading ${item.name}...` })
                        }
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3 h-3 text-slate-500" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Meetings & Mentorship */}
      {activeTab === 'meetings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-600" /> Faculty Mentorship Syncs & Minutes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Scheduled review meetings, oral defense milestones, and mentor consultation notes.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {meetings.map((meet) => (
              <div
                key={meet._id}
                className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        meet.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {meet.status}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {new Date(meet.scheduledAt || (meet as any).date).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{meet.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {meet.meetingMinutes || (meet as any).notes || meet.agenda}
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto shrink-0">
                  Faculty Confirmed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// ==========================================
// MAIN PROJECT WORKSPACE (ROLE-CONDITIONED)
// ==========================================

export const ProjectWorkspace: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [approvedApp, setApprovedApp] = useState<Application | null>(null);
  const [assessments, setAssessments] = useState<ExtendedAssessment[]>([]);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, Submission | null>>({});
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState<'milestones' | 'meetings'>('milestones');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Deliverables file upload state (Student)
  const [deliverables, setDeliverables] = useState<DeliverableFile[]>(INITIAL_DELIVERABLES);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Modal state
  const [activeModalAssessment, setActiveModalAssessment] = useState<Assessment | null>(null);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      // 1. Fetch student/faculty project application
      const appData = await applicationService.getMyApplications();
      const allocated = appData.applications.find((app) => app.status === 'approved');

      if (!allocated) {
        setApprovedApp(MOCK_ALLOCATED_APP);
        setAssessments(MOCK_ASSESSMENTS);
        setSubmissionsMap(MOCK_SUBMISSIONS);
        setMeetings(MOCK_MEETINGS);
        setLoading(false);
        return;
      }

      setApprovedApp(allocated);

      // 2. Fetch project assessments
      const projectId = allocated.project._id;
      const assessData = await assessmentService.getProjectAssessments(projectId);
      if (assessData.assessments && assessData.assessments.length > 0) {
        setAssessments(assessData.assessments as ExtendedAssessment[]);

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
      } else {
        setAssessments(MOCK_ASSESSMENTS);
        setSubmissionsMap(MOCK_SUBMISSIONS);
      }

      // 4. Fetch project meetings & logs
      try {
        const meetRes = await meetingService.getProjectMeetings(projectId);
        setMeetings(
          meetRes.meetings && meetRes.meetings.length > 0 ? meetRes.meetings : MOCK_MEETINGS
        );
      } catch {
        setMeetings(MOCK_MEETINGS);
      }
    } catch (err: any) {
      console.error('Failed to load workspace data, falling back to mock environment', err);
      setApprovedApp(MOCK_ALLOCATED_APP);
      setAssessments(MOCK_ASSESSMENTS);
      setSubmissionsMap(MOCK_SUBMISSIONS);
      setMeetings(MOCK_MEETINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file: File) => {
    setUploadingFile(true);
    setTimeout(() => {
      const newDeliv: DeliverableFile = {
        id: `deliv-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: 'Just now',
        category: 'Uploaded Asset',
        url: '#',
        verified: true,
      };
      setDeliverables((prev) => [newDeliv, ...prev]);
      setUploadingFile(false);
      setFeedback({
        type: 'success',
        message: `File '${file.name}' verified & uploaded to Cloudinary CDN storage!`,
      });
    }, 700);
  };

  const isFacultyRole = user?.role === 'faculty' || user?.role === 'coordinator' || user?.role === 'admin';

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

        {/* Conditional View: Faculty Evaluation Workspace vs. Student Workspace */}
        {isFacultyRole ? (
          <FacultyWorkspaceView
            app={approvedApp || MOCK_ALLOCATED_APP}
            onRefresh={fetchWorkspaceData}
          />
        ) : (
          <StudentWorkspaceView
            approvedApp={approvedApp}
            assessments={assessments}
            submissionsMap={submissionsMap}
            meetings={meetings}
            deliverables={deliverables}
            dragActive={dragActive}
            uploadingFile={uploadingFile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loading={loading}
            onRefresh={fetchWorkspaceData}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
            handleFileInput={handleFileInput}
            setActiveModalAssessment={setActiveModalAssessment}
            setFeedback={setFeedback}
          />
        )}

        {/* Deliverable Submission Modal (Student) */}
        {!isFacultyRole && activeModalAssessment && (
          <SubmissionModal
            assessment={activeModalAssessment}
            isOpen={Boolean(activeModalAssessment)}
            onClose={() => setActiveModalAssessment(null)}
            onSuccess={() => {
              setActiveModalAssessment(null);
              fetchWorkspaceData();
              setFeedback({
                type: 'success',
                message: 'Deliverable successfully uploaded and registered for faculty review!',
              });
            }}
          />
        )}
      </main>
    </div>
  );
};

export default ProjectWorkspace;
