import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import api from "../api/api";

import "./AdminComplaints.css";

function AdminComplaints() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [updatingComplaintId, setUpdatingComplaintId] =
    useState(null);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getInitial = useCallback(() => {
    const name =
      user?.full_name ||
      user?.email ||
      "Administrator";

    return String(name).charAt(0).toUpperCase();
  }, [user]);

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return String(status)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatPriority = (priority) => {
    if (!priority) {
      return "Unknown";
    }

    return String(priority)
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getComplaintText = (complaint) => {
    return (
      complaint?.complaint_text ??
      complaint?.description ??
      complaint?.text ??
      ""
    );
  };

  const getComplaintPreview = (text) => {
    if (!text) {
      return "No complaint description available.";
    }

    const normalized = String(text)
      .replace(/\s+/g, " ")
      .trim();

    if (normalized.length <= 150) {
      return normalized;
    }

    return `${normalized.slice(0, 150)}...`;
  };

  /* =========================================================
     LOAD COMPLAINTS
  ========================================================= */

  const fetchComplaints = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await api.get(
          "/admin/complaints"
        );

        const data = response?.data;

        let complaintList = [];

        if (Array.isArray(data)) {
          complaintList = data;
        } else if (Array.isArray(data?.complaints)) {
          complaintList = data.complaints;
        } else if (Array.isArray(data?.data)) {
          complaintList = data.data;
        } else if (
          Array.isArray(data?.results)
        ) {
          complaintList = data.results;
        }

        setComplaints(
          complaintList.filter(
            (complaint) =>
              complaint &&
              typeof complaint === "object"
          )
        );
      } catch (err) {
        console.error(
          "Admin complaints loading failed:",
          err
        );

        setComplaints([]);

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Unable to load administrative complaints."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        const response = await api.get(
          "/admin/complaints"
        );

        if (!active) {
          return;
        }

        const data = response?.data;

        let complaintList = [];

        if (Array.isArray(data)) {
          complaintList = data;
        } else if (Array.isArray(data?.complaints)) {
          complaintList = data.complaints;
        } else if (Array.isArray(data?.data)) {
          complaintList = data.data;
        } else if (
          Array.isArray(data?.results)
        ) {
          complaintList = data.results;
        }

        setComplaints(
          complaintList.filter(
            (complaint) =>
              complaint &&
              typeof complaint === "object"
          )
        );

        setError("");
      } catch (err) {
        console.error(
          "Admin complaints initial loading failed:",
          err
        );

        if (!active) {
          return;
        }

        setComplaints([]);

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Unable to load administrative complaints."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const categories = useMemo(() => {
    const values = complaints
      .map((complaint) => complaint?.category)
      .filter(Boolean)
      .map((value) => String(value));

    return [...new Set(values)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [complaints]);

  const departments = useMemo(() => {
    const values = complaints
      .map((complaint) => complaint?.department)
      .filter(Boolean)
      .map((value) => String(value));

    return [...new Set(values)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [complaints]);

  /* =========================================================
     FILTERED COMPLAINTS
  ========================================================= */

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const id = String(
        complaint?.id ?? ""
      ).toLowerCase();

      const receipt = String(
        complaint?.receipt_number ?? ""
      ).toLowerCase();

      const text = String(
        getComplaintText(complaint)
      ).toLowerCase();

      const category = String(
        complaint?.category ?? ""
      ).toLowerCase();

      const department = String(
        complaint?.department ?? ""
      ).toLowerCase();

      const status = String(
        complaint?.status ?? ""
      ).toLowerCase();

      const priority = String(
        complaint?.priority ?? ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        id.includes(query) ||
        receipt.includes(query) ||
        text.includes(query) ||
        category.includes(query) ||
        department.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        status ===
          String(statusFilter).toLowerCase();

      const matchesPriority =
        priorityFilter === "all" ||
        priority ===
          String(priorityFilter).toLowerCase();

      const matchesCategory =
        categoryFilter === "all" ||
        String(complaint?.category ?? "") ===
          categoryFilter;

      const matchesDepartment =
        departmentFilter === "all" ||
        String(complaint?.department ?? "") ===
          departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesDepartment
      );
    });
  }, [
    complaints,
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    departmentFilter,
  ]);

  /* =========================================================
     SUMMARY COUNTS
  ========================================================= */

  const counts = useMemo(() => {
    const statusValues = complaints.map(
      (complaint) =>
        String(
          complaint?.status ?? ""
        ).toLowerCase()
    );

    const priorityValues = complaints.map(
      (complaint) =>
        String(
          complaint?.priority ?? ""
        ).toLowerCase()
    );

    return {
      total: complaints.length,

      submitted: statusValues.filter(
        (status) => status === "submitted"
      ).length,

      underReview: statusValues.filter(
        (status) => status === "under_review"
      ).length,

      inProgress: statusValues.filter(
        (status) => status === "in_progress"
      ).length,

      resolved: statusValues.filter(
        (status) => status === "resolved"
      ).length,

      closed: statusValues.filter(
        (status) => status === "closed"
      ).length,

      high: priorityValues.filter(
        (priority) => priority === "high"
      ).length,
    };
  }, [complaints]);

  /* =========================================================
     STATUS UPDATE
  ========================================================= */

  const handleStatusUpdate = async (
    complaintId,
    nextStatus
  ) => {
    const complaint = complaints.find(
      (item) =>
        String(item?.id) ===
        String(complaintId)
    );

    if (!complaint) {
      return;
    }

    const currentStatus = String(
      complaint.status ?? ""
    ).toLowerCase();

    const normalizedNextStatus = String(
      nextStatus ?? ""
    ).toLowerCase();

    if (
      currentStatus ===
      normalizedNextStatus
    ) {
      return;
    }

    try {
      setUpdatingComplaintId(complaintId);
      setError("");

      await api.patch(
        `/admin/complaints/${complaintId}/status`,
        {
          status: normalizedNextStatus,
          note: `Status updated by administrator to ${formatStatus(
            normalizedNextStatus
          )}.`,
        }
      );

      await fetchComplaints(true);
    } catch (err) {
      console.error(
        "Complaint status update failed:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to update complaint status."
      );
    } finally {
      setUpdatingComplaintId(null);
    }
  };

  /* =========================================================
     FILTER RESET
  ========================================================= */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setDepartmentFilter("all");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    categoryFilter !== "all" ||
    departmentFilter !== "all";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="admin-complaints-page">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="admin-complaints-orb admin-complaints-orb-one" />
      <div className="admin-complaints-orb admin-complaints-orb-two" />
      <div className="admin-complaints-grid-background" />


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-inner">

          <div className="admin-brand">

            <button
              type="button"
              className="admin-brand-link"
              onClick={() =>
                navigate("/admin/dashboard")
              }
            >
              <div className="admin-brand-icon">
                C
              </div>

              <div className="admin-brand-name">
                <strong>
                  CivicMind
                </strong>

                <span>
                  AI
                </span>
              </div>
            </button>

          </div>


          <div className="admin-sidebar-label">
            ADMINISTRATION
          </div>


          <nav className="admin-navigation">

            <button
              type="button"
              className="admin-nav-link"
              onClick={() =>
                navigate("/admin/dashboard")
              }
            >
              <span className="admin-nav-icon">
                ◈
              </span>

              <span>
                Overview
              </span>
            </button>


            <button
              type="button"
              className="admin-nav-link active"
              onClick={() =>
                navigate("/admin/complaints")
              }
            >
              <span className="admin-nav-icon">
                ▤
              </span>

              <span>
                Complaints
              </span>

              <span className="admin-nav-active-mark">
                →
              </span>
            </button>


            <button
              type="button"
              className="admin-nav-link"
              onClick={() =>
                navigate("/admin/analytics")
              }
            >
              <span className="admin-nav-icon">
                ◌
              </span>

              <span>
                Analytics
              </span>
            </button>


            <button
              type="button"
              className="admin-nav-link"
              onClick={() =>
                navigate("/admin/insights")
              }
            >
              <span className="admin-nav-icon">
                ✦
              </span>

              <span>
                AI Insights
              </span>
            </button>

          </nav>


          <div className="admin-sidebar-divider" />


          <button
            type="button"
            className="admin-profile-card"
            onClick={() =>
              navigate("/admin/profile")
            }
          >
            <div className="admin-profile-avatar">
              {getInitial()}
            </div>

            <div className="admin-profile-info">
              <strong>
                {user?.full_name ||
                  "Administrator"}
              </strong>

              <span>
                Administrator
              </span>
            </div>

            <span className="admin-profile-arrow">
              →
            </span>
          </button>


          <div className="admin-sidebar-bottom">

            <div className="admin-sidebar-system">

              <div className="admin-system-icon">
                ✦
              </div>

              <div>
                <strong>
                  CivicMind AI
                </strong>

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
              <span>
                ↪
              </span>

              <span>
                Sign out
              </span>
            </button>

          </div>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-main admin-complaints-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="admin-header">

          <div className="admin-header-copy">

            <span className="admin-header-label">
              CIVICMIND AI · ADMINISTRATION
            </span>

            <h1>
              Complaint
              <span>
                {" "}operations.
              </span>
            </h1>

            <p>
              Review, filter, and manage citizen
              complaints across the CivicMind
              platform.
            </p>

          </div>


          <button
            type="button"
            className="admin-header-account"
            onClick={() =>
              navigate("/admin/profile")
            }
          >

            <div className="admin-account-avatar">
              {getInitial()}
            </div>

            <div className="admin-account-details">

              <strong>
                {user?.full_name ||
                  "Administrator"}
              </strong>

              <span>
                Administrator
              </span>

            </div>

            <span className="admin-account-arrow">
              →
            </span>

          </button>

        </header>


        {/* ===================================================
            ERROR
        =================================================== */}

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
                Operation unavailable
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchComplaints(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Retrying..."
                : "Retry"}
            </button>

          </div>
        )}


        {/* ===================================================
            OVERVIEW
        =================================================== */}

        <section className="admin-complaints-overview">

          <div className="admin-section-heading">

            <div>

              <span>
                CIVIC OPERATIONS
              </span>

              <h2>
                Complaint registry
              </h2>

            </div>


            <button
              type="button"
              className="admin-refresh-button"
              onClick={() =>
                fetchComplaints(true)
              }
              disabled={refreshing}
            >
              <span>
                {refreshing ? "↻" : "⟳"}
              </span>

              {refreshing
                ? "Refreshing"
                : "Refresh data"}
            </button>

          </div>


          <div className="admin-complaints-summary">

            <article className="admin-complaint-summary-card featured">

              <span>
                TOTAL COMPLAINTS
              </span>

              <strong>
                {loading
                  ? "—"
                  : counts.total}
              </strong>

              <p>
                All registered citizen reports
              </p>

            </article>


            <article className="admin-complaint-summary-card">

              <span>
                SUBMITTED
              </span>

              <strong>
                {loading
                  ? "—"
                  : counts.submitted}
              </strong>

              <p>
                Awaiting administrative review
              </p>

            </article>


            <article className="admin-complaint-summary-card">

              <span>
                IN PROGRESS
              </span>

              <strong>
                {loading
                  ? "—"
                  : counts.inProgress}
              </strong>

              <p>
                Currently being handled
              </p>

            </article>


            <article className="admin-complaint-summary-card alert">

              <span>
                HIGH PRIORITY
              </span>

              <strong>
                {loading
                  ? "—"
                  : counts.high}
              </strong>

              <p>
                Require priority attention
              </p>

            </article>

          </div>

        </section>


        {/* ===================================================
            FILTERS
        =================================================== */}

        <section className="admin-complaints-controls">

          <div className="admin-controls-heading">

            <div>

              <span>
                REGISTRY CONTROLS
              </span>

              <h2>
                Find complaints
              </h2>

            </div>

            <span className="admin-result-count">
              {loading
                ? "Loading..."
                : `${filteredComplaints.length} ${
                    filteredComplaints.length === 1
                      ? "complaint"
                      : "complaints"
                  }`}
            </span>

          </div>


          <div className="admin-filter-grid">

            {/* SEARCH */}

            <label className="admin-filter-field admin-search-field">

              <span>
                Search
              </span>

              <div className="admin-search-input-wrap">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search complaints, receipt numbers..."
                />

              </div>

            </label>


            {/* STATUS */}

            <label className="admin-filter-field">

              <span>
                Status
              </span>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="all">
                  All statuses
                </option>

                <option value="submitted">
                  Submitted
                </option>

                <option value="under_review">
                  Under review
                </option>

                <option value="in_progress">
                  In progress
                </option>

                <option value="resolved">
                  Resolved
                </option>

                <option value="closed">
                  Closed
                </option>
              </select>

            </label>


            {/* PRIORITY */}

            <label className="admin-filter-field">

              <span>
                Priority
              </span>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
              >
                <option value="all">
                  All priorities
                </option>

                <option value="high">
                  High
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="low">
                  Low
                </option>
              </select>

            </label>


            {/* CATEGORY */}

            <label className="admin-filter-field">

              <span>
                Category
              </span>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
              >
                <option value="all">
                  All categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}

              </select>

            </label>


            {/* DEPARTMENT */}

            <label className="admin-filter-field">

              <span>
                Department
              </span>

              <select
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(event.target.value)
                }
              >
                <option value="all">
                  All departments
                </option>

                {departments.map((department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department}
                  </option>
                ))}

              </select>

            </label>


            {/* CLEAR */}

            {hasActiveFilters && (
              <button
                type="button"
                className="admin-clear-filters"
                onClick={clearFilters}
              >
                Clear filters

                <span>
                  ×
                </span>
              </button>
            )}

          </div>

        </section>


        {/* ===================================================
            REGISTRY
        =================================================== */}

        <section className="admin-complaints-registry">

          <div className="admin-registry-header">

            <div>

              <span>
                ADMINISTRATIVE REGISTRY
              </span>

              <h2>
                Citizen complaints
              </h2>

            </div>

            <div className="admin-registry-live">

              <span />

              Live registry

            </div>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="admin-complaints-loading">

              <div className="admin-loading-spinner" />

              <strong>
                Loading complaints
              </strong>

              <span>
                Retrieving current civic reports...
              </span>

            </div>

          )}


          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            filteredComplaints.length === 0 && (

              <div className="admin-complaints-empty">

                <div className="admin-empty-icon">
                  ◌
                </div>

                <strong>
                  No complaints found
                </strong>

                <p>
                  {hasActiveFilters
                    ? "No complaints match the selected filters."
                    : error
                    ? "The complaint registry could not be loaded."
                    : "There are currently no complaints in the registry."}
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                )}

                {!hasActiveFilters && error && (
                  <button
                    type="button"
                    onClick={() =>
                      fetchComplaints(true)
                    }
                    disabled={refreshing}
                  >
                    {refreshing
                      ? "Retrying..."
                      : "Try again"}
                  </button>
                )}

              </div>

            )}


          {/* =================================================
              COMPLAINT LIST
          ================================================= */}

          {!loading &&
            filteredComplaints.length > 0 && (

              <div className="admin-complaints-list">

                {filteredComplaints.map(
                  (complaint, index) => {

                    const complaintId =
                      complaint?.id ??
                      complaint?.complaint_id ??
                      index;

                    const normalizedStatus =
                      String(
                        complaint?.status ??
                          "submitted"
                      ).toLowerCase();

                    const normalizedPriority =
                      String(
                        complaint?.priority ??
                          "low"
                      ).toLowerCase();

                    const isUpdating =
                      updatingComplaintId ===
                      complaintId;

                    return (
                      <article
                        className="admin-complaint-row"
                        key={complaintId}
                      >

                        {/* ID */}

                        <div className="admin-complaint-identity">

                          <div className="admin-complaint-number">
                            #{complaintId}
                          </div>

                          <span>
                            {complaint?.receipt_number ||
                              "No receipt number"}
                          </span>

                          <small>
                            {formatDate(
                              complaint?.created_at
                            )}
                          </small>

                        </div>


                        {/* MAIN */}

                        <div className="admin-complaint-main">

                          <button
                            type="button"
                            className="admin-complaint-title"
                            onClick={() =>
                              navigate(
                                `/admin/complaints/${complaintId}`
                              )
                            }
                          >
                            {complaint?.category ||
                              "Civic complaint"}
                          </button>

                          <p>
                            {getComplaintPreview(
                              getComplaintText(
                                complaint
                              )
                            )}
                          </p>

                          <div className="admin-complaint-meta">

                            <span>
                              {complaint?.department ||
                                "Unassigned department"}
                            </span>

                            {complaint?.user_id !==
                              undefined &&
                              complaint?.user_id !==
                                null && (
                                <span>
                                  Citizen #
                                  {complaint.user_id}
                                </span>
                              )}

                          </div>

                        </div>


                        {/* PRIORITY */}

                        <div className="admin-complaint-priority">

                          <span>
                            PRIORITY
                          </span>

                          <strong
                            className={`priority-${
                              normalizedPriority ||
                              "unknown"
                            }`}
                          >
                            <i />

                            {formatPriority(
                              complaint?.priority
                            )}
                          </strong>

                        </div>


                        {/* STATUS */}

                        <div className="admin-complaint-status">

                          <span>
                            STATUS
                          </span>

                          <select
                            value={
                              normalizedStatus
                            }
                            disabled={isUpdating}
                            onChange={(event) =>
                              handleStatusUpdate(
                                complaintId,
                                event.target.value
                              )
                            }
                          >

                            <option value="submitted">
                              Submitted
                            </option>

                            <option value="under_review">
                              Under review
                            </option>

                            <option value="in_progress">
                              In progress
                            </option>

                            <option value="resolved">
                              Resolved
                            </option>

                            <option value="closed">
                              Closed
                            </option>

                          </select>

                          {isUpdating && (
                            <small>
                              Updating...
                            </small>
                          )}

                        </div>


                        {/* OPEN */}

                        <div className="admin-complaint-action">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/complaints/${complaintId}`
                              )
                            }
                          >
                            Open

                            <span>
                              →
                            </span>

                          </button>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

            )}

        </section>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="admin-footer">

          <div className="admin-footer-brand">

            <strong>
              CivicMind AI
            </strong>

            <span>
              Intelligence for better communities.
            </span>

          </div>

          <div className="admin-footer-status">

            <span />

            Administrative portal active

          </div>

        </footer>

      </main>

    </div>
  );
}

export default AdminComplaints;