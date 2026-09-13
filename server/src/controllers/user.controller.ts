import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { User } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

/**
 * Get current user profile
 * GET /api/users/profile
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw new AppError('User profile not found', 404);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user academic & personal profile
 * PUT /api/users/profile
 * 
 * SECURITY SAFEGUARD: The Self-Reporting Exploit Patch
 * If the user has role 'student', strictly strip academic authority fields
 * (cgpa, semester, hasDisciplinaryAction, isEligible, prerequisitesCompleted)
 * to prevent students from artificially manipulating academic records to bypass eligibility.
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData: any = { ...req.body };

    // Strict Privilege Escalation Protection:
    if (user.role === 'student') {
      const restrictedFields = [
        'cgpa',
        'semester',
        'hasDisciplinaryAction',
        'isEligible',
        'eligibilityDetails',
        'prerequisitesCompleted',
        'role',
        'email',
        'googleId',
      ];

      restrictedFields.forEach((field) => {
        if (field in updateData) {
          logger.warn(
            `[Security Audit] Student ${user.email} attempted to self-report restricted field: '${field}'. Field stripped.`
          );
          delete updateData[field];
        }
      });
    }

    // Allowed fields for students:
    if (updateData.name) user.name = updateData.name;
    if (updateData.department) user.department = updateData.department;
    if (updateData.rollNumber) user.rollNumber = updateData.rollNumber.toUpperCase();
    if (updateData.phone !== undefined) user.phone = updateData.phone;
    if (updateData.skills) user.skills = updateData.skills;
    if (updateData.avatar) user.avatar = updateData.avatar;

    // Allowed fields for faculty/admin:
    if (user.role !== 'student') {
      if (updateData.cgpa !== undefined) user.cgpa = updateData.cgpa;
      if (updateData.semester !== undefined) user.semester = updateData.semester;
      if (updateData.hasDisciplinaryAction !== undefined)
        user.hasDisciplinaryAction = updateData.hasDisciplinaryAction;
      if (updateData.prerequisitesCompleted)
        user.prerequisitesCompleted = updateData.prerequisitesCompleted;
    }

    // Set profile completion flag
    user.isProfileComplete = true;

    // Invalidate cached eligibility if academic attributes changed
    user.eligibilityDetails = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin / Coordinator Endpoint to update official student academic records
 * PATCH /api/users/:id/academic-record
 */
export const adminUpdateAcademicRecord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { cgpa, semester, prerequisitesCompleted, hasDisciplinaryAction, rollNumber, department } =
      req.body;

    const student = await User.findById(id);
    if (!student) {
      throw new AppError('Student account not found', 404);
    }

    if (cgpa !== undefined) student.cgpa = Number(cgpa);
    if (semester !== undefined) student.semester = Number(semester);
    if (prerequisitesCompleted !== undefined)
      student.prerequisitesCompleted = prerequisitesCompleted;
    if (hasDisciplinaryAction !== undefined)
      student.hasDisciplinaryAction = Boolean(hasDisciplinaryAction);
    if (rollNumber) student.rollNumber = rollNumber.toUpperCase();
    if (department) student.department = department;

    // Clear cached eligibility status so it recomputes fresh
    student.eligibilityDetails = null;

    await student.save();

    logger.info(
      `[Admin Action] Academic record for ${student.email} updated by ${req.user?.email}`
    );

    res.status(200).json({
      success: true,
      message: 'Student academic record updated successfully by authority',
      student,
    });
  } catch (error) {
    next(error);
  }
};
