import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { Meeting, VALID_MEETING_URL_REGEX } from '../models/meeting.model';
import { Project } from '../models/project.model';
import { notificationService } from '../services/notification.service';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

/**
 * Generate a random mock Google Meet link
 */
const generateMockGoogleMeetLink = (): string => {
  const p1 = Math.random().toString(36).substring(2, 5);
  const p2 = Math.random().toString(36).substring(2, 6);
  const p3 = Math.random().toString(36).substring(2, 5);
  return `https://meet.google.com/${p1}-${p2}-${p3}`;
};

/**
 * Schedule a new meeting for a project (Faculty only)
 * POST /api/meetings
 */
export const scheduleMeeting = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, title, agenda, scheduledAt, meetingLink } = req.body;
    const facultyId = req.user?._id;

    if (!projectId) throw new AppError('Project ID is required', 400);
    if (!title || !title.trim()) throw new AppError('Meeting title is required', 400);
    if (!agenda || !agenda.trim()) throw new AppError('Meeting agenda is required', 400);
    if (!scheduledAt) throw new AppError('Meeting schedule date and time is required', 400);

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Verify requesting faculty is assigned mentor or coordinator/admin
    if (
      !project.faculty.equals(facultyId) &&
      req.user?.role !== 'coordinator' &&
      req.user?.role !== 'admin'
    ) {
      throw new AppError(
        'Forbidden: Only the project faculty mentor can schedule meetings.',
        403
      );
    }

    // Enforce video conferencing domain regex when custom link provided
    if (meetingLink && meetingLink.trim()) {
      if (!VALID_MEETING_URL_REGEX.test(meetingLink.trim())) {
        throw new AppError(
          'Invalid meeting link. Only secure Google Meet, Zoom, or Microsoft Teams URLs are allowed.',
          400
        );
      }
    }

    // Auto-generate Google Meet link if empty or omitted
    const effectiveLink =
      meetingLink && meetingLink.trim() ? meetingLink.trim() : generateMockGoogleMeetLink();

    const meeting = await Meeting.create({
      project: projectId,
      faculty: facultyId,
      title: title.trim(),
      agenda: agenda.trim(),
      scheduledAt: new Date(scheduledAt),
      meetingLink: effectiveLink,
      status: 'scheduled',
      meetingMinutes: '',
    });

    // Fan out notification to all students allocated to this project
    const dateStr = new Date(scheduledAt).toLocaleString();
    await notificationService.fanOutProjectNotification({
      projectId,
      message: `Meeting scheduled: "${title.trim()}" on ${dateStr}`,
      type: 'meeting',
      link: `/workspace/${projectId}`,
    });

    logger.info(`[Meeting Scheduled] "${meeting.title}" on ${meeting.scheduledAt} by faculty ${req.user?.email}`);

    res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      meeting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all meetings for a specific project
 * GET /api/meetings/project/:projectId
 */
export const getProjectMeetings = async (
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

    const meetings = await Meeting.find({ project: projectId })
      .populate('faculty', 'name email department avatar')
      .sort({ scheduledAt: -1 });

    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all meetings assigned to the logged-in faculty
 * GET /api/meetings/faculty
 */
export const getFacultyMeetings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const facultyId = req.user?._id;

    const meetings = await Meeting.find({ faculty: facultyId })
      .populate('project', 'title courseType department')
      .sort({ scheduledAt: -1 });

    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log meeting minutes and transition status to 'completed'
 * PUT /api/meetings/:id/minutes
 */
export const logMeetingMinutes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { meetingMinutes } = req.body;
    const userId = req.user?._id;

    if (!meetingMinutes || !meetingMinutes.trim()) {
      throw new AppError('Meeting minutes content is required', 400);
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    // Verify mentorship or admin privileges
    if (
      !meeting.faculty.equals(userId) &&
      req.user?.role !== 'coordinator' &&
      req.user?.role !== 'admin'
    ) {
      throw new AppError('Forbidden: Only the meeting faculty can log minutes.', 403);
    }

    meeting.meetingMinutes = meetingMinutes.trim();
    meeting.status = 'completed';
    await meeting.save();

    // Trigger notification to students that minutes have been recorded
    await notificationService.fanOutProjectNotification({
      projectId: meeting.project,
      message: `Minutes recorded for meeting "${meeting.title}". Status updated to Completed.`,
      type: 'meeting',
      link: `/workspace/${meeting.project}`,
    });

    logger.info(`[Meeting Minutes Logged] Meeting: "${meeting.title}" marked Completed`);

    res.status(200).json({
      success: true,
      message: 'Meeting minutes logged and status marked as completed',
      meeting,
    });
  } catch (error) {
    next(error);
  }
};
