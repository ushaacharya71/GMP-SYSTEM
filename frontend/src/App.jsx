import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";

/* DASHBOARDS */
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import InternDashboard from "./pages/InternDashboard";


/* MANAGER PAGES */
import ManagerStipend from "./pages/ManagerStipend";
import ManagerRevenue from "./pages/ManagerRevenue";
import ManagerViewDashboard from "./pages/ManagerViewDashboard";


/* ADMIN / SHARED */
import ManageUsers from "./pages/ManageUsers";
import EditUserPage from "./pages/EditUserPage";
import AddUserPage from "./pages/AddUserPage";
import AdminProfile from "./pages/AdminProfile";
import UserProfile from "./pages/UserProfile";

import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./pages/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ================= ROUTE WRAPPER ================= */
const AppRoutes = ({ user }) => {
  const location = useLocation();
  const isResetRoute = location.pathname.startsWith("/reset-password");

  const getRedirectPath = (user) => {
    if (!user) return "/";
    if (user.role === "admin" || user.role === "hr") return "/admin";
    return `/${user.role}`;
  };

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/"
        element={
          user && !isResetRoute ? (
            <Navigate to={getRedirectPath(user)} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* RESET PASSWORD */}
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/manage-users"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/add-user"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AddUserPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/edit-user/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EditUserPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />

      {/* MANAGER */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/manage-users"
        element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/stipend"
        element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <ManagerStipend />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/revenue"
        element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <ManagerRevenue />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/view-dashboard/:id"
        element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <ManagerViewDashboard />
          </ProtectedRoute>
        }
      />



      {/* EMPLOYEE */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* INTERN */}
      <Route
        path="/intern"
        element={
          <ProtectedRoute allowedRoles={["intern"]}>
            <InternDashboard />
          </ProtectedRoute>
        }
      />

      {/* USER PROFILE */}
      <Route
        path="/admin/user/:id"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "manager","hr"]}
          >
            <UserProfile />
          </ProtectedRoute>
        }
      />

      {/* UNAUTHORIZED */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/* ================= MAIN APP ================= */
const App = () => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) return null;

  return (
    <BrowserRouter>
      <ToastContainer position="top-center" autoClose={3000} />
      <AppRoutes user={user} />
    </BrowserRouter>
  );
};

export default App;
