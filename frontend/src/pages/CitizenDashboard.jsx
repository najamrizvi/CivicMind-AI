import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import complaintService from "../services/complaintService";

import "./CitizenDashboard.css";

// =========================================================
// STATUS HELPERS
// =========================================================

const normalizeStatus = (status) => {
  if (!status) {
    return "";
  }

  return String(status)
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
};

const isResolvedStatus = (status) => {
  const normalized = normalizeStatus(status);

  return (
    normalized.includes("resolved") ||
    normalized.includes("completed") ||
    normalized.includes("closed")
  );
};

const isInProgressStatus = (status) => {
  const normalized = normalizeStatus(status);

  return (
    normalized.includes("in progress") ||
    normalized.includes("progress") ||
    normalized.includes("assigned") ||
    normalized.includes("processing") ||
    normalized.includes("under review")
  );
};

const isPendingStatus = (status) => {
  return (
    !isResolvedStatus(status) &&
    !isInProgressStatus(status)
  );
};

// =========================================================
// PRIORITY HELPERS
// =========================================================

const normalizePriority = (priority) => {
  return String(priority || "")
    .trim()
    .toLowerCase();
};

const getPriorityClass = (priority) => {
  const normalized = normalizePriority(priority);

  if (normalized === "high") {
    return "complaint-status high";
  }

  if (normalized === "low") {
    return "complaint-status low";
  }

  return "complaint-status medium";
};

const getPriorityLabel = (priority) => {
  if (!priority) {
    return "Priority not assigned";
  }

  const normalized = normalizePriority(priority);

  return `${normalized
    .charAt(0)
    .toUpperCase()}${normalized.slice(1)} priority`;
};

// =========================================================
// DATE HELPERS
// =========================================================

const parseDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const formatRelativeTime = (dateValue) => {
  const date = parseDate(dateValue);

  if (!date) {
    return "Date unavailable";
  }

  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const seconds = Math.floor(
    difference / 1000
  );

  if (seconds < 0) {
    return "Just now";
  }

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} ${
      hours === 1 ? "hour" : "hours"
    } ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  if (days < 30) {
    const weeks = Math.floor(
      days / 7
    );

    return `${weeks} ${
      weeks === 1 ? "week" : "weeks"
    } ago`;
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// =========================================================
// COMPLAINT HELPERS
// =========================================================

const getComplaintTitle = (complaint) => {
  if (complaint?.category) {
    return complaint.category;
  }

  const text = String(
    complaint?.complaint_text || ""
  ).trim();

  if (!text) {
    return "Civic complaint";
  }

  const firstSentence = text
    .split(/[.!?]/)[0]
    .trim();

  if (firstSentence.length <= 42) {
    return firstSentence;
  }

  return `${firstSentence.slice(0, 39)}...`;
};

const getComplaintPreview = (complaint) => {
  const text = String(
    complaint?.complaint_text || ""
  )
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return "Complaint details unavailable";
  }

  if (text.length <= 55) {
    return text;
  }

  return `${text.slice(0, 52)}...`;
};

const getComplaintIcon = (category) => {
  const normalized = String(
    category || ""
  ).toLowerCase();

  if (
    normalized.includes("road") ||
    normalized.includes("infrastructure")
  ) {
    return "◇";
  }

  if (
    normalized.includes("lighting") ||
    normalized.includes("light")
  ) {
    return "✦";
  }

  if (
    normalized.includes("waste") ||
    normalized.includes("garbage")
  ) {
    return "≋";
  }

  if (
    normalized.includes("water") ||
    normalized.includes("sanitation")
  ) {
    return "≈";
  }

  if (
    normalized.includes("drain") ||
    normalized.includes("sewer")
  ) {
    return "⌁";
  }

  if (
    normalized.includes("safety") ||
    normalized.includes("security")
  ) {
    return "◉";
  }

  if (
    normalized.includes("park") ||
    normalized.includes("environment")
  ) {
    return "✧";
  }

  return "◇";
};

// =========================================================
// COMPONENT
// =========================================================

function CitizenDashboard() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleReportIssue = () => {
    navigate("/report");
  };

  const handleTrackIssue = () => {
    navigate("/tracking");
  };

  const handleComplaints = () => {
    navigate("/complaints");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  // =========================================================
  // FETCH CITIZEN COMPLAINTS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadComplaints = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await complaintService.getMyComplaints();

        if (!mounted) {
          return;
        }

        const complaintList = Array.isArray(data)
          ? data
          : [];

        setComplaints(complaintList);
      } catch (requestError) {
        console.error(
          "Citizen dashboard complaint loading error:",
          requestError
        );

        if (!mounted) {
          return;
        }

        const status =
          requestError?.response?.status;

        const detail =
          requestError?.response?.data?.detail;

        if (status === 401) {
          setError(
            "Your session has expired. Please login again."
          );

          return;
        }

        if (status === 403) {
          setError(
            "You are not authorized to view your complaints."
          );

          return;
        }

        if (status === 404) {
          setError(
            "The complaints service could not be found. Please make sure the backend API is running the latest CivicMind AI version."
          );

          return;
        }

        if (detail) {
          setError(detail);
          return;
        }

        if (!requestError?.response) {
          setError(
            "Unable to connect to CivicMind AI. Please make sure the backend server is running."
          );

          return;
        }

        setError(
          "Unable to retrieve your complaints. Please try again."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadComplaints();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // DISPLAY STATUS
  // =========================================================

  const getDisplayStatus = (status) => {
    if (isResolvedStatus(status)) {
      return "Resolved";
    }

    if (isInProgressStatus(status)) {
      return "In progress";
    }

    if (isPendingStatus(status)) {
      return "Pending";
    }

    return "Pending";
  };

  // =========================================================
  // STATUS BADGE CLASS
  // =========================================================

  const getStatusBadgeClass = (status) => {
    if (isResolvedStatus(status)) {
      return "status-badge resolved-badge";
    }

    if (isInProgressStatus(status)) {
      return "status-badge progress-badge";
    }

    return "status-badge pending-badge";
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    let pending = 0;
    let inProgress = 0;
    let resolved = 0;

    complaints.forEach((complaint) => {
      if (
        isResolvedStatus(
          complaint?.status
        )
      ) {
        resolved += 1;
      } else if (
        isInProgressStatus(
          complaint?.status
        )
      ) {
        inProgress += 1;
      } else {
        pending += 1;
      }
    });

    return {
      total: complaints.length,
      pending,
      inProgress,
      resolved,
    };
  }, [complaints]);

  // =========================================================
  // RECENT COMPLAINTS
  // =========================================================

  const recentComplaints = useMemo(() => {
    return [...complaints]
      .sort((first, second) => {
        const firstDate = parseDate(
          first?.created_at
        );

        const secondDate = parseDate(
          second?.created_at
        );

        if (!firstDate && !secondDate) {
          return 0;
        }

        if (!firstDate) {
          return 1;
        }

        if (!secondDate) {
          return -1;
        }

        return (
          secondDate.getTime() -
          firstDate.getTime()
        );
      })
      .slice(0, 3);
  }, [complaints]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="citizen-dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="citizen-sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-brand-icon">
            C
          </div>

          <div className="sidebar-brand-name">
            <strong>
              CivicMind
            </strong>

            <span>
              AI
            </span>
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
            <span className="sidebar-link-icon">
              ◇
            </span>

            <span>
              Dashboard
            </span>
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={handleReportIssue}
          >
            <span className="sidebar-link-icon">
              +
            </span>

            <span>
              Report Issue
            </span>
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={handleComplaints}
          >
            <span className="sidebar-link-icon">
              ▤
            </span>

            <span>
              My Complaints
            </span>
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={handleTrackIssue}
          >
            <span className="sidebar-link-icon">
              ◉
            </span>

            <span>
              Track Issue
            </span>
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={handleProfile}
          >
            <span className="sidebar-link-icon">
              ◯
            </span>

            <span>
              Profile
            </span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-help-card">

            <div className="help-icon">
              ✦
            </div>

            <div>

              <strong>
                CivicMind AI
              </strong>

              <p>
                Intelligence for better
                communities.
              </p>

            </div>

          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span>
              ↪
            </span>

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
              <span>
                {" "}intelligence.
              </span>
            </h1>

          </div>

          <div className="topbar-actions">

            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
              title="Notifications"
            >
              ◇

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

              <span>
                C
              </span>

              <small>
                AI
              </small>

            </div>

          </div>

        </section>


        {/* ===================================================
            ERROR STATE
        =================================================== */}

        {error && (

          <section className="ai-insight-card dashboard-error-card">

            <div className="ai-insight-icon">
              !
            </div>

            <div className="ai-insight-content">

              <span>
                CIVICMIND AI
              </span>

              <h3>
                Unable to load your complaints.
              </h3>

              <p>
                {error}
              </p>

            </div>

          </section>

        )}


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
              {loading
                ? "—"
                : String(
                    statistics.total
                  ).padStart(2, "0")}
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
              {loading
                ? "—"
                : String(
                    statistics.pending
                  ).padStart(2, "0")}
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
              {loading
                ? "—"
                : String(
                    statistics.inProgress
                  ).padStart(2, "0")}
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
              {loading
                ? "—"
                : String(
                    statistics.resolved
                  ).padStart(2, "0")}
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
                onClick={handleComplaints}
              >
                View all →
              </button>

            </div>


            <div className="complaints-list">

              {loading && (

                <div className="complaint-row">

                  <div className="complaint-main">

                    <div className="complaint-icon">
                      ◌
                    </div>

                    <div>

                      <strong>
                        Loading complaints
                      </strong>

                      <span>
                        CivicMind AI is retrieving your reports...
                      </span>

                    </div>

                  </div>

                </div>

              )}


              {!loading &&
                !error &&
                recentComplaints.length === 0 && (

                  <div className="complaint-row">

                    <div className="complaint-main">

                      <div className="complaint-icon">
                        +
                      </div>

                      <div>

                        <strong>
                          No complaints yet
                        </strong>

                        <span>
                          Report your first civic issue to get started.
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      className="view-all-button"
                      onClick={handleReportIssue}
                    >
                      Report →
                    </button>

                  </div>

                )}


              {!loading &&
                recentComplaints.map(
                  (complaint) => (

                    <div
                      className="complaint-row"
                      key={
                        complaint.id
                      }
                    >

                      <div className="complaint-main">

                        <div className="complaint-icon">

                          {getComplaintIcon(
                            complaint.category
                          )}

                        </div>

                        <div>

                          <strong>
                            {getComplaintTitle(
                              complaint
                            )}
                          </strong>

                          <span>
                            {getComplaintPreview(
                              complaint
                            )}
                            {" · "}
                            {formatRelativeTime(
                              complaint.created_at
                            )}
                          </span>

                        </div>

                      </div>


                      <div
                        className={getPriorityClass(
                          complaint.priority
                        )}
                      >
                        {getPriorityLabel(
                          complaint.priority
                        )}
                      </div>


                      <div
                        className={getStatusBadgeClass(
                          complaint.status
                        )}
                      >
                        {getDisplayStatus(
                          complaint.status
                        )}
                      </div>

                    </div>

                  )
                )}

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
                +
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
                ◉
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