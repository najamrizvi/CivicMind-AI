import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import api from "../api/api";

import "./AdminAnalytics.css";

function AdminAnalytics() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/analytics");

        setAnalytics(response.data);
      } catch (err) {
        console.error("Admin analytics loading failed:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load analytics data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const overview = analytics?.overview || {};

  const byStatus = analytics?.by_status || {};
  const byPriority = analytics?.by_priority || {};
  const byCategory = analytics?.by_category || {};
  const byDepartment = analytics?.by_department || {};

  const totalComplaints = overview.total_complaints ?? 0;
  const openComplaints = overview.open_complaints ?? 0;
  const resolvedComplaints = overview.resolved_complaints ?? 0;
  const closedComplaints = overview.closed_complaints ?? 0;
  const highPriorityComplaints =
    overview.high_priority_complaints ?? 0;

  const getPercentage = (value) => {
    if (!totalComplaints) {
      return 0;
    }

    return Math.round(
      (value / totalComplaints) * 100
    );
  };

  const formatLabel = (value) => {
    return value
      .toString()
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const sortedCategories = Object.entries(
    byCategory
  ).sort(([, a], [, b]) => b - a);

  const sortedDepartments = Object.entries(
    byDepartment
  ).sort(([, a], [, b]) => b - a);

  return (
    <div className="admin-analytics-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-analytics-sidebar">

        <div className="analytics-brand">

          <div className="analytics-brand-icon">
            C
          </div>

          <div className="analytics-brand-name">
            <strong>CivicMind</strong>
            <span>AI</span>
          </div>

        </div>

        <div className="analytics-sidebar-label">
          ADMINISTRATION
        </div>

        <nav className="analytics-navigation">

          <button
            type="button"
            className="analytics-nav-link"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <span>◈</span>
            Overview
          </button>

          <button
            type="button"
            className="analytics-nav-link"
            onClick={() =>
              navigate("/admin/complaints")
            }
          >
            <span>▤</span>
            Complaints
          </button>

          <button
            type="button"
            className="analytics-nav-link active"
          >
            <span>◌</span>
            Analytics
          </button>

          <button
            type="button"
            className="analytics-nav-link"
            onClick={() =>
              navigate("/admin/insights")
            }
          >
            <span>✦</span>
            AI Insights
          </button>

        </nav>

        <div className="analytics-sidebar-bottom">

          <div className="analytics-sidebar-system">

            <div className="analytics-system-icon">
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
            className="analytics-logout"
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

      <main className="admin-analytics-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="analytics-header">

          <div>

            <span className="analytics-header-label">
              CIVICMIND AI · ANALYTICS
            </span>

            <h1>
              Civic
              <span> intelligence.</span>
            </h1>

            <p>
              Understand complaint patterns,
              operational workload, and civic
              service performance.
            </p>

          </div>

          <div className="analytics-header-account">

            <div className="analytics-account-avatar">
              {(
                user?.full_name ||
                "A"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user?.full_name ||
                  "Administrator"}
              </strong>

              <span>
                Administrator
              </span>
            </div>

          </div>

        </header>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div
            className="analytics-error"
            role="alert"
          >
            <span>!</span>
            {error}
          </div>
        )}


        {/* ===================================================
            KPI CARDS
        =================================================== */}

        <section className="analytics-section">

          <div className="analytics-section-heading">

            <div>
              <span>
                PERFORMANCE SNAPSHOT
              </span>

              <h2>
                At a glance
              </h2>
            </div>

            <div className="analytics-live">
              <span></span>
              Live data
            </div>

          </div>


          <div className="analytics-kpi-grid">

            <article className="analytics-kpi-card featured">

              <div className="analytics-kpi-top">
                <span>
                  TOTAL COMPLAINTS
                </span>

                <div className="analytics-kpi-icon">
                  ◈
                </div>
              </div>

              <strong>
                {loading
                  ? "—"
                  : totalComplaints}
              </strong>

              <p>
                Complaints recorded
              </p>

            </article>


            <article className="analytics-kpi-card">

              <div className="analytics-kpi-top">
                <span>
                  OPEN
                </span>

                <div className="analytics-kpi-icon">
                  ◌
                </div>
              </div>

              <strong>
                {loading
                  ? "—"
                  : openComplaints}
              </strong>

              <p>
                Awaiting resolution
              </p>

            </article>


            <article className="analytics-kpi-card">

              <div className="analytics-kpi-top">
                <span>
                  RESOLVED
                </span>

                <div className="analytics-kpi-icon">
                  ✓
                </div>
              </div>

              <strong>
                {loading
                  ? "—"
                  : resolvedComplaints}
              </strong>

              <p>
                Successfully resolved
              </p>

            </article>


            <article className="analytics-kpi-card">

              <div className="analytics-kpi-top">
                <span>
                  CLOSED
                </span>

                <div className="analytics-kpi-icon">
                  ◇
                </div>
              </div>

              <strong>
                {loading
                  ? "—"
                  : closedComplaints}
              </strong>

              <p>
                Completed cases
              </p>

            </article>


            <article className="analytics-kpi-card alert">

              <div className="analytics-kpi-top">
                <span>
                  HIGH PRIORITY
                </span>

                <div className="analytics-kpi-icon">
                  !
                </div>
              </div>

              <strong>
                {loading
                  ? "—"
                  : highPriorityComplaints}
              </strong>

              <p>
                Requiring attention
              </p>

            </article>

          </div>

        </section>


        {/* ===================================================
            STATUS + PRIORITY
        =================================================== */}

        <section className="analytics-two-column">

          {/* STATUS */}

          <article className="analytics-panel">

            <div className="analytics-panel-heading">

              <div>
                <span>
                  COMPLAINT PIPELINE
                </span>

                <h2>
                  Status distribution
                </h2>
              </div>

              <div className="analytics-panel-mark">
                ◌
              </div>

            </div>


            <div className="analytics-bars">

              {Object.entries(byStatus).map(
                ([status, value]) => {

                  const percentage =
                    getPercentage(value);

                  return (
                    <div
                      className="analytics-bar-row"
                      key={status}
                    >

                      <div className="analytics-bar-label">
                        <span>
                          {formatLabel(status)}
                        </span>

                        <strong>
                          {loading
                            ? "—"
                            : value}
                        </strong>
                      </div>

                      <div className="analytics-bar-track">
                        <div
                          className="analytics-bar-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <span className="analytics-bar-percent">
                        {percentage}%
                      </span>

                    </div>
                  );
                }
              )}

              {!loading &&
                Object.keys(byStatus).length === 0 && (
                  <div className="analytics-empty">
                    No status data available.
                  </div>
                )}

            </div>

          </article>


          {/* PRIORITY */}

          <article className="analytics-panel">

            <div className="analytics-panel-heading">

              <div>
                <span>
                  ATTENTION LEVEL
                </span>

                <h2>
                  Priority distribution
                </h2>
              </div>

              <div className="analytics-panel-mark">
                !
              </div>

            </div>


            <div className="priority-list">

              {Object.entries(byPriority).map(
                ([priority, value]) => {

                  const percentage =
                    getPercentage(value);

                  return (
                    <div
                      className="priority-row"
                      key={priority}
                    >

                      <div className="priority-row-main">

                        <div
                          className={`priority-dot priority-${priority.toLowerCase()}`}
                        ></div>

                        <span>
                          {formatLabel(priority)}
                        </span>

                      </div>

                      <div className="priority-value">
                        <strong>
                          {value}
                        </strong>

                        <span>
                          {percentage}%
                        </span>
                      </div>

                    </div>
                  );
                }
              )}

              {!loading &&
                Object.keys(byPriority).length === 0 && (
                  <div className="analytics-empty">
                    No priority data available.
                  </div>
                )}

            </div>

          </article>

        </section>


        {/* ===================================================
            CATEGORY + DEPARTMENT
        =================================================== */}

        <section className="analytics-two-column">

          {/* CATEGORY */}

          <article className="analytics-panel">

            <div className="analytics-panel-heading">

              <div>
                <span>
                  CIVIC ISSUES
                </span>

                <h2>
                  Categories
                </h2>
              </div>

              <div className="analytics-panel-mark">
                ◈
              </div>

            </div>


            <div className="ranking-list">

              {sortedCategories.map(
                ([category, value], index) => {

                  const percentage =
                    getPercentage(value);

                  return (
                    <div
                      className="ranking-item"
                      key={category}
                    >

                      <div className="ranking-index">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="ranking-content">

                        <div className="ranking-title-row">
                          <strong>
                            {category}
                          </strong>

                          <span>
                            {value}
                          </span>
                        </div>

                        <div className="ranking-track">
                          <div
                            className="ranking-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                      </div>

                    </div>
                  );
                }
              )}

              {!loading &&
                sortedCategories.length === 0 && (
                  <div className="analytics-empty">
                    No category data available.
                  </div>
                )}

            </div>

          </article>


          {/* DEPARTMENT */}

          <article className="analytics-panel">

            <div className="analytics-panel-heading">

              <div>
                <span>
                  OPERATIONS
                </span>

                <h2>
                  Department workload
                </h2>
              </div>

              <div className="analytics-panel-mark">
                ▤
              </div>

            </div>


            <div className="ranking-list">

              {sortedDepartments.map(
                ([department, value], index) => {

                  const percentage =
                    getPercentage(value);

                  return (
                    <div
                      className="ranking-item"
                      key={department}
                    >

                      <div className="ranking-index">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="ranking-content">

                        <div className="ranking-title-row">
                          <strong>
                            {department}
                          </strong>

                          <span>
                            {value}
                          </span>
                        </div>

                        <div className="ranking-track">
                          <div
                            className="ranking-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                      </div>

                    </div>
                  );
                }
              )}

              {!loading &&
                sortedDepartments.length === 0 && (
                  <div className="analytics-empty">
                    No department data available.
                  </div>
                )}

            </div>

          </article>

        </section>


        {/* ===================================================
            INSIGHT SUMMARY
        =================================================== */}

        <section className="analytics-insight-card">

          <div className="analytics-insight-glow"></div>

          <div className="analytics-insight-icon">
            ✦
          </div>

          <div className="analytics-insight-content">

            <span>
              CIVICMIND INTELLIGENCE
            </span>

            <h2>
              Data tells the story.
            </h2>

            <p>
              CivicMind AI transforms complaint
              records into operational intelligence,
              helping administrators identify
              workload patterns, priority levels,
              and areas requiring civic attention.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/insights")
            }
          >
            Explore AI insights
            <span>→</span>
          </button>

        </section>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="analytics-footer">

          <div>
            <strong>
              CivicMind AI
            </strong>

            <span>
              Intelligence for better communities.
            </span>
          </div>

          <div className="analytics-footer-status">
            <span></span>
            Analytics portal active
          </div>

        </footer>

      </main>

    </div>
  );
}

export default AdminAnalytics;