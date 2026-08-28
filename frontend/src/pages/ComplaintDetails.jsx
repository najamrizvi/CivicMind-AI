import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import api from "../api/api";

import "./ComplaintDetails.css";

function ComplaintDetails() {
  const navigate = useNavigate();
  const { complaintId } = useParams();

  const { user, logout } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/complaints/${complaintId}`
        );

        setComplaint(response.data);
      } catch (requestError) {
        console.error(
          "Unable to load complaint:",
          requestError
        );

        if (
          requestError.response?.status === 404
        ) {
          setError(
            "This complaint could not be found."
          );
        } else {
          setError(
            "Unable to load complaint details. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complaintId]);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatPriority = (priority) => {
    if (!priority) {
      return "Unknown";
    }

    return priority.toUpperCase();
  };

  const getPriorityClass = (priority) => {
    if (!priority) {
      return "";
    }

    const normalized =
      priority.toLowerCase();

    if (normalized === "high") {
      return "details-priority-high";
    }

    if (normalized === "medium") {
      return "details-priority-medium";
    }

    if (normalized === "low") {
      return "details-priority-low";
    }

    return "";
  };

  if (loading) {
    return (
      <div className="complaint-details-page">
        <aside className="details-sidebar">
          <button
            type="button"
            className="details-brand"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <div className="details-brand-icon">
              C
            </div>

            <div className="details-brand-name">
              <strong>CivicMind</strong>
              <span>AI</span>
            </div>
          </button>

          <div className="details-sidebar-label">
            CITIZEN PORTAL
          </div>

          <nav className="details-navigation">
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <span>⌂</span>
              Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/report")
              }
            >
              <span>＋</span>
              Report Issue
            </button>

            <button
              type="button"
              className="active"
              onClick={() =>
                navigate("/complaints")
              }
            >
              <span>▤</span>
              My Complaints
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/tracking")
              }
            >
              <span>⌁</span>
              Track Issue
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
            >
              <span>◯</span>
              Profile
            </button>
          </nav>
        </aside>

        <main className="details-main">
          <div className="details-loading">
            <div className="details-loading-orbit">
              <span>✦</span>
            </div>

            <span>
              CIVICMIND AI
            </span>

            <h2>
              Loading complaint details...
            </h2>

            <p>
              Retrieving your complaint record.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="complaint-details-page">
        <aside className="details-sidebar">
          <button
            type="button"
            className="details-brand"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <div className="details-brand-icon">
              C
            </div>

            <div className="details-brand-name">
              <strong>CivicMind</strong>
              <span>AI</span>
            </div>
          </button>

          <div className="details-sidebar-label">
            CITIZEN PORTAL
          </div>

          <nav className="details-navigation">
            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <span>⌂</span>
              Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/report")
              }
            >
              <span>＋</span>
              Report Issue
            </button>

            <button
              type="button"
              className="active"
              onClick={() =>
                navigate("/complaints")
              }
            >
              <span>▤</span>
              My Complaints
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/tracking")
              }
            >
              <span>⌁</span>
              Track Issue
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
            >
              <span>◯</span>
              Profile
            </button>
          </nav>
        </aside>

        <main className="details-main">
          <div className="details-error">
            <div className="details-error-icon">
              !
            </div>

            <span>
              CIVICMIND AI
            </span>

            <h2>
              Complaint unavailable
            </h2>

            <p>
              {error ||
                "The requested complaint could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/complaints")
              }
            >
              ← Back to complaints
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="complaint-details-page">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="details-sidebar">
        <button
          type="button"
          className="details-brand"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <div className="details-brand-icon">
            C
          </div>

          <div className="details-brand-name">
            <strong>CivicMind</strong>
            <span>AI</span>
          </div>
        </button>

        <div className="details-sidebar-label">
          CITIZEN PORTAL
        </div>

        <nav className="details-navigation">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/report")
            }
          >
            <span>＋</span>
            Report Issue
          </button>

          <button
            type="button"
            className="active"
            onClick={() =>
              navigate("/complaints")
            }
          >
            <span>▤</span>
            My Complaints
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/tracking")
            }
          >
            <span>⌁</span>
            Track Issue
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>◯</span>
            Profile
          </button>
        </nav>

        <div className="details-sidebar-bottom">
          <div className="details-user">
            <div className="details-user-avatar">
              {user?.full_name
                ? user.full_name
                    .charAt(0)
                    .toUpperCase()
                : "C"}
            </div>

            <div>
              <strong>
                {user?.full_name || "Citizen"}
              </strong>

              <span>
                Citizen
              </span>
            </div>
          </div>

          <button
            type="button"
            className="details-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="details-main">
        {/* ===================================================
            TOPBAR
        =================================================== */}

        <header className="details-topbar">
          <div>
            <span className="details-topbar-label">
              COMPLAINT RECORD
            </span>

            <h1>
              Complaint <span>details.</span>
            </h1>

            <p>
              Complete information about your
              submitted civic report.
            </p>
          </div>

          <button
            type="button"
            className="details-back-button"
            onClick={() =>
              navigate("/complaints")
            }
          >
            ← My complaints
          </button>
        </header>

        {/* ===================================================
            RECEIPT HERO
        =================================================== */}

        <section className="details-receipt-card">
          <div className="details-receipt-icon">
            ✦
          </div>

          <div className="details-receipt-content">
            <span>
              OFFICIAL CIVICMIND AI RECORD
            </span>

            <h2>
              {complaint.receipt_number ||
                `Complaint #${complaint.id}`}
            </h2>

            <p>
              Your complaint has been securely
              recorded in the CivicMind AI system.
            </p>
          </div>

          <div className="details-record-id">
            <span>COMPLAINT ID</span>

            <strong>
              {complaint.id}
            </strong>
          </div>
        </section>

        {/* ===================================================
            STATUS / PRIORITY
        =================================================== */}

        <section className="details-status-grid">
          <article className="details-info-card">
            <span>
              STATUS
            </span>

            <strong className="details-status-value">
              {formatStatus(
                complaint.status
              )}
            </strong>

            <small>
              Current complaint state
            </small>
          </article>

          <article className="details-info-card">
            <span>
              PRIORITY
            </span>

            <strong
              className={`details-priority-value ${getPriorityClass(
                complaint.priority
              )}`}
            >
              {formatPriority(
                complaint.priority
              )}
            </strong>

            <small>
              AI-assigned priority
            </small>
          </article>

          <article className="details-info-card">
            <span>
              CATEGORY
            </span>

            <strong>
              {complaint.category ||
                "Not available"}
            </strong>

            <small>
              AI classification
            </small>
          </article>

          <article className="details-info-card">
            <span>
              DEPARTMENT
            </span>

            <strong>
              {complaint.department ||
                "Not assigned"}
            </strong>

            <small>
              Responsible department
            </small>
          </article>
        </section>

        {/* ===================================================
            COMPLAINT CONTENT
        =================================================== */}

        <section className="details-content-grid">
          <article className="details-complaint-card">
            <div className="details-section-heading">
              <span>
                REPORT CONTENT
              </span>

              <h2>
                Your complaint
              </h2>
            </div>

            <div className="details-complaint-text">
              {complaint.complaint_text ||
                "No complaint description available."}
            </div>
          </article>

          <article className="details-citizen-card">
            <div className="details-section-heading">
              <span>
                CITIZEN
              </span>

              <h2>
                Submitted by
              </h2>
            </div>

            <div className="details-citizen-profile">
              <div className="details-citizen-avatar">
                {user?.full_name
                  ? user.full_name
                      .charAt(0)
                      .toUpperCase()
                  : "C"}
              </div>

              <div>
                <strong>
                  {user?.full_name ||
                    "Citizen"}
                </strong>

                <span>
                  {user?.email ||
                    "Authenticated citizen"}
                </span>
              </div>
            </div>
          </article>
        </section>

        {/* ===================================================
            RECORD TIMELINE
        =================================================== */}

        <section className="details-timeline-card">
          <div className="details-section-heading">
            <span>
              RECORD TIMELINE
            </span>

            <h2>
              Complaint activity
            </h2>
          </div>

          <div className="details-timeline">
            <div className="timeline-item">
              <div className="timeline-marker">
                ✓
              </div>

              <div>
                <strong>
                  Complaint submitted
                </strong>

                <p>
                  Your complaint was successfully
                  received by CivicMind AI.
                </p>

                <span>
                  {formatDate(
                    complaint.created_at
                  )}
                </span>
              </div>
            </div>

            <div className="timeline-line"></div>

            <div className="timeline-item">
              <div className="timeline-marker muted">
                ◌
              </div>

              <div>
                <strong>
                  Last record update
                </strong>

                <p>
                  This is the latest update
                  recorded for your complaint.
                </p>

                <span>
                  {formatDate(
                    complaint.updated_at
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            FOOTER ACTIONS
        =================================================== */}

        <section className="details-actions">
          <button
            type="button"
            className="details-secondary-button"
            onClick={() =>
              navigate("/complaints")
            }
          >
            ← Back to complaints
          </button>

          <button
            type="button"
            className="details-primary-button"
            onClick={() =>
              navigate("/tracking")
            }
          >
            Track this complaint
            <span>→</span>
          </button>
        </section>

        <p className="details-footer-note">
          CivicMind AI — Intelligence for
          better communities.
        </p>
      </main>
    </div>
  );
}

export default ComplaintDetails;