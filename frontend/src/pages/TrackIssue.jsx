import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import complaintService from "../services/complaintService";

import "./TrackIssue.css";

function TrackIssue() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [trackingId, setTrackingId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =========================================================
  // NORMALIZE STATUS
  // =========================================================

  const normalizeStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    const normalized = String(status || "")
      .toLowerCase()
      .replace(/_/g, " ");

    if (
      normalized.includes("closed") ||
      normalized.includes("resolved") ||
      normalized.includes("completed")
    ) {
      return "track-status resolved";
    }

    if (
      normalized.includes("progress") ||
      normalized.includes("assigned")
    ) {
      return "track-status progress";
    }

    if (
      normalized.includes("rejected") ||
      normalized.includes("cancelled")
    ) {
      return "track-status rejected";
    }

    return "track-status pending";
  };

  // =========================================================
  // PRIORITY CLASS
  // =========================================================

  const getPriorityClass = (priority) => {
    const normalized = String(priority || "").toLowerCase();

    if (normalized === "high") {
      return "track-priority high";
    }

    if (normalized === "low") {
      return "track-priority low";
    }

    return "track-priority medium";
  };

  // =========================================================
  // TRACK COMPLAINT
  // =========================================================

  const handleTrack = async (event) => {
    event.preventDefault();

    setError("");
    setComplaint(null);

    const cleanTrackingId = trackingId.trim();

    if (!cleanTrackingId) {
      setError("Please enter a complaint ID.");
      return;
    }

    setLoading(true);

    try {
      const data =
        await complaintService.trackComplaint(
          cleanTrackingId
        );

      setComplaint(data);
    } catch (requestError) {
      console.error(
        "Complaint tracking error:",
        requestError
      );

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
          "You are not authorized to track this complaint."
        );

        return;
      }

      if (status === 404) {
        setError(
          "No complaint was found for this tracking number."
        );

        return;
      }

      if (status === 400) {
        setError(
          detail ||
            "Please provide a valid complaint ID."
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
        "Unable to retrieve complaint tracking information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // TIMELINE
  // =========================================================

  const getTimeline = () => {
    if (!complaint) {
      return [];
    }

    const normalizedStatus = String(
      complaint.status || ""
    )
      .toLowerCase()
      .replace(/_/g, " ");

    // -------------------------------------------------------
    // RESOLUTION / FINAL STATUS
    // -------------------------------------------------------

    const isResolved =
      normalizedStatus.includes("resolved") ||
      normalizedStatus.includes("completed") ||
      normalizedStatus.includes("closed");

    // -------------------------------------------------------
    // ACTIVE WORK STATUS
    // -------------------------------------------------------

    const isInProgress =
      normalizedStatus.includes("progress") ||
      normalizedStatus.includes("assigned");

    // -------------------------------------------------------
    // AI ANALYSIS
    // -------------------------------------------------------

    const hasAnalysis =
      Boolean(
        complaint.category ||
        complaint.priority ||
        complaint.department
      );

    // -------------------------------------------------------
    // DEPARTMENT ASSIGNMENT
    // -------------------------------------------------------

    const hasDepartment =
      Boolean(complaint.department);

    // -------------------------------------------------------
    // TIMELINE
    // -------------------------------------------------------

    return [
      {
        key: "submitted",

        title: "Complaint submitted",

        completed: true,

        current: false,

        time: formatDateTime(
          complaint.submitted_at
        ),

        description:
          "Your complaint was successfully submitted to CivicMind AI.",
      },

      {
        key: "analysis",

        title: "AI analysis completed",

        completed: hasAnalysis,

        current: false,

        time: hasAnalysis
          ? formatDateTime(
              complaint.submitted_at
            )
          : "Awaiting analysis",

        description: hasAnalysis
          ? "CivicMind AI classified your complaint and determined its priority automatically."
          : "CivicMind AI is processing your complaint.",
      },

      {
        key: "department",

        title: "Assigned to department",

        completed:
          hasDepartment &&
          (isInProgress || isResolved),

        current:
          hasDepartment &&
          !isResolved &&
          !isInProgress,

        time: hasDepartment
          ? formatDateTime(
              complaint.last_updated
            )
          : "Awaiting assignment",

        description: hasDepartment
          ? `Your complaint has been routed to ${complaint.department}.`
          : "Your complaint is awaiting assignment to the relevant civic department.",
      },

      {
        key: "resolution",

        title: "Resolution",

        completed: isResolved,

        current: isResolved,

        time: isResolved
          ? formatDateTime(
              complaint.last_updated
            )
          : "Awaiting completion",

        description: isResolved
          ? normalizedStatus.includes("closed")
            ? "Your complaint has been resolved and the complaint record has been closed."
            : "Your complaint has been marked as resolved."
          : "The complaint will be marked resolved once the responsible department completes the required action.",
      },
    ];
  };

  const timeline = getTimeline();

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="track-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="track-sidebar">

        <div className="track-sidebar-brand">

          <div className="track-sidebar-brand-icon">
            C
          </div>

          <div className="track-sidebar-brand-name">
            <strong>CivicMind</strong>
            <span>AI</span>
          </div>

        </div>

        <div className="track-sidebar-label">
          CITIZEN PORTAL
        </div>

        <nav className="track-sidebar-navigation">

          <button
            type="button"
            className="track-sidebar-link"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span className="track-sidebar-link-icon">
              ⌂
            </span>

            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="track-sidebar-link"
            onClick={() =>
              navigate("/report")
            }
          >
            <span className="track-sidebar-link-icon">
              ＋
            </span>

            <span>Report Issue</span>
          </button>

          <button
            type="button"
            className="track-sidebar-link"
            onClick={() =>
              navigate("/complaints")
            }
          >
            <span className="track-sidebar-link-icon">
              ◇
            </span>

            <span>My Complaints</span>
          </button>

          <button
            type="button"
            className="track-sidebar-link active"
          >
            <span className="track-sidebar-link-icon">
              ◉
            </span>

            <span>Track Issue</span>
          </button>

          <button
            type="button"
            className="track-sidebar-link"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span className="track-sidebar-link-icon">
              ◯
            </span>

            <span>Profile</span>
          </button>

        </nav>

        <div className="track-sidebar-bottom">

          <div className="track-sidebar-help">

            <div className="track-help-icon">
              ✦
            </div>

            <div>
              <strong>CivicMind AI</strong>

              <p>
                Intelligence for better communities.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="track-logout"
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

      <main className="track-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="track-header">

          <div>

            <span className="track-header-label">
              CIVICMIND AI · TRACKING
            </span>

            <h1>
              Track your
              <span> issue.</span>
            </h1>

            <p>
              Follow the progress of your civic complaint
              and stay informed about every step toward
              resolution.
            </p>

          </div>

        </header>


        {/* ===================================================
            SEARCH CARD
        =================================================== */}

        <section className="track-search-card">

          <span className="track-search-label">
            COMPLAINT TRACKING
          </span>

          <h2 className="track-search-title">
            Enter your complaint ID
          </h2>

          <form
            className="track-search-form"
            onSubmit={handleTrack}
          >

            <input
              className="track-search-input"
              type="text"
              value={trackingId}
              onChange={(event) =>
                setTrackingId(
                  event.target.value
                )
              }
              placeholder="e.g. CMA-20260828-064A78"
              disabled={loading}
              autoComplete="off"
            />

            <button
              type="submit"
              className="track-search-button"
              disabled={loading}
            >
              {loading
                ? "Tracking..."
                : "Track complaint →"}
            </button>

          </form>

          {error && (
            <div className="track-error">
              {error}
            </div>
          )}

        </section>


        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {!complaint &&
          !loading &&
          !error && (

            <section className="track-result-card track-empty-result">

              <div className="track-empty-icon">
                ◉
              </div>

              <span className="track-result-label">
                READY TO TRACK
              </span>

              <h2>
                Enter your complaint ID
              </h2>

              <p>
                Enter the tracking number from your
                CivicMind AI complaint receipt to view
                its current status and journey.
              </p>

            </section>

          )}


        {/* ===================================================
            LOADING STATE
        =================================================== */}

        {loading && (

          <section className="track-result-card track-loading-result">

            <div className="track-loading-spinner">
              ◌
            </div>

            <span className="track-result-label">
              CIVICMIND AI · SEARCHING
            </span>

            <h2>
              Retrieving your complaint
            </h2>

            <p>
              Checking the CivicMind AI complaint
              records securely.
            </p>

          </section>

        )}


        {/* ===================================================
            TRACKING RESULT
        =================================================== */}

        {complaint &&
          !loading && (

            <section className="track-result-card">

              {/* =============================================
                  RESULT HEADER
              ============================================= */}

              <div className="track-result-header">

                <div>

                  <span className="track-result-label">
                    COMPLAINT STATUS
                  </span>

                  <h2>
                    {complaint.category ||
                      "Civic complaint"}
                  </h2>

                </div>

                <span
                  className={getStatusClass(
                    complaint.status
                  )}
                >
                  {normalizeStatus(
                    complaint.status
                  )}
                </span>

              </div>


              {/* =============================================
                  TRACKING NUMBER
              ============================================= */}

              <div className="track-number-row">

                <div>

                  <span>
                    TRACKING NUMBER
                  </span>

                  <strong>
                    {complaint.tracking_number}
                  </strong>

                </div>

                <div>

                  <span>
                    DATABASE ID
                  </span>

                  <strong>
                    #{complaint.complaint_id}
                  </strong>

                </div>

              </div>


              {/* =============================================
                  INFORMATION
              ============================================= */}

              <div className="track-info-grid">

                <div className="track-info-item">

                  <span>
                    CATEGORY
                  </span>

                  <strong>
                    {complaint.category ||
                      "Not classified"}
                  </strong>

                </div>

                <div className="track-info-item">

                  <span>
                    PRIORITY
                  </span>

                  <strong
                    className={getPriorityClass(
                      complaint.priority
                    )}
                  >
                    {complaint.priority
                      ? String(
                          complaint.priority
                        ).toUpperCase()
                      : "Not assigned"}
                  </strong>

                </div>

                <div className="track-info-item">

                  <span>
                    DEPARTMENT
                  </span>

                  <strong>
                    {complaint.department ||
                      "Awaiting assignment"}
                  </strong>

                </div>

              </div>


              {/* =============================================
                  COMPLAINT DETAILS
              ============================================= */}

              <div className="track-description">

                <span>
                  COMPLAINT DETAILS
                </span>

                <p>
                  {complaint.complaint_text}
                </p>

              </div>


              {/* =============================================
                  DATES
              ============================================= */}

              <div className="track-date-grid">

                <div>

                  <span>
                    SUBMITTED
                  </span>

                  <strong>
                    {formatDateTime(
                      complaint.submitted_at
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    LAST UPDATED
                  </span>

                  <strong>
                    {formatDateTime(
                      complaint.last_updated
                    )}
                  </strong>

                </div>

              </div>


              {/* =============================================
                  TIMELINE
              ============================================= */}

              <h3 className="track-timeline-title">
                Complaint journey
              </h3>

              <div className="track-timeline">

                {timeline.map(
                  (item, index) => (

                    <div
                      key={item.key}
                      className={`timeline-item ${
                        item.completed
                          ? "completed"
                          : ""
                      } ${
                        item.current
                          ? "current"
                          : ""
                      }`}
                    >

                      <div className="timeline-dot">

                        {item.completed
                          ? "✓"
                          : item.current
                          ? "◌"
                          : "○"}

                      </div>

                      <div className="timeline-content">

                        <strong>
                          {item.title}
                        </strong>

                        <span>
                          {item.time}
                        </span>

                        <p>
                          {item.description}
                        </p>

                      </div>

                      {index <
                        timeline.length - 1 && (
                        <div className="timeline-line"></div>
                      )}

                    </div>

                  )
                )}

              </div>


              {/* =============================================
                  FOOTER STATUS
              ============================================= */}

              <div className="track-result-footer">

                <span>
                  CIVICMIND AI · COMPLAINT
                  {complaint.complaint_id
                    ? ` #${complaint.complaint_id}`
                    : ""}
                </span>

                <span>
                  Tracking securely
                </span>

              </div>

            </section>

          )}


        {/* ===================================================
            FOOTER DETAIL
        =================================================== */}

        <div className="track-footer-line"></div>

      </main>

    </div>
  );
}

export default TrackIssue;