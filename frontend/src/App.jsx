import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/sonner";
import store from "@/store/store";
import {
  PrivateRoute,
  AdminRoute,
  PublicRoute, 
} from "@/components/ProtectedRoutes";


import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";


import UserDashboard from "@/pages/UserDashboard";


import IssuesList from "@/pages/issues/IssuesList";
import CreateIssue from "@/pages/issues/CreateIssue";
import IssueDetail from "@/pages/issues/IssueDetail";
import EditIssue from "@/pages/issues/EditIssue";
import MyIssues from "@/pages/MyIssues";


import AdminDashboard from "@/pages/admin/AdminDashboard";
import DepartmentManagement from "@/pages/admin/DepartmentManagement";
import UserManagement from "@/pages/admin/UserManagement";
import Analytics from "@/pages/admin/Analytics";


import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Leaderboard from "@/pages/Leaderboard";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground">Page not found</p>
    </div>
  </div>
);

import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/issues"
              element={
                <PrivateRoute>
                  <IssuesList />
                </PrivateRoute>
              }
            />
            <Route
              path="/issues/create"
              element={
                <PrivateRoute>
                  <CreateIssue />
                </PrivateRoute>
              }
            />
            <Route
              path="/issues/:id/edit"
              element={
                <PrivateRoute>
                  <EditIssue />
                </PrivateRoute>
              }
            />
            <Route
              path="/issues/:id"
              element={
                <PrivateRoute>
                  <IssueDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-issues"
              element={
                <PrivateRoute>
                  <MyIssues />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <PrivateRoute>
                  <Leaderboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              }
            />

            {}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <AdminRoute>
                  <DepartmentManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              }
            />

            {}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </Provider>
  );
}

export default App;
