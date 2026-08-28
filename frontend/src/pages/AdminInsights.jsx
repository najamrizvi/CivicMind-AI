import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import api from "../api/api";

import "./AdminInsights.css";

function AdminInsights() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/insights");

        setData(response.data);
      } catch (err) {
        console.error(
          "Admin insights loading failed:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load administrative insights."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const insights = Array.isArray(data?.insights)
    ? data.insights
    : [];

  return (
    <div className="admin-insights-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-insights-sidebar">

        <div className="admin-insights-brand">

          <div className="admin-insights-brand-icon">
            C
          </div>

          <div className="admin-insights-brand-name">
            <strong>CivicMind</strong>
            <span>AI</span>
          </div>

        </div>

        <div className="admin-insights-sidebar-label">
          ADMINISTRATION
        </div>

        <nav className="admin-insights-navigation">

          <button
            type="button"
            className="admin-insights-nav-link"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <span>◈</span>
            Overview
          </button>

          <button
            type="button"
            className="admin-insights-nav-link"
            onClick={() =>
              navigate("/admin/complaints")
            }
          >
            <span>▤</span>
            Complaints
          </button>

          <button
            type="button"
            className="admin-insights-nav-link"
            onClick={() =>
              navigate("/admin/analytics")
            }
          >
            <span>◌</span>
            Analytics
          </button>

          <button
            type="button"
            className="admin-insights-nav-link active"
          >
            <span>✦</span>
            AI Insights
          </button>

        </nav>

        <div className="admin-insights-sidebar-bottom">

          <div className="admin-insights-system">

            <div className="admin-insights-system-icon">
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
            className="admin-insights-logout"
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

      <main className="admin-insights-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="admin-insights-header">

          <div>

            <span className="admin-insights-header-label">
              CIVICMIND AI · INTELLIGENCE
            </span>

            <h1>
              AI
              <span> insights.</span>
            </h1>

            <p>
              Actionable intelligence generated from
              current civic complaint activity.
            </p>

          </div>

          <div className="admin-insights-header-account">

            <div className="admin-insights-account-avatar">
              {(user?.full_name || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user?.full_name || "Administrator"}
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
          <div className="admin-insights-error">
            <span>!</span>
            {error}
          </div>
        )}


        {/* ===================================================
            AI STATUS
        =================================================== */}

        <section className="admin-insights-hero">

          <div className="admin-insights-hero-glow"></div>

          <div className="admin-insights-ai-mark">
            ✦
          </div>

          <div className="admin-insights-hero-content">

            <span>
              CIVICMIND INTELLIGENCE ENGINE
            </span>

            <h2>
              Administrative
              <br />
              <em>intelligence.</em>
            </h2>

            <p>
              CivicMind AI analyzes complaint activity
              and transforms operational data into
              actionable administrative insights.
            </p>

          </div>

          <div className="admin-insights-live">

            <span></span>

            {loading
              ? "Analyzing"
              : "Analysis ready"}

          </div>

        </section>


        {/* ===================================================
            SUMMARY
        =================================================== */}

        <section className="admin-insights-section">

          <div className="admin-insights-section-heading">

            <div>
              <span>AI ANALYSIS</span>

              <h2>
                Executive summary
              </h2>
            </div>

          </div>

          <div className="admin-insights-summary-card">

            <div className="admin-insights-summary-icon">
              ✦
            </div>

            <div>

              <span>
                CIVICMIND AI SUMMARY
              </span>

              <p>
                {loading
                  ? "Analyzing current complaint data..."
                  : data?.summary ||
                    "No summary is currently available."}
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            INSIGHTS
        =================================================== */}

        <section className="admin-insights-section">

          <div className="admin-insights-section-heading">

            <div>
              <span>GENERATED FINDINGS</span>

              <h2>
                Key insights
              </h2>
            </div>

            <div className="admin-insights-count">
              {loading
                ? "—"
                : `${insights.length} findings`}
            </div>

          </div>


          <div className="admin-insights-grid">

            {loading ? (
              <>
                <div className="admin-insight-card skeleton-card">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>

                <div className="admin-insight-card skeleton-card">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>

                <div className="admin-insight-card skeleton-card">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </>
            ) : insights.length > 0 ? (
              insights.map((insight, index) => {

                const title =
                  typeof insight === "string"
                    ? `Insight ${index + 1}`
                    : insight?.title ||
                      insight?.name ||
                      `Insight ${index + 1}`;

                const description =
                  typeof insight === "string"
                    ? insight
                    : insight?.description ||
                      insight?.message ||
                      insight?.text ||
                      "No additional details available.";

                return (
                  <article
                    className="admin-insight-card"
                    key={index}
                  >

                    <div className="admin-insight-card-top">

                      <div className="admin-insight-number">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="admin-insight-spark">
                        ✦
                      </div>

                    </div>

                    <h3>
                      {title}
                    </h3>

                    <p>
                      {description}
                    </p>

                  </article>
                );
              })
            ) : (
              <div className="admin-insights-empty">

                <div>✦</div>

                <h3>
                  No insights available
                </h3>

                <p>
                  CivicMind AI needs complaint data
                  before it can generate meaningful
                  administrative findings.
                </p>

              </div>
            )}

          </div>

        </section>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="admin-insights-footer">

          <div>
            <strong>
              CivicMind AI
            </strong>

            <span>
              Intelligence for better communities.
            </span>
          </div>

          <div className="admin-insights-footer-status">

            <span></span>

            AI intelligence system active

          </div>

        </footer>

      </main>

    </div>
  );
}

export default AdminInsights;