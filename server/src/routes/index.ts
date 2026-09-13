import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import eligibilityRoutes from './eligibility.routes';
import projectRoutes from './project.routes';
import groupRoutes from './group.routes';
import applicationRoutes from './application.routes';
import assessmentRoutes from './assessment.routes';
import submissionRoutes from './submission.routes';
import meetingRoutes from './meeting.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';

const apiRouter = Router();

// Mount modules
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/eligibility', eligibilityRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/groups', groupRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/assessments', assessmentRoutes);
apiRouter.use('/submissions', submissionRoutes);
apiRouter.use('/meetings', meetingRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/analytics', analyticsRoutes);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Academic Project Management Portal API',
  });
});

export default apiRouter;
