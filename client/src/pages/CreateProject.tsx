import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '../components/Navbar';
import projectService from '../services/project.service';
import { Alert } from '../components/Alert';
import { CourseType } from '../types/project.types';
import {
  FolderPlus,
  Save,
  Send,
  ArrowLeft,
} from 'lucide-react';

// Zod validation schema with conditional enforcement based on status
const projectSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Project title must be at least 5 characters')
      .max(200, 'Title cannot exceed 200 characters'),
    description: z.string().optional(),
    domain: z.string().min(1, 'Domain is required'),
    courseType: z.enum([
      'Capstone Project',
      'Mini Project',
      'Industrial Project',
      'Research Project',
    ] as const),
    requirements: z.string().optional(),
    maxStudents: z
      .number()
      .min(1, 'Minimum capacity is 1 student')
      .max(5, 'Maximum capacity is 5 students'),
    deadline: z.string().optional(),
    status: z.enum(['draft', 'published']),
  })
  .superRefine((data, ctx) => {
    // Only enforce strict requirements when publishing
    if (data.status === 'published') {
      if (!data.description || data.description.trim().length < 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Project description must be at least 20 characters to publish',
          path: ['description'],
        });
      }
      if (!data.deadline || data.deadline.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Application deadline is required to publish',
          path: ['deadline'],
        });
      } else {
        const selectedDate = new Date(data.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Application deadline cannot be in the past',
            path: ['deadline'],
          });
        }
      }
    }
  });

type ProjectFormValues = z.infer<typeof projectSchema>;

export const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      domain: 'Artificial Intelligence',
      courseType: 'Capstone Project',
      requirements: '',
      maxStudents: 3,
      deadline: '',
      status: 'published',
    },
  });

  const onSubmit = async (values: ProjectFormValues) => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await projectService.createProject({
        title: values.title,
        description: values.description,
        domain: values.domain,
        courseType: values.courseType as CourseType,
        requirements: values.requirements,
        maxStudents: values.maxStudents,
        deadline: values.deadline,
        status: values.status,
      });

      if (response.success) {
        setFeedback({
          type: 'success',
          message:
            values.status === 'draft'
              ? 'Project saved as draft successfully!'
              : 'Project published successfully to academic catalog!',
        });
        setTimeout(() => {
          navigate('/projects');
        }, 1200);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create project.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </button>
          <span className="text-xs text-slate-500">Faculty Proposal Workspace</span>
        </div>

        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel gradient-border mb-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-glow">
              <FolderPlus className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Propose Academic Project
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Create research, capstone, or mini-project offerings for university student teams.
              </p>
            </div>
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

        {/* Project Proposal Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <form className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Project Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Distributed Consensus Engine for Autonomous Drone Fleets"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* Course Type & Domain */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Course Project Category <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('courseType')}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Capstone Project">Capstone Project (Final Year)</option>
                  <option value="Mini Project">Mini Project (Pre-Final Year)</option>
                  <option value="Industrial Project">Industrial Project</option>
                  <option value="Research Project">Faculty Research Project</option>
                </select>
                {errors.courseType && (
                  <p className="mt-1 text-xs text-red-400">{errors.courseType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Technical Domain <span className="text-red-400">*</span>
                </label>
                <select
                  {...register('domain')}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Artificial Intelligence">Artificial Intelligence & Deep Learning</option>
                  <option value="Machine Learning">Machine Learning & Data Mining</option>
                  <option value="Cybersecurity">Cybersecurity & Cryptography</option>
                  <option value="Cloud & Distributed Systems">Cloud & Distributed Computing</option>
                  <option value="IoT & Embedded Systems">IoT & Embedded Robotics</option>
                  <option value="Blockchain & Web3">Blockchain & Web3</option>
                  <option value="Web & Full Stack">Modern Web & Mobile Architectures</option>
                  <option value="Bioinformatics">Bioinformatics & Healthcare Analytics</option>
                </select>
                {errors.domain && (
                  <p className="mt-1 text-xs text-red-400">{errors.domain.message}</p>
                )}
              </div>
            </div>

            {/* Student Capacity & Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Team Capacity (1 - 5 students) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  {...register('maxStudents', { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
                {errors.maxStudents && (
                  <p className="mt-1 text-xs text-red-400">{errors.maxStudents.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Application Deadline
                </label>
                <input
                  type="date"
                  {...register('deadline')}
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
                {errors.deadline && (
                  <p className="mt-1 text-xs text-red-400">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            {/* Technical Prerequisites & Requirements */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Technical Stack & Prerequisites
              </label>
              <input
                type="text"
                {...register('requirements')}
                placeholder="e.g. Python, PyTorch, C++, Familiarity with ROS2 and Linux"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {errors.requirements && (
                <p className="mt-1 text-xs text-red-400">{errors.requirements.message}</p>
              )}
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Project Scope & Deliverables
              </label>
              <textarea
                rows={6}
                {...register('description')}
                placeholder="Detail the research problem, methodology, anticipated milestones, and expected outcome..."
                className="w-full px-4 py-3 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Action Buttons: Save as Draft vs Publish */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setValue('status', 'draft');
                  handleSubmit(onSubmit)();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-amber-400" />
                Save as Draft
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setValue('status', 'published');
                  handleSubmit(onSubmit)();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Publishing...' : 'Publish Project'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
