import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import CitizenDashboard from "./pages/CitizenDashboard";
import ReportIssue from "./pages/ReportIssue";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import TrackIssue from "./pages/TrackIssue";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/AdminDashboard";
import AdminComplaints from "./pages/AdminComplaints";
import AdminComplaintDetails from "./pages/AdminComplaintDetails";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminInsights from "./pages/AdminInsights";
import AdminProfile from "./pages/AdminProfile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* =====================================================
              PUBLIC ROUTES
          ===================================================== */}

          <Route
            path="/"
            element={<Landing />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />


          {/* =====================================================
              PROTECTED CITIZEN ROUTES
          ===================================================== */}

          <Route element={<ProtectedRoute />}>

            <Route
              path="/dashboard"
              element={<CitizenDashboard />}
            />

            <Route
              path="/report"
              element={<ReportIssue />}
            />

            <Route
              path="/complaints"
              element={<MyComplaints />}
            />

            <Route
              path="/complaints/:complaintId"
              element={<ComplaintDetails />}
            />

            <Route
              path="/tracking"
              element={<TrackIssue />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

          </Route>


          {/* =====================================================
              PROTECTED ADMIN ROUTES
          ===================================================== */}

          <Route element={<AdminRoute />}>

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/complaints"
              element={<AdminComplaints />}
            />

            <Route
              path="/admin/complaints/:complaintId"
              element={<AdminComplaintDetails />}
            />

            <Route
              path="/admin/analytics"
              element={<AdminAnalytics />}
            />

            <Route
              path="/admin/insights"
              element={<AdminInsights />}
            />

            <Route
              path="/admin/profile"
              element={<AdminProfile />}
            />

          </Route>


          {/* =====================================================
              ADMIN ROOT
          ===================================================== */}

          <Route
            path="/admin"
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />


          {/* =====================================================
              FALLBACK
          ===================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;