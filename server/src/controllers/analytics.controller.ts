import { Response, NextFunction } from 'express';
import { Parser } from 'json2csv';
import { AuthenticatedRequest } from '../types/auth.types';
import { Project } from '../models/project.model';
import { Submission } from '../models/submission.model';
import { User } from '../models/user.model';
import { Assessment } from '../models/assessment.model';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

/**
 * Neutralizes CSV injection formula characters (=, +, -, @, \t, \r)
 */
const sanitizeForCSV = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
};

/**
 * Fetch aggregation metrics for coordinator/admin analytics dashboard
 * GET /api/analytics/dashboard
 */
export const getAnalyticsDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // RBAC: Restricted to coordinator and admin
    if (req.user?.role !== 'coordinator' && req.user?.role !== 'admin') {
      throw new AppError('Forbidden: Only a Coordinator or Admin can access analytics.', 403);
    }

    // 1. Projects distribution by domain
    const projectsByDomain = await Project.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $project: { _id: 0, domain: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);

    // 2. Average marks grouped by courseType
    const avgMarksByCourseType = await Submission.aggregate([
      { $match: { status: 'graded', marks: { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: 'assessments',
          localField: 'assessment',
          foreignField: '_id',
          as: 'assessmentDoc',
        },
      },
      { $unwind: '$assessmentDoc' },
      {
        $lookup: {
          from: 'projects',
          localField: 'assessmentDoc.project',
          foreignField: '_id',
          as: 'projectDoc',
        },
      },
      { $unwind: '$projectDoc' },
      {
        $group: {
          _id: '$projectDoc.courseType',
          avgMarks: { $avg: '$marks' },
          totalEvaluated: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          courseType: '$_id',
          avgMarks: { $round: ['$avgMarks', 1] },
          totalEvaluated: 1,
        },
      },
      { $sort: { avgMarks: -1 } },
    ]);

    // 3. Project status breakdown (active vs. completed/closed)
    const statusCounts = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    let activeProjects = 0;
    let completedProjects = 0;
    statusCounts.forEach((item) => {
      if (item._id === 'closed' || item._id === 'completed') {
        completedProjects += item.count;
      } else {
        activeProjects += item.count;
      }
    });

    // 4. Executive KPI Summary metrics
    const [totalProjects, totalStudents, totalFaculty, totalSubmissions, totalGraded] =
      await Promise.all([
        Project.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'faculty' }),
        Submission.countDocuments(),
        Submission.countDocuments({ status: 'graded' }),
      ]);

    res.status(200).json({
      success: true,
      kpis: {
        totalProjects,
        totalStudents,
        totalFaculty,
        totalSubmissions,
        totalGraded,
        activeProjects,
        completedProjects,
      },
      projectsByDomain,
      avgMarksByCourseType,
      projectStatusBreakdown: [
        { name: 'Active Projects', value: activeProjects },
        { name: 'Completed Projects', value: completedProjects },
      ],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate and stream formatted, injection-protected CSV of project marks
 * GET /api/analytics/export
 */
export const exportGradesCSV = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // RBAC: Restricted to coordinator and admin
    if (req.user?.role !== 'coordinator' && req.user?.role !== 'admin') {
      throw new AppError('Forbidden: Only a Coordinator or Admin can export grade analytics.', 403);
    }

    const submissions = await Submission.find({ status: 'graded' })
      .populate({
        path: 'assessment',
        populate: [
          { path: 'project', select: 'title courseType domain' },
          { path: 'faculty', select: 'name email' },
        ],
      })
      .populate('submittedBy', 'name email rollNumber department')
      .populate('group', 'name')
      .sort({ createdAt: -1 });

    const rows = submissions.map((sub: any) => {
      const assessment = sub.assessment || {};
      const project = assessment.project || {};
      const faculty = assessment.faculty || {};
      const student = sub.submittedBy || {};
      const group = sub.group || {};

      return {
        projectTitle: sanitizeForCSV(project.title || 'N/A'),
        courseType: sanitizeForCSV(project.courseType || 'N/A'),
        domain: sanitizeForCSV(project.domain || 'N/A'),
        facultyName: sanitizeForCSV(faculty.name || 'N/A'),
        facultyEmail: sanitizeForCSV(faculty.email || 'N/A'),
        teamOrStudent: sanitizeForCSV(group.name ? `Group: ${group.name}` : student.name || 'N/A'),
        studentName: sanitizeForCSV(student.name || 'N/A'),
        rollNumber: sanitizeForCSV(student.rollNumber || 'N/A'),
        milestoneTitle: sanitizeForCSV(assessment.title || 'N/A'),
        maxMarks: assessment.maxMarks || 100,
        marks: sub.marks !== undefined ? sub.marks : 0,
        status: sanitizeForCSV(sub.status),
        feedback: sanitizeForCSV(sub.feedback || 'None'),
        evaluatedAt: sub.updatedAt ? new Date(sub.updatedAt).toISOString().split('T')[0] : 'N/A',
      };
    });

    const fields = [
      { label: 'Project Title', value: 'projectTitle' },
      { label: 'Course Type', value: 'courseType' },
      { label: 'Domain', value: 'domain' },
      { label: 'Faculty Mentor', value: 'facultyName' },
      { label: 'Team / Student', value: 'teamOrStudent' },
      { label: 'Student Roll No', value: 'rollNumber' },
      { label: 'Milestone Title', value: 'milestoneTitle' },
      { label: 'Max Marks', value: 'maxMarks' },
      { label: 'Marks Awarded', value: 'marks' },
      { label: 'Evaluation Status', value: 'status' },
      { label: 'Faculty Feedback', value: 'feedback' },
      { label: 'Evaluated Date', value: 'evaluatedAt' },
    ];

    const json2csvParser = new Parser({ fields });
    const csvContent = json2csvParser.parse(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="university_project_grades_${Date.now()}.csv"`
    );
    res.status(200).send(csvContent);

    logger.info(`[Analytics Export] CSV export downloaded by Coordinator: ${req.user?.email}`);
  } catch (error) {
    next(error);
  }
};
