import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { Group, IGroup } from '../models/group.model';
import { User } from '../models/user.model';
import { Application } from '../models/application.model';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

/**
 * Create a new student project group
 * POST /api/groups
 */
export const createGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, courseType } = req.body;
    const userId = req.user?._id;

    if (!name || !name.trim()) {
      throw new AppError('Group name is required', 400);
    }
    if (!courseType) {
      throw new AppError('Course type is required for group formation', 400);
    }

    // Guardrail: Verify user does not already belong to an active group for this courseType
    const activeConflict = await Group.findOne({
      courseType,
      status: { $in: ['forming', 'locked', 'assigned'] },
      $or: [{ leader: userId }, { members: userId }],
    });

    if (activeConflict) {
      throw new AppError(
        `You already belong to an active group ('${activeConflict.name}') for ${courseType}.`,
        400
      );
    }

    const group = await Group.create({
      name: name.trim(),
      leader: userId,
      members: [userId],
      invites: [],
      courseType,
      status: 'forming',
    });

    logger.info(`[Group Created] "${group.name}" for ${courseType} by Leader: ${req.user?.email}`);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search peers for group invitation
 * GET /api/groups/peers?search=...
 * 
 * PRIVACY SAFEGUARD:
 * Explicitly projects only safe public fields. Never leaks CGPA, disciplinary
 * records, or eligibility details to peers.
 */
export const searchPeers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = (
      (req.query.search as string) ||
      (req.query.query as string) ||
      ''
    ).trim();
    if (!search || search.length < 2) {
      res.status(200).json({ success: true, peers: [] });
      return;
    }

    const peers = await User.find({
      role: 'student',
      _id: { $ne: req.user?._id },
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ],
    })
      .select('name email rollNumber department avatar _id') // STRICT PRIVACY PROJECTION
      .limit(10);

    res.status(200).json({
      success: true,
      peers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Invite a peer to join the group
 * POST /api/groups/:id/invite
 */
export const inviteMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const identifier = (
      req.body.identifier ||
      req.body.rollNumber ||
      req.body.email ||
      ''
    ).trim();

    if (!identifier) {
      throw new AppError('Student email or roll number is required to send invite', 400);
    }

    const group = await Group.findById(id);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    // Only group leader can invite
    if (!group.leader.equals(req.user?._id)) {
      throw new AppError('Only the group leader can invite members', 403);
    }

    if (group.status !== 'forming') {
      throw new AppError('Cannot invite members to a locked or assigned group', 400);
    }

    // Max capacity guard
    if (group.members.length >= 5) {
      throw new AppError('Group has reached maximum capacity of 5 members', 400);
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find student target
    const targetStudent = await User.findOne({
      role: 'student',
      $or: [
        { email: cleanIdentifier },
        { rollNumber: cleanIdentifier.toUpperCase() },
      ],
    });

    if (!targetStudent) {
      throw new AppError(
        'Student with that official email or roll number could not be found',
        404
      );
    }

    const targetId = targetStudent._id as mongoose.Types.ObjectId;

    // Check if already in this group
    if (group.members.some((m) => m.equals(targetId))) {
      throw new AppError('Student is already a member of this group', 400);
    }

    // Check if already invited
    const existingInvite = group.invites.find(
      (inv) => inv.user.equals(targetId) && inv.status === 'pending'
    );
    if (existingInvite) {
      throw new AppError('An invite is already pending for this student', 400);
    }

    // Guardrail: Check if target student already belongs to another active group for this courseType
    const targetActiveGroup = await Group.findOne({
      courseType: group.courseType,
      status: { $in: ['forming', 'locked', 'assigned'] },
      $or: [{ leader: targetId }, { members: targetId }],
    });

    if (targetActiveGroup) {
      throw new AppError(
        `Student '${targetStudent.name}' is already a member of an active group ('${targetActiveGroup.name}') for ${group.courseType}.`,
        400
      );
    }

    // Add invite
    group.invites.push({
      user: targetId,
      email: targetStudent.email,
      rollNumber: targetStudent.rollNumber,
      status: 'pending',
      createdAt: new Date(),
    });

    await group.save();

    logger.info(
      `[Group Invite] Leader ${req.user?.email} invited ${targetStudent.email} to group ${group.name}`
    );

    res.status(200).json({
      success: true,
      message: `Invitation sent to ${targetStudent.name} (${targetStudent.email})`,
      group,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept group invite
 * PUT /api/groups/:id/accept
 */
export const acceptInvite = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const group = await Group.findById(id);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (group.status !== 'forming') {
      throw new AppError('This group is no longer accepting new members', 400);
    }

    if (group.members.length >= 5) {
      throw new AppError('Group capacity is already filled', 400);
    }

    const invite = group.invites.find(
      (inv) => inv.user.equals(userId) && inv.status === 'pending'
    );

    if (!invite) {
      throw new AppError('No pending invitation found for your account in this group', 404);
    }

    // Guardrail: Check if accepting student is in another active group for this courseType
    const activeConflict = await Group.findOne({
      _id: { $ne: group._id },
      courseType: group.courseType,
      status: { $in: ['forming', 'locked', 'assigned'] },
      $or: [{ leader: userId }, { members: userId }],
    });

    if (activeConflict) {
      throw new AppError(
        `You already belong to active group '${activeConflict.name}' for ${group.courseType}.`,
        400
      );
    }

    // Update invite status and append to members
    invite.status = 'accepted';
    group.members.push(userId as mongoose.Types.ObjectId);

    await group.save();

    logger.info(`[Invite Accepted] ${req.user?.email} joined group "${group.name}"`);

    res.status(200).json({
      success: true,
      message: `You have successfully joined group '${group.name}'!`,
      group,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Decline group invite
 * PUT /api/groups/:id/decline
 */
export const declineInvite = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const group = await Group.findById(id);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    const invite = group.invites.find(
      (inv) => inv.user.equals(userId) && inv.status === 'pending'
    );

    if (!invite) {
      throw new AppError('No pending invitation found for your account', 404);
    }

    invite.status = 'rejected';
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Invitation declined.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lock group (ready to apply for projects)
 * PUT /api/groups/:id/lock
 */
export const lockGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.leader.equals(req.user?._id)) {
      throw new AppError('Only the group leader can lock the team', 403);
    }

    if (group.status !== 'forming') {
      throw new AppError(`Group is already in '${group.status}' status`, 400);
    }

    group.status = 'locked';
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Group locked successfully. Team roster is ready for project application.',
      group,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unlock group
 * PUT /api/groups/:id/unlock
 * 
 * GUARDRAIL:
 * Group can ONLY be unlocked if there are 0 active pending applications.
 */
export const unlockGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.leader.equals(req.user?._id)) {
      throw new AppError('Only the group leader can unlock the team', 403);
    }

    if (group.status === 'assigned') {
      throw new AppError('Cannot unlock a group that has already been assigned to a project', 400);
    }

    // Check for pending applications
    const pendingApplicationsCount = await Application.countDocuments({
      group: group._id,
      status: 'pending',
    });

    if (pendingApplicationsCount > 0) {
      throw new AppError(
        `Cannot unlock group while ${pendingApplicationsCount} project application(s) are pending review. Withdraw pending applications before modifying team roster.`,
        400
      );
    }

    group.status = 'forming';
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Group unlocked. You may now invite or remove peers.',
      group,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's groups and incoming invitations
 * GET /api/groups/me
 */
export const getMyGroups = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Groups where user is leader or member
    const groups = await Group.find({
      $or: [{ leader: userId }, { members: userId }],
    })
      .populate('leader', 'name email rollNumber department avatar')
      .populate('members', 'name email rollNumber department avatar cgpa semester')
      .sort({ createdAt: -1 });

    // Groups where user has a pending invitation
    const incomingInvites = await Group.find({
      invites: {
        $elemMatch: {
          user: userId,
          status: 'pending',
        },
      },
    })
      .populate('leader', 'name email rollNumber department avatar')
      .select('name courseType leader status createdAt');

    res.status(200).json({
      success: true,
      groups,
      incomingInvites,
    });
  } catch (error) {
    next(error);
  }
};
