import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { User } from '../models/user.model';
import { Eligibility, ensureDefaultEligibilityRules } from '../models/eligibility.model';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

/**
 * Evaluate or retrieve cached eligibility standing for the logged-in student
 * GET /api/eligibility/check
 * 
 * PERFORMANCE OPTIMIZATION: State Caching
 * Caches eligibility results directly on the user record to prevent expensive
 * recomputations on repeated dashboard loads.
 */
export const checkEligibility = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const forceRefresh = req.query.forceRefresh === 'true';

    // 1. Check if cached eligibility evaluation exists
    if (!forceRefresh && user.eligibilityDetails && Object.keys(user.eligibilityDetails).length > 0) {
      res.status(200).json({
        success: true,
        source: 'cache',
        isEligible: user.isEligible,
        evaluations: user.eligibilityDetails,
        studentAcademicSummary: {
          cgpa: user.cgpa,
          semester: user.semester,
          hasDisciplinaryAction: user.hasDisciplinaryAction,
          prerequisitesCompleted: user.prerequisitesCompleted,
          department: user.department,
        },
      });
      return;
    }

    // 2. Ensure default rules exist for evaluation
    await ensureDefaultEligibilityRules();

    // 3. Fetch rules matching student's department
    const rules = await Eligibility.find({
      department: user.department || 'Computer Science and Engineering',
    });

    const evaluations: Record<string, any> = {};
    let atLeastOneEligible = false;

    for (const rule of rules) {
      const cgpaPassed = user.cgpa >= rule.minCgpa;
      const semesterPassed = user.semester >= rule.minSemester;
      const disciplinaryPassed = !user.hasDisciplinaryAction || rule.allowDisciplinaryAction;

      const userPrereqs = new Set(user.prerequisitesCompleted || []);
      const missingPrereqs = rule.requiredPrerequisites.filter((p) => !userPrereqs.has(p));
      const prereqsPassed = missingPrereqs.length === 0;

      const isCourseEligible =
        cgpaPassed && semesterPassed && disciplinaryPassed && prereqsPassed;

      if (isCourseEligible) {
        atLeastOneEligible = true;
      }

      const failureReasons: string[] = [];
      if (!cgpaPassed) {
        failureReasons.push(
          `CGPA ${user.cgpa.toFixed(2)} is below the minimum requirement of ${rule.minCgpa.toFixed(2)}.`
        );
      }
      if (!semesterPassed) {
        failureReasons.push(
          `Current semester (${user.semester}) is below the required semester ${rule.minSemester}.`
        );
      }
      if (!disciplinaryPassed) {
        failureReasons.push(
          'Active disciplinary record prohibits enrollment in this academic project.'
        );
      }
      if (!prereqsPassed) {
        failureReasons.push(
          `Missing required course prerequisites: ${missingPrereqs.join(', ')}.`
        );
      }

      evaluations[rule.courseType] = {
        isEligible: isCourseEligible,
        criteria: {
          minCgpa: rule.minCgpa,
          minSemester: rule.minSemester,
          requiredPrerequisites: rule.requiredPrerequisites,
        },
        checks: {
          cgpa: { required: rule.minCgpa, actual: user.cgpa, passed: cgpaPassed },
          semester: { required: rule.minSemester, actual: user.semester, passed: semesterPassed },
          disciplinary: { passed: disciplinaryPassed },
          prerequisites: {
            required: rule.requiredPrerequisites,
            missing: missingPrereqs,
            passed: prereqsPassed,
          },
        },
        failureReasons,
      };
    }

    // 4. Cache state to User document
    user.isEligible = atLeastOneEligible;
    user.eligibilityDetails = evaluations;
    await user.save();

    logger.info(
      `[Eligibility Computed] ${user.email}: isEligible=${atLeastOneEligible} (cached for future calls)`
    );

    res.status(200).json({
      success: true,
      source: 'computed',
      isEligible: atLeastOneEligible,
      evaluations,
      studentAcademicSummary: {
        cgpa: user.cgpa,
        semester: user.semester,
        hasDisciplinaryAction: user.hasDisciplinaryAction,
        prerequisitesCompleted: user.prerequisitesCompleted,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};
