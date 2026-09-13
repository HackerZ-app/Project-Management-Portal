import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { Assessment } from '../models/assessment.model';
import { Project } from '../models/project.model';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

/**
 * Create a new assessment for a project
 * POST /api/assessments
 */
export const createAssessment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, projectId, deadline, maxMarks } = req.body;
    const userId = req.user?._id;

    if (!title || !description || !projectId || !deadline) {
      throw new AppError('Title, description, projectId, and deadline are required', 400);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Associated project not found', 404);
    }

    // Authorization: Only the assigned faculty mentor, coordinator, or admin can create assessments
    if (
      !project.faculty.equals(userId) &&
      req.user?.role !== 'coordinator' &&
      req.user?.role !== 'admin'
    ) {
      throw new AppError(
        'Forbidden: Only the assigned faculty mentor or administrators can create assessments for this project',
        403
      );
    }

    // Validate deadline is in the future
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      throw new AppError('Invalid date format for assessment deadline', 400);
    }

    // Allow a small grace window of 1 minute in case of network transit latency
    if (parsedDeadline.getTime() < Date.now() - 60000) {
      throw new AppError('Assessment deadline must be set to a future date and time', 400);
    }

    const parsedMarks = maxMarks ? Number(maxMarks) : 100;
    if (isNaN(parsedMarks) || parsedMarks <= 0) {
      throw new AppError('Maximum marks must be a positive number', 400);
    }

    const assessment = await Assessment.create({
      title: title.trim(),
      description: description.trim(),
      project: project._id,
      faculty: userId,
      deadline: parsedDeadline,
      maxMarks: parsedMarks,
    });

    logger.info(
      `[Assessment Created] "${assessment.title}" for Project: "${project.title}" by Faculty: ${req.user?.email}`
    );

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all assessments for a specific project
 * GET /api/assessments/project/:projectId
 */
export const getProjectAssessments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const assessments = await Assessment.find({ project: projectId })
      .populate('faculty', 'name email avatar')
      .sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      count: assessments.length,
      assessments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch single assessment details by ID
 * GET /api/assessments/:id
 */
export const getAssessmentById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id)
      .populate('faculty', 'name email avatar')
      .populate('project', 'title domain courseType status');

    if (!assessment) {
      throw new AppError('Assessment not found', 404);
    }

    res.status(200).json({
      success: true,
      assessment,
    });
  } catch (error) {
    next(error);
  }
};
