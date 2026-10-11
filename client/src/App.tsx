import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { ProjectCatalog } from './pages/ProjectCatalog';
import { CreateProject } from './pages/CreateProject';
import { MyGroups } from './pages/MyGroups';
import { ApplicationReview } from './pages/ApplicationReview';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { AssessmentManager } from './pages/AssessmentManager';
import { MeetingManager } from './pages/MeetingManager';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

import { Landing } from './pages/Landing';

export const App: React.FC = () => {
  const { initializeAuth } = useAuthStore();

  // Safeguard 4: Hydrate session on app mount by checking /api/auth/me
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            fontSize: '13px',
            borderRadius: '6px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
        }}
      />
      <Routes>
        {/* Public Landing */}
        <Route path="/" element={<Landing />} />

        {/* Public Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Protected Project Catalog */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectCatalog />
            </ProtectedRoute>
          }
        />

        {/* Faculty / Coordinator / Admin Project Proposal Creation */}
        <Route
          path="/projects/create"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'coordinator', 'admin']}>
              <CreateProject />
            </ProtectedRoute>
          }
        />

        {/* Student Group Management */}
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <MyGroups />
            </ProtectedRoute>
          }
        />

        {/* Faculty & Coordinator Application Review */}
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'coordinator', 'admin']}>
              <ApplicationReview />
            </ProtectedRoute>
          }
        />

        {/* Student Project Workspace */}
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <ProjectWorkspace />
            </ProtectedRoute>
          }
        />

        {/* Faculty Assessment & Milestone Manager */}
        <Route
          path="/assessments"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'coordinator', 'admin']}>
              <AssessmentManager />
            </ProtectedRoute>
          }
        />

        {/* Faculty Meeting & Minutes Manager */}
        <Route
          path="/meetings"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'coordinator', 'admin']}>
              <MeetingManager />
            </ProtectedRoute>
          }
        />

        {/* Coordinator Analytics Dashboard & CSV Export */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['coordinator', 'admin']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />

        {/* Access Denied & 404 */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
