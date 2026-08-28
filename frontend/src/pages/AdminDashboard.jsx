import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import api from "../api/api";

import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadStatistics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/statistics");

        if (mounted) {
          setStatistics(response.data);
        }
      } catch (err) {
        console.error("Admin statistics loading failed:", err);

        if (mounted) {
          setError(
            err?.response?.data?.detail ||
              "Unable to load administrative data."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStatistics();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const statusData = statistics?.status || {};
  const priorityData = statistics?.priority || {};

  const totalComplaints = statistics?.total_complaints ?? 0;

  const submitted = statusData.submitted ?? 0;
  const underReview = statusData.under_review ?? 0;
  const inProgress = statusData.in_progress ?? 0;
  const resolved = statusData.resolved ?? 0;
  const closed = statusData.closed ?? 0;

  const highPriority = priorityData.high ?? 0;
  const mediumPriority = priorityData.medium ?? 0;
  const lowPriority = priorityData.low ?? 0;

  const openComplaints =
    submitted +
    underReview +
    inProgress;

  const resolutionRate =
    totalComplaints > 0
      ? Math.round(
          ((resolved + closed) / totalComplaints) * 100
        )
      : 0;

  const getInitial = () => {
    const name =
      user?.full_name ||
      user?.email ||
      "Administrator";

    return name.charAt(0).toUpperCase();
  };

  const adminNavClass = ({ isActive }) =>
    `admin-nav-link${isActive ? " active" : ""}`;

  return (
    <div className="admin-page">

      <div className="admin-background-orb admin-orb-one"></div>
      <div className="admin-background-orb admin-orb-two"></div>
      <div className="admin-background-grid"></div>

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-inner">

          {/* BRAND */}
          <div className="admin-brand">
            <NavLink
              to="/admin/dashboard"
              className="admin-brand-link"
            >
              <div className="admin-brand-icon">
                C
              </div>

              <div className="admin-brand-name">
                <strong>CivicMind</strong>
                <span>AI</span>
              </div>
            </NavLink>
          </div>

          <div className="admin-sidebar-label">
            ADMINISTRATION
          </div>

          {/* ADMIN NAVIGATION */}
          <nav className="admin-navigation">

            <NavLink
              to="/admin/dashboard"
              end
              className={adminNavClass}
            >
              <span className="admin-nav-icon">
                ◈
              </span>

              <span>Overview</span>

              <span className="admin-nav-active-mark">
                →
              </span>
            </NavLink>

            <NavLink
              to="/admin/complaints"
              end
              className={adminNavClass}
            >
              <span className="admin-nav-icon">
                ▤
              </span>

              <span>Complaints</span>

              <span className="admin-nav-active-mark">
                →
              </span>
            </NavLink>

            <NavLink
              to="/admin/analytics"
              end
              className={adminNavClass}
            >
              <span className="admin-nav-icon">
                ◌
              </span>

              <span>Analytics</span>

              <span className="admin-nav-active-mark">
                →
              </span>
            </NavLink>

            <NavLink
              to="/admin/insights"
              end
              className={adminNavClass}
            >
              <span className="admin-nav-icon">
                ✦
              </span>

              <span>AI Insights</span>

              <span className="admin-nav-active-mark">
                →
              </span>
            </NavLink>

          </nav>

          <div className="admin-sidebar-divider"></div>

          {/* ADMIN PROFILE */}
          <NavLink
            to="/admin/profile"
            className="admin-profile-card"
          >
            <div className="admin-profile-avatar">
              {getInitial()}
            </div>

            <div className="admin-profile-info">
              <strong>
                {user?.full_name || "Administrator"}
              </strong>

              <span>
                Administrator
              </span>
            </div>

            <span className="admin-profile-arrow">
              →
            </span>
          </NavLink>

          {/* SIDEBAR BOTTOM */}
          <div className="admin-sidebar-bottom">

            <div className="admin-sidebar-system">
              <div className="admin-system-icon">
                ✦
              </div>

              <div>
                <strong>CivicMind AI</strong>

                <p>
                  Administrative intelligence.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="admin-logout"
              onClick={handleLogout}
            >
              <span>↪</span>
              <span>Sign out</span>
            </button>

          </div>

        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">

        <header className="admin-header">

          <div className="admin-header-copy">

            <span className="admin-header-label">
              CIVICMIND AI · ADMINISTRATION
            </span>

            <h1>
              Command
              <span>{" "}center.</span>
            </h1>

            <p>
              Monitor civic complaints, operational
              activity, and AI-powered intelligence
              from one place.
            </p>

          </div>

          <NavLink
            to="/admin/profile"
            className="admin-header-account"
          >
            <div className="admin-account-avatar">
              {getInitial()}
            </div>

            <div className="admin-account-details">
              <strong>
                {user?.full_name || "Administrator"}
              </strong>

              <span>
                Administrator
              </span>
            </div>

            <span className="admin-account-arrow">
              →
            </span>
          </NavLink>

        </header>

        {error && (
          <div
            className="admin-error"
            role="alert"
          >
            <span className="admin-error-icon">
              !
            </span>

            <div>
              <strong>
                Dashboard unavailable
              </strong>

              <span>{error}</span>
            </div>
          </div>
        )}

        {/* OVERVIEW */}
        <section className="admin-overview-section">

          <div className="admin-section-heading">
            <div>
              <span>CIVIC OPERATIONS</span>
              <h2>Overview</h2>
            </div>

            <div className="admin-live-status">
              <span></span>
              <span>Live data</span>
            </div>
          </div>

          <div className="admin-stat-grid">

            <article className="admin-stat-card admin-stat-featured">
              <div className="admin-stat-top">
                <span>TOTAL COMPLAINTS</span>
                <div className="admin-stat-icon">◈</div>
              </div>

              <strong>
                {loading ? "—" : totalComplaints}
              </strong>

              <p>All complaints received</p>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span>OPEN</span>
                <div className="admin-stat-icon">◌</div>
              </div>

              <strong>
                {loading ? "—" : openComplaints}
              </strong>

              <p>Currently requiring action</p>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span>RESOLVED</span>
                <div className="admin-stat-icon">✓</div>
              </div>

              <strong>
                {loading ? "—" : resolved}
              </strong>

              <p>Successfully resolved</p>
            </article>

            <article className="admin-stat-card admin-stat-alert">
              <div className="admin-stat-top">
                <span>HIGH PRIORITY</span>
                <div className="admin-stat-icon">!</div>
              </div>

              <strong>
                {loading ? "—" : highPriority}
              </strong>

              <p>Require priority attention</p>
            </article>

          </div>
        </section>

        {/* DASHBOARD GRID */}
        <section className="admin-dashboard-grid">

          <article className="admin-panel">

            <div className="admin-panel-heading">
              <div>
                <span>COMPLAINT PIPELINE</span>
                <h2>Status overview</h2>
              </div>

              {/* FIXED VIEW ALL */}
              <NavLink
                to="/admin/complaints"
                className="admin-panel-link"
              >
                View all
                <span>→</span>
              </NavLink>
            </div>

            <div className="admin-status-list">

              <div className="admin-status-row">
                <div className="admin-status-label">
                  <span className="admin-status-dot submitted"></span>
                  <strong>Submitted</strong>
                </div>

                <span className="admin-status-value">
                  {loading ? "—" : submitted}
                </span>
              </div>

              <div className="admin-status-row">
                <div className="admin-status-label">
                  <span className="admin-status-dot review"></span>
                  <strong>Under review</strong>
                </div>

                <span className="admin-status-value">
                  {loading ? "—" : underReview}
                </span>
              </div>

              <div className="admin-status-row">
                <div className="admin-status-label">
                  <span className="admin-status-dot progress"></span>
                  <strong>In progress</strong>
                </div>

                <span className="admin-status-value">
                  {loading ? "—" : inProgress}
                </span>
              </div>

              <div className="admin-status-row">
                <div className="admin-status-label">
                  <span className="admin-status-dot resolved"></span>
                  <strong>Resolved</strong>
                </div>

                <span className="admin-status-value">
                  {loading ? "—" : resolved}
                </span>
              </div>

              <div className="admin-status-row">
                <div className="admin-status-label">
                  <span className="admin-status-dot closed"></span>
                  <strong>Closed</strong>
                </div>

                <span className="admin-status-value">
                  {loading ? "—" : closed}
                </span>
              </div>

            </div>
          </article>

          <article className="admin-panel admin-resolution-panel">

            <div className="admin-panel-heading">
              <div>
                <span>SERVICE PERFORMANCE</span>
                <h2>Resolution</h2>
              </div>

              <div className="admin-performance-icon">
                ✓
              </div>
            </div>

            <div className="admin-resolution-content">

              <div className="admin-resolution-number">
                <strong>
                  {loading
                    ? "—"
                    : `${resolutionRate}%`}
                </strong>

                <span>
                  resolved or closed
                </span>
              </div>

              <div className="admin-progress-track">
                <div
                  className="admin-progress-fill"
                  style={{
                    width: `${resolutionRate}%`,
                  }}
                />
              </div>

              <p>
                {resolutionRate >= 75
                  ? "Strong resolution performance across civic operations."
                  : resolutionRate >= 40
                  ? "Resolution activity is progressing across current complaints."
                  : "Current complaints require continued administrative attention."}
              </p>

            </div>
          </article>

          <article className="admin-panel admin-priority-panel">

            <div className="admin-panel-heading">
              <div>
                <span>ATTENTION LEVEL</span>
                <h2>Priority distribution</h2>
              </div>
            </div>

            <div className="admin-priority-list">

              <div className="admin-priority-row">
                <div className="admin-priority-label">
                  <span className="priority-marker high"></span>
                  <span>High</span>
                </div>

                <strong>
                  {loading ? "—" : highPriority}
                </strong>
              </div>

              <div className="admin-priority-row">
                <div className="admin-priority-label">
                  <span className="priority-marker medium"></span>
                  <span>Medium</span>
                </div>

                <strong>
                  {loading ? "—" : mediumPriority}
                </strong>
              </div>

              <div className="admin-priority-row">
                <div className="admin-priority-label">
                  <span className="priority-marker low"></span>
                  <span>Low</span>
                </div>

                <strong>
                  {loading ? "—" : lowPriority}
                </strong>
              </div>

            </div>
          </article>

          <article className="admin-panel admin-intelligence-panel">

            <div className="admin-intelligence-glow"></div>

            <div className="admin-panel-heading">
              <div>
                <span>CIVICMIND INTELLIGENCE</span>
                <h2>Administrative view</h2>
              </div>

              <div className="admin-ai-mark">
                ✦
              </div>
            </div>

            <p className="admin-intelligence-text">
              CivicMind AI organizes citizen
              complaints by status, priority,
              category, and department so
              administrators can identify
              operational issues faster.
            </p>

            <NavLink
              to="/admin/insights"
              className="admin-intelligence-button"
            >
              Explore AI insights
              <span>→</span>
            </NavLink>

          </article>

        </section>

        {/* QUICK ACTIONS */}
        <section className="admin-quick-section">

          <div className="admin-section-heading">
            <div>
              <span>ADMINISTRATION</span>
              <h2>Quick actions</h2>
            </div>
          </div>

          <div className="admin-action-grid">

            <NavLink
              to="/admin/complaints"
              className="admin-action-card"
            >
              <span className="admin-action-icon">
                ▤
              </span>

              <span className="admin-action-content">
                <strong>Manage complaints</strong>
                <span>
                  Review and update citizen reports.
                </span>
              </span>

              <span className="admin-action-arrow">
                →
              </span>
            </NavLink>

            <NavLink
              to="/admin/analytics"
              className="admin-action-card"
            >
              <span className="admin-action-icon">
                ◌
              </span>

              <span className="admin-action-content">
                <strong>View analytics</strong>
                <span>
                  Explore operational complaint data.
                </span>
              </span>

              <span className="admin-action-arrow">
                →
              </span>
            </NavLink>

            <NavLink
              to="/admin/insights"
              className="admin-action-card"
            >
              <span className="admin-action-icon">
                ✦
              </span>

              <span className="admin-action-content">
                <strong>AI insights</strong>
                <span>
                  Generate administrative intelligence.
                </span>
              </span>

              <span className="admin-action-arrow">
                →
              </span>
            </NavLink>

          </div>
        </section>

        <footer className="admin-footer">

          <div className="admin-footer-brand">
            <strong>CivicMind AI</strong>
            <span>
              Intelligence for better communities.
            </span>
          </div>

          <div className="admin-footer-status">
            <span></span>
            Administrative portal active
          </div>

        </footer>

      </main>
    </div>
  );
}

export default AdminDashboard;