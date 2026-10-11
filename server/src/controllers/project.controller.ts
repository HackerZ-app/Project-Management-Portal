import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { Project, IProject } from '../models/project.model';
import { Assessment } from '../models/assessment.model';
import { Submission } from '../models/submission.model';
import { Group } from '../models/group.model';
import { notificationService } from '../services/notification.service';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

/**
 * Propose/Create a new project
 * POST /api/projects
 * Restricted to: faculty, coordinator, admin
 * Supports partial saves if status === 'draft'
 */
export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      domain,
      courseType,
      requirements,
      maxStudents,
      deadline,
      status = 'published',
    } = req.body;

    if (!title || !title.trim()) {
      throw new AppError('Project title is required', 400);
    }

    // Strict validation only when publishing
    if (status === 'published') {
      if (!description || !description.trim()) {
        throw new AppError('Project description is required to publish', 400);
      }
      if (!deadline) {
        throw new AppError('Application deadline is required to publish', 400);
      }
    }

    const project = await Project.create({
      title: title.trim(),
      description: description?.trim() || 'Draft project proposal in preparation.',
      domain: domain?.trim() || 'Artificial Intelligence',
      courseType: courseType || 'Capstone Project',
      faculty: req.user?._id,
      requirements: requirements?.trim() || 'Standard prerequisites apply.',
      maxStudents: maxStudents ? Number(maxStudents) : 3,
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: status === 'draft' ? 'draft' : 'published',
    });

    logger.info(
      `[Project Created] "${project.title}" by Faculty: ${req.user?.email} (Status: ${project.status})`
    );

    res.status(201).json({
      success: true,
      message: status === 'draft' ? 'Project draft saved successfully' : 'Project published successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Browse published academic projects
 * GET /api/projects
 * Supports: $text search, domain, courseType, pagination
 */
export const getProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt((req.query.limit as string) || '9', 10)));
    const skip = (page - 1) * limit;

    const { search, domain, courseType, status } = req.query;

    const query: any = {};

    // By default, general catalog only displays published projects unless specified by faculty
    query.status = status || 'published';

    if (domain && domain !== 'all') {
      query.domain = domain;
    }

    if (courseType && courseType !== 'all') {
      query.courseType = courseType;
    }

    // Scalable Text Search
    if (search && typeof search === 'string' && search.trim() !== '') {
      query.$text = { $search: search.trim() };
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('faculty', 'name email avatar department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get projects created by the authenticated faculty member
 * GET /api/projects/faculty/me
 */
export const getFacultyProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projects = await Project.find({ faculty: req.user?._id })
      .populate('faculty', 'name email avatar department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single project details by ID
 * GET /api/projects/:id
 */
export const getProjectById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'faculty',
      'name email avatar department'
    );

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Coordinator Grade Release Workflow (Module 16)
 * PUT /api/projects/:projectId/release-grades
 * Strictly restricted to coordinator and admin roles.
 * Includes "Missing Submission" deadlock resolution with auto-zero fallback.
 */
export const releaseProjectGrades = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;

    // RBAC Guardrail: Strictly restrict to coordinator and admin roles
    if (req.user?.role !== 'coordinator' && req.user?.role !== 'admin') {
      throw new AppError('Forbidden: Only a Coordinator or Admin can release final grades.', 403);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const assessments = await Assessment.find({ project: project._id });

    // Edge Case Patch: "Missing Submission" Deadlock Resolution
    // If a student or team never submitted for a past-due assessment, auto-zero fallback applies
    const now = new Date().getTime();
    for (const assessment of assessments) {
      const isPastDue = now > new Date(assessment.deadline).getTime();
      if (!isPastDue) continue;

      if (project.allocatedGroups && project.allocatedGroups.length > 0) {
        for (const allocatedId of project.allocatedGroups) {
          const group = await Group.findById(allocatedId);
          const subQuery = group
            ? { assessment: assessment._id, group: group._id }
            : { assessment: assessment._id, submittedBy: allocatedId, group: null };

          const existingSub = await Submission.findOne(subQuery);
          if (!existingSub) {
            const submitterId = group ? (group.leader || group.members[0]) : allocatedId;
            await Submission.create({
              assessment: assessment._id,
              submittedBy: submitterId,
              group: group ? group._id : null,
              githubUrl: 'https://github.com/academic-portal/missing-submission',
              fileUrl: 'https://res.cloudinary.com/academic-portal/raw/upload/missing_submission.pdf',
              cloudinaryPublicId: 'missing_submission_placeholder',
              status: 'graded',
              marks: 0,
              feedback: 'Auto-evaluated 0: Deliverable not submitted prior to deadline.',
            });
            logger.info(
              `[Auto-Zero Applied] Missing deliverable for "${assessment.title}" auto-evaluated with 0 marks.`
            );
          }
        }
      }
    }

    // Verify all submissions for project assessments are evaluated
    if (assessments.length > 0) {
      const pendingSubmissions = await Submission.find({
        assessment: { $in: assessments.map((a) => a._id) },
        status: { $ne: 'graded' },
      });

      if (pendingSubmissions.length > 0) {
        throw new AppError(
          `Cannot release grades: ${pendingSubmissions.length} submission(s) are still pending evaluation by faculty mentor.`,
          400
        );
      }
    }

    // Action: Update project status to 'closed'
    project.status = 'closed';
    await project.save();

    // Fan out "Final Grades Released" notification to all allocated students
    await notificationService.fanOutProjectNotification({
      projectId: project._id,
      message: `Final Grades Released: Final grades for "${project.title}" have been officially released by the Academic Coordinator.`,
      type: 'grading',
      link: `/workspace`,
    });

    logger.info(
      `[Final Grades Released] Project "${project.title}" closed by Coordinator: ${req.user?.email}`
    );

    res.status(200).json({
      success: true,
      message: 'Final grades released and project closed successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};
