import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { Submission, GITHUB_REPO_REGEX } from '../models/submission.model';
import { Assessment } from '../models/assessment.model';
import { Project } from '../models/project.model';
import { Group } from '../models/group.model';
import { notificationService } from '../services/notification.service';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

/**
 * Submit work for an assessment (multipart/form-data)
 * POST /api/submissions
 */
export const submitWork = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { assessmentId, githubUrl } = req.body;
    const studentId = req.user?._id;

    if (!assessmentId) {
      throw new AppError('Assessment ID is required', 400);
    }

    if (!githubUrl || !githubUrl.trim()) {
      throw new AppError('GitHub repository URL is required', 400);
    }

    // Strict GitHub URL regex validation (Safeguard 2)
    if (!GITHUB_REPO_REGEX.test(githubUrl.trim())) {
      throw new AppError(
        'Invalid GitHub repository URL. Must be in format https://github.com/owner/repository',
        400
      );
    }

    // Validate uploaded file from Multer
    if (!req.file) {
      throw new AppError('Submission file (.pdf, .docx, or .zip up to 10MB) is required', 400);
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      throw new AppError('Assessment not found', 404);
    }

    const project = await Project.findById(assessment.project);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Guardrail: Verify student belongs to an allocated group or was approved solo
    const isSoloAllocated = project.allocatedGroups.some((id) => id.equals(studentId));

    let allocatedGroup = null;
    if (!isSoloAllocated) {
      allocatedGroup = await Group.findOne({
        _id: { $in: project.allocatedGroups },
        $or: [{ leader: studentId }, { members: studentId }],
      });
    }

    if (!isSoloAllocated && !allocatedGroup) {
      throw new AppError(
        'Forbidden: You are not allocated to this project and cannot submit work.',
        403
      );
    }

    // Guardrail: Prevent duplicate submissions for the same assessment
    const duplicateQuery = allocatedGroup
      ? { assessment: assessment._id, group: allocatedGroup._id }
      : { assessment: assessment._id, submittedBy: studentId, group: null };

    const existingSubmission = await Submission.findOne(duplicateQuery);
    if (existingSubmission) {
      throw new AppError(
        'Duplicate Submission: Your group or account has already submitted work for this assessment.',
        400
      );
    }

    // Automatic Lateness Tracking
    const now = new Date();
    const isLate = now.getTime() > new Date(assessment.deadline).getTime();
    const status = isLate ? 'late' : 'submitted';

    // File URL and Cloudinary Public ID
    const fileUrl = req.file.path;
    const cloudinaryPublicId =
      (req.file as any).filename || req.file.filename || req.file.originalname;

    const submission = await Submission.create({
      assessment: assessment._id,
      submittedBy: studentId,
      group: allocatedGroup ? allocatedGroup._id : null,
      githubUrl: githubUrl.trim(),
      fileUrl,
      cloudinaryPublicId,
      status,
    });

    logger.info(
      `[Work Submitted] Assessment: "${assessment.title}" by ${req.user?.email} (Status: ${status}, PublicId: ${cloudinaryPublicId})`
    );

    res.status(201).json({
      success: true,
      message: isLate
        ? 'Work submitted past deadline (marked as Late).'
        : 'Work submitted successfully!',
      submission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all submissions for an assessment (Faculty grading view)
 * GET /api/submissions/assessment/:assessmentId
 */
export const getAssessmentSubmissions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      throw new AppError('Assessment not found', 404);
    }

    // Verify requesting faculty is assigned mentor or coordinator/admin
    if (
      !assessment.faculty.equals(req.user?._id) &&
      req.user?.role !== 'coordinator' &&
      req.user?.role !== 'admin'
    ) {
      throw new AppError(
        'Forbidden: Only the project faculty mentor can view candidate submissions.',
        403
      );
    }

    const submissions = await Submission.find({ assessment: assessmentId })
      .populate('submittedBy', 'name email rollNumber department avatar')
      .populate({
        path: 'group',
        populate: { path: 'members', select: 'name email rollNumber department avatar' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch student's own submission for an assessment
 * GET /api/submissions/assessment/:assessmentId/me
 */
export const getMySubmission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { assessmentId } = req.params;
    const studentId = req.user?._id;

    // Check if user belongs to any group
    const userGroups = await Group.find({
      $or: [{ leader: studentId }, { members: studentId }],
    }).select('_id');
    const groupIds = userGroups.map((g) => g._id);

    const submission = await Submission.findOne({
      assessment: assessmentId,
      $or: [{ submittedBy: studentId }, { group: { $in: groupIds } }],
    })
      .populate('submittedBy', 'name email rollNumber')
      .populate('group', 'name members');

    res.status(200).json({
      success: true,
      submission: submission || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Grade or re-evaluate a submission (Faculty only)
 * PUT /api/submissions/:id/grade
 */
export const gradeSubmission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;
    const facultyId = req.user?._id;

    if (marks === undefined || marks === null || isNaN(Number(marks))) {
      throw new AppError('Marks must be a valid number', 400);
    }

    const numericMarks = Number(marks);

    const submission = await Submission.findById(id);
    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    const assessment = await Assessment.findById(submission.assessment);
    if (!assessment) {
      throw new AppError('Associated assessment not found', 404);
    }

    // Guardrail: Verify requesting faculty is assigned mentor or coordinator/admin
    if (
      !assessment.faculty.equals(facultyId) &&
      req.user?.role !== 'coordinator' &&
      req.user?.role !== 'admin'
    ) {
      throw new AppError(
        'Forbidden: Only the project faculty mentor can grade candidate submissions.',
        403
      );
    }

    // Guardrail: Strict marks boundaries [0, assessment.maxMarks]
    if (numericMarks < 0 || numericMarks > assessment.maxMarks) {
      throw new AppError(
        `Invalid marks. Must be between 0 and ${assessment.maxMarks} (Received: ${numericMarks})`,
        400
      );
    }

    // Refinement 3: Idempotent Grading & Re-Evaluations
    const wasAlreadyGraded = submission.status === 'graded';
    submission.marks = numericMarks;
    if (feedback !== undefined) {
      submission.feedback = feedback.trim();
    }
    submission.status = 'graded';
    await submission.save();

    // Determine notification message based on whether this is an initial evaluation or a re-evaluation
    const eventTitle = wasAlreadyGraded ? 'Grade Updated' : 'Grade Published';
    const notifMessage = `${eventTitle}: "${assessment.title}" - Marks: ${numericMarks}/${assessment.maxMarks}`;

    // Refinement 2: Notification Fan-Out Logic
    // Must fan out to the leader and ALL members of that specific allocated group, or solo student
    if (submission.group) {
      await notificationService.fanOutGroupNotification({
        groupId: submission.group,
        message: notifMessage,
        type: 'grading',
        link: `/workspace/${assessment.project}`,
      });
    } else {
      // Solo student submission
      await notificationService.createNotification({
        userId: submission.submittedBy,
        message: notifMessage,
        type: 'grading',
        link: `/workspace/${assessment.project}`,
      });
    }

    logger.info(
      `[Submission Graded] "${assessment.title}" awarded ${numericMarks}/${assessment.maxMarks} (Re-evaluation: ${wasAlreadyGraded})`
    );

    res.status(200).json({
      success: true,
      message: wasAlreadyGraded ? 'Grade updated successfully' : 'Submission graded successfully',
      isReEvaluation: wasAlreadyGraded,
      submission,
    });
  } catch (error) {
    next(error);
  }
};

