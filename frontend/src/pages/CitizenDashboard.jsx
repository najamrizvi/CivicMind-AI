import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";

import "./CitizenDashboard.css";

function CitizenDashboard() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleReportIssue = () => {
    navigate("/report");
  };

  const handleTrackIssue = () => {
    navigate("/tracking");
  };

  return (
    <div className="citizen-dashboard">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="citizen-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">C</div>

          <div className="sidebar-brand-name">
            <strong>CivicMind</strong>
            <span>AI</span>
          </div>
        </div>

        <div className="sidebar-label">
          CITIZEN PORTAL
        </div>

        <nav className="sidebar-navigation">
          <button
            type="button"
            className="sidebar-link active"
          >
            <span className="sidebar-link-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={handleReportIssue}
          >
            <span className="sidebar-link-icon">＋</span>
            <span>Report Issue</span>
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={() => navigate("/complaints")}
          >
            <span className="sidebar-link-icon">▤</span>
            <span>My Complaints</span>
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={handleTrackIssue}
          >
            <span className="sidebar-link-icon">⌁</span>
            <span>Track Issue</span>
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={() => navigate("/profile")}
          >
            <span className="sidebar-link-icon">◯</span>
            <span>Profile</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help-card">
            <div className="help-icon">✦</div>

            <div>
              <strong>CivicMind AI</strong>
              <p>
                Intelligence for better communities.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="citizen-main">
        {/* ===================================================
            TOPBAR
        =================================================== */}

        <header className="citizen-topbar">
          <div className="topbar-title">
            <span className="topbar-label">
              CITIZEN DASHBOARD
            </span>

            <h1>
              Your civic
              <span> intelligence.</span>
            </h1>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
            >
              ♢
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile">
              <div className="user-avatar">
                {user?.full_name
                  ? user.full_name
                      .charAt(0)
                      .toUpperCase()
                  : "C"}
              </div>

              <div className="user-info">
                <strong>
                  {user?.full_name || "Citizen"}
                </strong>

                <span>
                  Citizen
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================
            WELCOME SECTION
        =================================================== */}

        <section className="welcome-section">
          <div className="welcome-content">
            <span className="welcome-label">
              WELCOME BACK
            </span>

            <h2>
              Hello,{" "}
              <span>
                {user?.full_name || "Citizen"}
              </span>
              .
            </h2>

            <p>
              Together, we can make our community
              smarter, cleaner and better.
            </p>
          </div>

          <div className="welcome-decoration">
            <div className="welcome-glow"></div>

            <div className="welcome-crystal">
              <span>C</span>
              <small>AI</small>
            </div>
          </div>
        </section>

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">
                TOTAL REPORTS
              </span>

              <div className="stat-icon">
                ◇
              </div>
            </div>

            <strong className="stat-number">
              08
            </strong>

            <span className="stat-description">
              Civic issues reported
            </span>
          </article>

          <article className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">
                PENDING
              </span>

              <div className="stat-icon pending">
                ◷
              </div>
            </div>

            <strong className="stat-number">
              03
            </strong>

            <span className="stat-description">
              Awaiting resolution
            </span>
          </article>

          <article className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">
                IN PROGRESS
              </span>

              <div className="stat-icon progress">
                ◌
              </div>
            </div>

            <strong className="stat-number">
              02
            </strong>

            <span className="stat-description">
              Being handled
            </span>
          </article>

          <article className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">
                RESOLVED
              </span>

              <div className="stat-icon resolved">
                ✓
              </div>
            </div>

            <strong className="stat-number">
              05
            </strong>

            <span className="stat-description">
              Successfully resolved
            </span>
          </article>
        </section>

        {/* ===================================================
            DASHBOARD GRID
        =================================================== */}

        <section className="dashboard-grid">
          {/* =================================================
              RECENT COMPLAINTS
          ================================================= */}

          <div className="dashboard-panel complaints-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">
                  ACTIVITY
                </span>

                <h3>
                  Recent complaints
                </h3>
              </div>

              <button
                type="button"
                className="view-all-button"
                onClick={() =>
                  navigate("/complaints")
                }
              >
                View all →
              </button>
            </div>

            <div className="complaints-list">
              <div className="complaint-row">
                <div className="complaint-main">
                  <div className="complaint-icon">
                    ◈
                  </div>

                  <div>
                    <strong>
                      Road damage
                    </strong>

                    <span>
                      Main Street · 2 hours ago
                    </span>
                  </div>
                </div>

                <div className="complaint-status high">
                  High priority
                </div>

                <div className="status-badge pending-badge">
                  Pending
                </div>
              </div>

              <div className="complaint-row">
                <div className="complaint-main">
                  <div className="complaint-icon">
                    ✦
                  </div>

                  <div>
                    <strong>
                      Street light issue
                    </strong>

                    <span>
                      Green Avenue · Yesterday
                    </span>
                  </div>
                </div>

                <div className="complaint-status medium">
                  Medium priority
                </div>

                <div className="status-badge progress-badge">
                  In progress
                </div>
              </div>

              <div className="complaint-row">
                <div className="complaint-main">
                  <div className="complaint-icon">
                    ≋
                  </div>

                  <div>
                    <strong>
                      Waste collection
                    </strong>

                    <span>
                      Block B · 3 days ago
                    </span>
                  </div>
                </div>

                <div className="complaint-status low">
                  Low priority
                </div>

                <div className="status-badge resolved-badge">
                  Resolved
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <div className="dashboard-panel actions-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">
                  QUICK ACTIONS
                </span>

                <h3>
                  What would you like to do?
                </h3>
              </div>
            </div>

            <button
              type="button"
              className="action-card primary-action"
              onClick={handleReportIssue}
            >
              <div className="action-icon">
                ＋
              </div>

              <div className="action-content">
                <strong>
                  Report a civic issue
                </strong>

                <span>
                  Tell us about a problem in
                  your community.
                </span>
              </div>

              <span className="action-arrow">
                →
              </span>
            </button>

            <button
              type="button"
              className="action-card"
              onClick={handleTrackIssue}
            >
              <div className="action-icon">
                ⌁
              </div>

              <div className="action-content">
                <strong>
                  Track your complaint
                </strong>

                <span>
                  Check the latest status of
                  your report.
                </span>
              </div>

              <span className="action-arrow">
                →
              </span>
            </button>
          </div>
        </section>

        {/* ===================================================
            AI INSIGHT
        =================================================== */}

        <section className="ai-insight-card">
          <div className="ai-insight-icon">
            ✦
          </div>

          <div className="ai-insight-content">
            <span>
              CIVICMIND AI INSIGHT
            </span>

            <h3>
              Your reports help improve
              your community.
            </h3>

            <p>
              Every complaint contributes to
              better civic intelligence. CivicMind
              AI analyzes reported issues to help
              identify patterns and improve service
              delivery.
            </p>
          </div>

          <div className="ai-insight-orbit">
            <div></div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CitizenDashboard;