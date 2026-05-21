import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseList from './pages/courses/CourseList';
import CourseDetail from './pages/courses/CourseDetail';
import CreateAssignment from './pages/assignments/CreateAssignment';
import AssignmentDetail from './pages/assignments/AssignmentDetail';
import SubmitAssignment from './pages/submissions/SubmitAssignment';
import ViewSubmissions from './pages/submissions/ViewSubmissions';

export default function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute
              requiredRoles={['super_admin', 'campus_admin', 'it_support']}
            >
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Courses */}
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route
          path="/courses/:id/assignments/create"
          element={<CreateAssignment />}
        />

        {/* Assignments */}
        <Route path="/assignments/:id" element={<AssignmentDetail />} />
        <Route
          path="/assignments/:id/submit"
          element={<SubmitAssignment />}
        />
        <Route
          path="/assignments/:id/submissions"
          element={<ViewSubmissions />}
        />

        {/* Settings placeholder */}
        <Route
          path="/settings"
          element={
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                System Settings
              </h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          }
        />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
