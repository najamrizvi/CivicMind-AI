import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import api from "../api/api";

import "./MyComplaints.css";

function MyComplaints() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ============================================================
  // FETCH MY COMPLAINTS
  // ============================================================

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/complaints/my");

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        setComplaints(data);
      } catch (requestError) {
        console.error(
          "Unable to load complaints:",
          requestError
        );

        setError(
          requestError?.response?.data?.detail ||
            "Unable to load your complaints. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // ============================================================
  // FORMAT STATUS
  // ============================================================

  const formatStatus = (status) => {
    if (!status) {
      return "Submitted";
    }

    const normalized = status
      .toString()
      .toLowerCase()
      .replace(/[_-]/g, " ");

    if (normalized === "in progress") {
      return "In Progress";
    }

    if (normalized === "resolved") {
      return "Resolved";
    }

    if (normalized === "pending") {
      return "Pending";
    }

    if (normalized === "submitted") {
      return "Submitted";
    }

    return normalized
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  // ============================================================
  // FORMAT PRIORITY
  // ============================================================

  const formatPriority = (priority) => {
    if (!priority) {
      return "Medium";
    }

    return priority
      .toString()
      .toLowerCase()
      .replace(/^\w/, (character) =>
        character.toUpperCase()
      );
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Unknown";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ============================================================
  // GET COMPLAINT TITLE
  // ============================================================

  const getComplaintTitle = (complaint) => {
    if (!complaint?.complaint_text) {
      return "Civic issue";
    }

    const text = complaint.complaint_text.trim();

    if (!text) {
      return "Civic issue";
    }

    return text.length > 55
      ? `${text.substring(0, 55)}...`
      : text;
  };

  // ============================================================
  // GET DESCRIPTION
  // ============================================================

  const getComplaintDescription = (complaint) => {
    if (!complaint?.complaint_text) {
      return "No complaint description available.";
    }

    return complaint.complaint_text;
  };

  // ============================================================
  // GET ICON
  // ============================================================

  const getComplaintIcon = (category) => {
    const normalizedCategory =
      category?.toString().toLowerCase() || "";

    if (
      normalizedCategory.includes("road") ||
      normalizedCategory.includes("infrastructure")
    ) {
      return "◇";
    }

    if (
      normalizedCategory.includes("electric") ||
      normalizedCategory.includes("light")
    ) {
      return "✦";
    }

    if (
      normalizedCategory.includes("waste") ||
      normalizedCategory.includes("garbage")
    ) {
      return "≋";
    }

    if (
      normalizedCategory.includes("water") ||
      normalizedCategory.includes("drain")
    ) {
      return "≈";
    }

    return "◈";
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {
    const normalizedStatus = formatStatus(status);

    if (normalizedStatus === "Pending") {
      return "status-pending";
    }

    if (normalizedStatus === "In Progress") {
      return "status-progress";
    }

    if (normalizedStatus === "Resolved") {
      return "status-resolved";
    }

    return "";
  };

  // ============================================================
  // PRIORITY CLASS
  // ============================================================

  const getPriorityClass = (priority) => {
    const normalizedPriority =
      formatPriority(priority);

    if (normalizedPriority === "High") {
      return "priority-high";
    }

    if (normalizedPriority === "Medium") {
      return "priority-medium";
    }

    if (normalizedPriority === "Low") {
      return "priority-low";
    }

    return "";
  };

  // ============================================================
  // FILTER + SEARCH
  // ============================================================

  const filteredComplaints = complaints.filter(
    (complaint) => {
      const complaintStatus =
        formatStatus(complaint.status);

      const matchesFilter =
        activeFilter === "All" ||
        complaintStatus === activeFilter;

      const search =
        searchTerm.toLowerCase().trim();

      const title =
        getComplaintTitle(complaint).toLowerCase();

      const description =
        getComplaintDescription(
          complaint
        ).toLowerCase();

      const category =
        complaint.category
          ?.toString()
          .toLowerCase() || "";

      const department =
        complaint.department
          ?.toString()
          .toLowerCase() || "";

      const receipt =
        complaint.receipt_number
          ?.toString()
          .toLowerCase() || "";

      const id =
        complaint.id
          ?.toString()
          .toLowerCase() || "";

      const matchesSearch =
        !search ||
        title.includes(search) ||
        description.includes(search) ||
        category.includes(search) ||
        department.includes(search) ||
        receipt.includes(search) ||
        id.includes(search);

      return matchesFilter && matchesSearch;
    }
  );

  // ============================================================
  // SUMMARY COUNTS
  // ============================================================

  const totalCount = complaints.length;

  const pendingCount = complaints.filter(
    (complaint) =>
      formatStatus(complaint.status) === "Pending"
  ).length;

  const progressCount = complaints.filter(
    (complaint) =>
      formatStatus(complaint.status) ===
      "In Progress"
  ).length;

  const resolvedCount = complaints.filter(
    (complaint) =>
      formatStatus(complaint.status) === "Resolved"
  ).length;

  // ============================================================
  // VIEW DETAILS
  // ============================================================

  const handleViewDetails = (complaintId) => {
    if (!complaintId) {
      return;
    }

    navigate(`/complaints/${complaintId}`);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="complaints-page">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="complaints-sidebar">
        <button
          type="button"
          className="complaints-brand"
          onClick={() => navigate("/dashboard")}
        >
          <div className="complaints-brand-icon">
            C
          </div>

          <div className="complaints-brand-name">
            <strong>CivicMind</strong>
            <span>AI</span>
          </div>
        </button>

        <div className="complaints-sidebar-label">
          CITIZEN PORTAL
        </div>

        <nav className="complaints-navigation">
          <button
            type="button"
            className="complaints-nav-link"
            onClick={() => navigate("/dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className="complaints-nav-link"
            onClick={() => navigate("/report")}
          >
            <span>＋</span>
            Report Issue
          </button>

          <button
            type="button"
            className="complaints-nav-link active"
          >
            <span>▤</span>
            My Complaints
          </button>

          <button
            type="button"
            className="complaints-nav-link"
            onClick={() => navigate("/tracking")}
          >
            <span>⌁</span>
            Track Issue
          </button>

          <button
            type="button"
            className="complaints-nav-link"
            onClick={() => navigate("/profile")}
          >
            <span>◯</span>
            Profile
          </button>
        </nav>

        <div className="complaints-sidebar-bottom">
          <div className="complaints-help-card">
            <div className="complaints-help-icon">
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
            className="complaints-logout"
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

      <main className="complaints-main">
        {/* ===================================================
            TOPBAR
        =================================================== */}

        <header className="complaints-topbar">
          <div>
            <span className="complaints-topbar-label">
              CITIZEN PORTAL
            </span>

            <h1>
              My <span>complaints.</span>
            </h1>

            <p>
              Keep track of every issue you've reported
              to your community.
            </p>
          </div>

          <div className="complaints-topbar-actions">
            <button
              type="button"
              className="complaints-back-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </button>

            <div className="complaints-user">
              <div className="complaints-user-avatar">
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

                <span>Citizen</span>
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <section className="complaints-summary">
          <div className="summary-item">
            <span>Total reports</span>
            <strong>
              {String(totalCount).padStart(2, "0")}
            </strong>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-item">
            <span>Pending</span>
            <strong>
              {String(pendingCount).padStart(2, "0")}
            </strong>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-item">
            <span>In progress</span>
            <strong>
              {String(progressCount).padStart(2, "0")}
            </strong>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-item">
            <span>Resolved</span>
            <strong>
              {String(resolvedCount).padStart(2, "0")}
            </strong>
          </div>
        </section>

        {/* ===================================================
            CONTROLS
        =================================================== */}

        <section className="complaints-controls">
          <div className="complaints-filters">
            {[
              "All",
              "Pending",
              "In Progress",
              "Resolved",
            ].map((filter) => (
              <button
                key={filter}
                type="button"
                className={
                  activeFilter === filter
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() =>
                  setActiveFilter(filter)
                }
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="complaints-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>
        </section>

        {/* ===================================================
            COMPLAINTS
        =================================================== */}

        <section className="complaints-content">
          <div className="complaints-section-heading">
            <div>
              <span>YOUR ACTIVITY</span>

              <h2>
                Report history
              </h2>
            </div>

            <button
              type="button"
              className="new-complaint-button"
              onClick={() => navigate("/report")}
            >
              <span>＋</span>
              Report new issue
            </button>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="complaints-empty">
              <div className="empty-icon">
                ◌
              </div>

              <h3>
                Loading your complaints...
              </h3>

              <p>
                CivicMind AI is retrieving your
                complaint history.
              </p>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <div className="complaints-empty">
              <div className="empty-icon">
                !
              </div>

              <h3>
                Unable to load complaints
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try again
              </button>
            </div>
          )}

          {/* =================================================
              COMPLAINT LIST
          ================================================= */}

          {!loading &&
            !error &&
            filteredComplaints.length > 0 && (
              <div className="complaints-list">
                {filteredComplaints.map(
                  (complaint) => {
                    const status =
                      formatStatus(
                        complaint.status
                      );

                    const priority =
                      formatPriority(
                        complaint.priority
                      );

                    return (
                      <article
                        className="complaint-card"
                        key={complaint.id}
                      >
                        <div className="complaint-card-main">
                          <div className="complaint-card-icon">
                            {getComplaintIcon(
                              complaint.category
                            )}
                          </div>

                          <div className="complaint-card-info">
                            <div className="complaint-card-title">
                              <h3>
                                {getComplaintTitle(
                                  complaint
                                )}
                              </h3>

                              <span
                                className={`complaint-status ${getStatusClass(
                                  complaint.status
                                )}`}
                              >
                                {status}
                              </span>
                            </div>

                            <p>
                              {getComplaintDescription(
                                complaint
                              )}
                            </p>

                            <div className="complaint-meta">
                              <span>
                                <strong>
                                  ID
                                </strong>

                                {complaint.id}
                              </span>

                              <span>
                                <strong>
                                  Category
                                </strong>

                                {complaint.category ||
                                  "Other"}
                              </span>

                              <span>
                                <strong>
                                  Department
                                </strong>

                                {complaint.department ||
                                  "General Civic Services"}
                              </span>

                              <span>
                                <strong>
                                  Receipt
                                </strong>

                                {complaint.receipt_number ||
                                  "Not available"}
                              </span>

                              <span>
                                <strong>
                                  Reported
                                </strong>

                                {formatDate(
                                  complaint.created_at
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="complaint-card-side">
                          <span className="priority-label">
                            PRIORITY
                          </span>

                          <span
                            className={`priority-badge ${getPriorityClass(
                              complaint.priority
                            )}`}
                          >
                            {priority}
                          </span>

                          <button
                            type="button"
                            className="complaint-view-button"
                            onClick={() =>
                              handleViewDetails(
                                complaint.id
                              )
                            }
                          >
                            View details
                            <span>→</span>
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            filteredComplaints.length === 0 && (
              <div className="complaints-empty">
                <div className="empty-icon">
                  ⌕
                </div>

                <h3>
                  {complaints.length === 0
                    ? "No complaints yet"
                    : "No complaints found"}
                </h3>

                <p>
                  {complaints.length === 0
                    ? "You haven't submitted any civic complaints yet."
                    : "We couldn't find any complaints matching your current search or filter."}
                </p>

                {complaints.length === 0 ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/report")
                    }
                  >
                    Report an issue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter("All");
                      setSearchTerm("");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
        </section>

        {/* ===================================================
            AI INSIGHT
        =================================================== */}

        <section className="complaints-ai-card">
          <div className="complaints-ai-icon">
            ✦
          </div>

          <div>
            <span>
              CIVICMIND AI
            </span>

            <h3>
              Every report contributes to smarter
              civic services.
            </h3>

            <p>
              Your reports help CivicMind AI identify
              patterns, prioritize important issues
              and support better service delivery.
            </p>
          </div>

          <div className="ai-orbit">
            <div></div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MyComplaints;