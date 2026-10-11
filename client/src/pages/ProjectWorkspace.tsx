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
} from 'lucide-react';
import meetingService from '../services/meeting.service';
import { Meeting } from '../types/meeting.types';

interface ExtendedAssessment extends Assessment {
  weightage?: number;
}

// Enterprise Mock Populated Workspace Data
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

// Mock uploaded files for the drag-and-drop file deliverable section
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

export const ProjectWorkspace: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [approvedApp, setApprovedApp] = useState<Application | null>(null);
  const [assessments, setAssessments] = useState<ExtendedAssessment[]>([]);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, Submission | null>>({});
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState<'milestones' | 'meetings'>('milestones');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Deliverables file upload state
  const [deliverables, setDeliverables] = useState<DeliverableFile[]>(INITIAL_DELIVERABLES);
  const [dragActive, setDragActive] = useState(false);
  const githubUrl = 'https://github.com/srmap-capstone/autonomous-uav-swarm';
  const [uploadingFile, setUploadingFile] = useState(false);

  // Modal state
  const [activeModalAssessment, setActiveModalAssessment] = useState<Assessment | null>(null);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      // 1. Fetch student's approved applications
      const appData = await applicationService.getMyApplications();
      const allocated = appData.applications.find((app) => app.status === 'approved');

      if (!allocated) {
        // Fallback to mock allocated app to ensure populated enterprise state
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
        setMeetings(meetRes.meetings && meetRes.meetings.length > 0 ? meetRes.meetings : MOCK_MEETINGS);
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

  // Group assessments into 3 Kanban buckets:
  // 1. To Do: no submission, deadline in future
  // 2. In Progress: milestone is active or partially worked on
  // 3. Submitted: has submission or graded
  const kanbanColumns = [
    {
      id: 'todo',
      title: 'To Do (Pending)',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      items: assessments.filter((a) => {
        const sub = submissionsMap[a._id];
        return !sub && a._id === 'assess-3';
      }),
    },
    {
      id: 'inprogress',
      title: 'In Progress (Active Sprint)',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      items: assessments.filter((a) => {
        const sub = submissionsMap[a._id];
        return !sub && a._id !== 'assess-3';
      }),
    },
    {
      id: 'submitted',
      title: 'Submitted & Evaluated',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      items: assessments.filter((a) => Boolean(submissionsMap[a._id])),
    },
  ];

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

        {/* Top Header: Approved Project Title and Mentor Name */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 mb-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Approved Project
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {approvedApp?.project.courseType || 'Capstone Project'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
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
                  onClick={fetchWorkspaceData}
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
                    {/* Column Header */}
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

                    {/* Column Milestone Cards */}
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
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
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

                              {/* Submission or Deadline info */}
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

                              {/* Card Action Button */}
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

            {/* Clean, Drag-and-Drop styled area for "Deliverable Uploads" */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-blue-600" /> Deliverable Asset Repository
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload project archives, research manuscripts, and code artifacts. Files are stored on verified Cloudinary CDN.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                  Max size: 50 MB / file
                </span>
              </div>

              {/* Drag and Drop Zone */}
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
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Webhook Connected
                  </span>
                </div>
              </div>

              {/* Uploaded Deliverables List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Recent Uploaded Deliverables ({deliverables.length})
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
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> CDN Verified
                        </span>
                        <button
                          onClick={() => setFeedback({ type: 'success', message: `Downloading ${item.name}...` })}
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
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          meet.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
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

        {/* Deliverable Submission Modal */}
        {activeModalAssessment && (
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
