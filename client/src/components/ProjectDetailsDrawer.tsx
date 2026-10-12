import React from 'react';
import { Project } from '../types/project.types';
import { Drawer } from './Drawer';
import {
  Calendar,
  Users,
  Send,
  BookOpen,
  FileText,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Layers,
  Award,
} from 'lucide-react';

interface ProjectDetailsDrawerProps {
  project: (Project & { techStack?: string[]; milestones?: { title: string; deadline: string; description: string; weightage: string }[] }) | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (project: Project) => void;
  userRole?: string;
}

export const ProjectDetailsDrawer: React.FC<ProjectDetailsDrawerProps> = ({
  project,
  isOpen,
  onClose,
  onApply,
  userRole,
}) => {
  if (!project) return null;

  const faculty =
    typeof project.faculty === 'object' && project.faculty !== null
      ? project.faculty
      : null;

  const deadlineDate = new Date(project.deadline);
  const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const availableSlots = Math.max(0, project.maxStudents - (project.currentStudents || 0));
  const occupancyPercentage = Math.round(((project.currentStudents || 0) / project.maxStudents) * 100);

  // Default tech stack fallback
  const techStack: string[] = project.techStack && project.techStack.length > 0
    ? project.techStack
    : ['Python 3.11', 'PyTorch', 'FastAPI', 'Docker', 'PostgreSQL'];

  // Default milestones fallback
  const milestones = project.milestones && project.milestones.length > 0
    ? project.milestones
    : [
        {
          title: 'Milestone 1: Problem Definition & Literature Review',
          deadline: 'Week 4',
          description: 'Comprehensive state-of-the-art survey, system architecture spec, and requirements sign-off.',
          weightage: '20%',
        },
        {
          title: 'Milestone 2: Core Algorithm / Prototype Implementation',
          deadline: 'Week 8',
          description: 'Working MVP, test bench verification, preliminary benchmarks, and interim report.',
          weightage: '40%',
        },
        {
          title: 'Milestone 3: Final Defense, Evaluation & Manuscript',
          deadline: 'Week 14',
          description: 'Complete deployment, formal faculty review panel defense, and IEEE format research paper draft.',
          weightage: '40%',
        },
      ];

  const badges = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
        {project.domain}
      </span>
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
        {project.courseType}
      </span>
      <span
        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
          project.status === 'allocated'
            ? 'bg-purple-50 text-purple-800'
            : project.status === 'draft'
            ? 'bg-amber-50 text-amber-800'
            : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        {project.status === 'allocated' ? 'Allocated' : project.status === 'draft' ? 'Draft' : 'Accepting Applications'}
      </span>
    </div>
  );

  const footer = (
    <>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Users className="w-4 h-4 text-slate-400" />
        <span>
          <strong className="text-slate-900 font-semibold">{availableSlots}</strong> of{' '}
          <strong className="text-slate-900 font-semibold">{project.maxStudents}</strong> seats open
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200 transition-colors"
        >
          Close
        </button>

        {userRole === 'student' && project.status === 'published' && availableSlots > 0 ? (
          <button
            onClick={() => onApply(project)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <Send className="w-3.5 h-3.5" />
            Apply for Project
          </button>
        ) : userRole === 'student' && availableSlots === 0 ? (
          <span className="text-[11px] font-medium text-slate-600 px-2.5 py-1 rounded-full bg-slate-100">
            Capacity Filled
          </span>
        ) : null}
      </div>
    </>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={project.title}
      subtitle={`Project ID: ${project._id}`}
      badge={badges}
      footer={footer}
      maxWidth="max-w-2xl"
    >
      {/* Capacity & Timeline Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" /> Cohort Capacity
          </span>
          <div className="mt-2">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-base font-bold text-slate-900">
                {project.currentStudents || 0} / {project.maxStudents}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {availableSlots} Available
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600" /> Deadline
          </span>
          <div className="mt-2">
            <span className="text-base font-bold text-slate-900 block">
              {daysLeft > 0 ? `${daysLeft} Days Left` : 'Applications Closed'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block truncate">
              {deadlineDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-600" /> Academic Credit
          </span>
          <div className="mt-2">
            <span className="text-base font-bold text-slate-900 block">4.0 Credits</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Letter Graded</span>
          </div>
        </div>
      </div>

      {/* Faculty Advisor Section */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {faculty?.avatar ? (
            <img
              src={faculty.avatar}
              alt={faculty.name}
              className="w-12 h-12 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base">
              {faculty?.name?.charAt(0) || <UserIcon className="w-6 h-6" />}
            </div>
          )}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Faculty Mentor / Principal Investigator
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              {faculty?.name || 'Dr. Faculty Guide'}
            </h3>
            <p className="text-xs text-slate-500">
              {faculty?.department || 'Department of Computer Science & Engineering'} &bull;{' '}
              <span className="font-mono text-slate-600">{faculty?.email || 'mentor@srmap.edu.in'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Technical Stack Pills */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" /> Recommended Technology Stack
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Problem Statement & Methodology */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-600" /> Problem Scope & Methodology
        </h4>
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-3">
          <p className="whitespace-pre-wrap">{project.description}</p>
        </div>
      </div>

      {/* Prerequisites & Required Skills */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Prerequisites & Eligibility Criteria
        </h4>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {project.requirements || 'Proficiency in data structures, systems architecture, and core domain foundations.'}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Minimum cumulative GPA of 7.0 / 10.0 with no active academic integrity violations.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Team size: 1 to 4 members. Locked group roster required for multi-student applications.</span>
          </div>
        </div>
      </div>

      {/* Milestone Deliverables Schedule */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-600" /> Milestone Roadmap & Deliverables
        </h4>
        <div className="space-y-2.5">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-semibold font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{m.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {m.deadline}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {m.weightage}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 pl-7 leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default ProjectDetailsDrawer;
