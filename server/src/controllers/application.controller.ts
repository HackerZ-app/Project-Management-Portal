import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { Application, IApplication } from '../models/application.model';
import { Project, IProject } from '../models/project.model';
import { Group, IGroup } from '../models/group.model';
import { User, IUser } from '../models/user.model';
import { Eligibility, ensureDefaultEligibilityRules } from '../models/eligibility.model';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

/**
 * Submit an application to a published project (solo or with group)
 * POST /api/applications
 */
export const submitApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, groupId, statementOfPurpose } = req.body;
    const userId = req.user?._id;

    if (!projectId) {
      throw new AppError('Project ID is required', 400);
    }
    if (!statementOfPurpose || statementOfPurpose.trim().length < 50) {
      throw new AppError('Statement of Purpose must be at least 50 characters long', 400);
    }

    // 1. Verify Project
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.status !== 'published') {
      throw new AppError(
        `Cannot apply to project with status '${project.status}'. Only published projects accept applications.`,
        400
      );
    }

    if (new Date() > new Date(project.deadline)) {
      throw new AppError('Project application deadline has expired', 400);
    }

    let studentCount = 1;
    let group: IGroup | null = null;
    const applicantUsersToCheck: mongoose.Types.ObjectId[] = [userId as mongoose.Types.ObjectId];

    // 2. If applying with a Group
    if (groupId) {
      group = await Group.findById(groupId);
      if (!group) {
        throw new AppError('Specified group not found', 404);
      }

      if (!group.leader.equals(userId)) {
        throw new AppError('Only the group leader can submit project applications', 403);
      }

      if (group.status !== 'locked') {
        throw new AppError(
          `Group must be locked before submitting applications. Current status is '${group.status}'.`,
          400
        );
      }

      if (group.courseType !== project.courseType) {
        throw new AppError(
          `Course type mismatch: Group is formed for '${group.courseType}', but project is for '${project.courseType}'.`,
          400
        );
      }

      studentCount = group.members.length;
      applicantUsersToCheck.length = 0;
      applicantUsersToCheck.push(...group.members);
    }

    // 3. Capacity Check
    const availableSlots = project.maxStudents - project.currentStudents;
    if (studentCount > availableSlots) {
      throw new AppError(
        `Team size (${studentCount}) exceeds remaining available project capacity (${availableSlots} slot(s) left).`,
        400
      );
    }

    // 4. Duplicate Check
    const duplicateQuery: any = {
      project: project._id,
      status: 'pending',
    };
    if (group) {
      duplicateQuery.group = group._id;
    } else {
      duplicateQuery.appliedBy = userId;
    }

    const existingApp = await Application.findOne(duplicateQuery);
    if (existingApp) {
      throw new AppError('You already have a pending application submitted for this project', 400);
    }

    // 5. Academic Eligibility Check for all applicant members
    await ensureDefaultEligibilityRules();
    const eligibilityRule = await Eligibility.findOne({
      courseType: project.courseType,
      department: req.user?.department || 'Computer Science and Engineering',
    });

    if (eligibilityRule) {
      const applicantUsers = await User.find({ _id: { $in: applicantUsersToCheck } });

      for (const student of applicantUsers) {
        const cgpaPassed = student.cgpa >= eligibilityRule.minCgpa;
        const semesterPassed = student.semester >= eligibilityRule.minSemester;
        const disciplinaryPassed =
          !student.hasDisciplinaryAction || eligibilityRule.allowDisciplinaryAction;

        const userPrereqs = new Set(student.prerequisitesCompleted || []);
        const missingPrereqs = eligibilityRule.requiredPrerequisites.filter((p) => !userPrereqs.has(p));

        if (!cgpaPassed || !semesterPassed || !disciplinaryPassed || missingPrereqs.length > 0) {
          const reasons: string[] = [];
          if (!cgpaPassed) reasons.push(`CGPA ${student.cgpa}/${eligibilityRule.minCgpa}`);
          if (!semesterPassed) reasons.push(`Sem ${student.semester}/${eligibilityRule.minSemester}`);
          if (!disciplinaryPassed) reasons.push('Active disciplinary record');
          if (missingPrereqs.length > 0) reasons.push(`Missing prerequisites: ${missingPrereqs.join(', ')}`);

          throw new AppError(
            `Eligibility Error: Student '${student.name}' does not meet the requirements for ${project.courseType}. (${reasons.join('; ')}).`,
            400
          );
        }
      }
    }

    // 6. Create Application
    const application = await Application.create({
      project: project._id,
      appliedBy: userId,
      group: group ? group._id : undefined,
      statementOfPurpose: statementOfPurpose.trim(),
      status: 'pending',
    });

    logger.info(
      `[Application Submitted] Project: "${project.title}" by ${req.user?.email} (${group ? `Group: ${group.name}` : 'Solo'})`
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully to faculty mentor for evaluation',
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Faculty Application Evaluation (Approve or Reject)
 * PUT /api/applications/:id/evaluate
 * 
 * CONCURRENCY SAFETY & AUTOMATED MASS REJECTIONS:
 * 1. Atomic $inc on project.currentStudents conditioned on capacity.
 * 2. If project reaches maxStudents, mark project 'allocated' and mass-reject
 *    all OTHER pending applications for that project.
 * 3. Inverse Cross-Project Withdrawal (Double-booking protection):
 *    Mass-reject/withdraw all pending applications submitted by this approved
 *    group/student to any other projects.
 */
export const evaluateApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    const evaluatorId = req.user?._id;

    if (!status || !['approved', 'rejected'].includes(status)) {
      throw new AppError("Evaluation status must be either 'approved' or 'rejected'", 400);
    }

    const application = await Application.findById(id).populate('project');
    if (!application) {
      throw new AppError('Application not found', 404);
    }

    if (application.status !== 'pending') {
      throw new AppError(
        `Application has already been evaluated as '${application.status}'`,
        400
      );
    }

    const project = application.project as any;

    // Verify evaluator is mentor of this project or admin/coordinator
    if (
      !project.faculty.equals(evaluatorId) &&
      req.user?.role !== 'admin' &&
      req.user?.role !== 'coordinator'
    ) {
      throw new AppError('You do not have permission to evaluate applications for this project', 403);
    }

    if (status === 'rejected') {
      application.status = 'rejected';
      application.feedback = feedback?.trim() || 'Application declined by faculty mentor.';
      application.evaluatedAt = new Date();
      application.evaluatedBy = evaluatorId;
      await application.save();

      res.status(200).json({
        success: true,
        message: 'Application rejected.',
        application,
      });
      return;
    }

    // --- APPROVAL FLOW ---
    let studentCount = 1;
    let group: IGroup | null = null;

    if (application.group) {
      group = await Group.findById(application.group);
      if (group) {
        studentCount = group.members.length;
      }
    }

    // Atomic conditional capacity reservation
    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: project._id,
        currentStudents: { $lte: project.maxStudents - studentCount },
        status: 'published',
      },
      {
        $inc: { currentStudents: studentCount },
        $push: { allocatedGroups: group ? group._id : application.appliedBy },
      },
      { new: true }
    );

    if (!updatedProject) {
      throw new AppError(
        'Capacity Conflict: Project capacity has already been filled or closed by another concurrent approval.',
        409
      );
    }

    // If project reaches max capacity, mark project allocated & mass-reject remaining applicants for THIS project
    if (updatedProject.currentStudents >= updatedProject.maxStudents) {
      updatedProject.status = 'allocated';
      await updatedProject.save();

      await Application.updateMany(
        {
          project: project._id,
          status: 'pending',
          _id: { $ne: application._id },
        },
        {
          $set: {
            status: 'rejected',
            feedback: 'Project capacity has been fully allocated to another qualified team.',
            evaluatedAt: new Date(),
            evaluatedBy: evaluatorId,
          },
        }
      );

      logger.info(
        `[Project Allocated] "${project.title}" capacity reached. Mass-rejected remaining applications.`
      );
    }

    // Update group status to 'assigned'
    if (group) {
      group.status = 'assigned';
      await group.save();
    }

    // CRITICAL SECURITY SAFEGUARD: Cross-Project Mass Rejection (The "Double-Booking" Flaw)
    // Withdraw/reject any other pending applications by this student/group across all other projects
    const crossProjectQuery: any = {
      _id: { $ne: application._id },
      status: 'pending',
    };
    if (group) {
      crossProjectQuery.group = group._id;
    } else {
      crossProjectQuery.appliedBy = application.appliedBy;
    }

    const withdrawnCount = await Application.updateMany(crossProjectQuery, {
      $set: {
        status: 'rejected',
        feedback: 'Automatically withdrawn because your group was assigned to another project.',
        evaluatedAt: new Date(),
      },
    });

    logger.info(
      `[Double-Booking Safeguard] Withdrew ${withdrawnCount.modifiedCount} other pending applications for approved team.`
    );

    // Finalize approved application
    application.status = 'approved';
    application.feedback = feedback?.trim() || 'Congratulations! Application approved by faculty.';
    application.evaluatedAt = new Date();
    application.evaluatedBy = evaluatorId;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application approved successfully! Project capacity updated and double-booking prevented.',
      application,
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's submitted applications
 * GET /api/applications/me
 */
export const getMyApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Find groups user is part of
    const userGroups = await Group.find({
      $or: [{ leader: userId }, { members: userId }],
    }).select('_id');

    const groupIds = userGroups.map((g) => g._id);

    const applications = await Application.find({
      $or: [{ appliedBy: userId }, { group: { $in: groupIds } }],
    })
      .populate('project', 'title domain courseType maxStudents currentStudents deadline status')
      .populate('group', 'name members status')
      .populate('evaluatedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get applications submitted to projects mentored by authenticated faculty
 * GET /api/applications/faculty
 */
export const getFacultyApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const facultyId = req.user?._id;

    // Find projects mentored by this faculty
    const facultyProjects = await Project.find({ faculty: facultyId }).select('_id');
    const projectIds = facultyProjects.map((p) => p._id);

    const applications = await Application.find({
      project: { $in: projectIds },
    })
      .populate('project', 'title domain courseType maxStudents currentStudents status deadline')
      .populate('appliedBy', 'name email rollNumber department avatar cgpa semester prerequisitesCompleted')
      .populate({
        path: 'group',
        populate: {
          path: 'members',
          select: 'name email rollNumber department avatar cgpa semester prerequisitesCompleted',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};
