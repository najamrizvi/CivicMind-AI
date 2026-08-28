import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";

import "./AdminProfile.css";

function AdminProfile() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const fullName =
    user?.full_name ||
    "Administrator";

  const email =
    user?.email ||
    "admin@civicmind.ai";

  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-profile-page">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="admin-profile-background"></div>

      <div className="admin-profile-light admin-profile-light-one"></div>
      <div className="admin-profile-light admin-profile-light-two"></div>


      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="admin-profile-header">

        <button
          type="button"
          className="admin-profile-back"
          onClick={() => navigate("/admin/dashboard")}
        >
          <span>←</span>
          <span>Back to dashboard</span>
        </button>

        <div className="admin-profile-header-brand">

          <div className="admin-profile-brand-icon">
            C
          </div>

          <div className="admin-profile-brand-name">
            <strong>CivicMind</strong>
            <span>AI</span>
          </div>

        </div>

        <div className="admin-profile-header-label">
          ADMINISTRATION
        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="admin-profile-main">

        <section className="admin-profile-card">

          <div className="admin-profile-card-glow"></div>
          <div className="admin-profile-card-reflection"></div>


          {/* =================================================
              INTRO
          ================================================= */}

          <div className="admin-profile-intro">

            <span className="admin-profile-eyebrow">
              CIVICMIND AI · ADMINISTRATION
            </span>

            <h1>
              Administrator
              <span> profile.</span>
            </h1>

            <p>
              Manage and review your CivicMind AI
              administrative account.
            </p>

          </div>


          {/* =================================================
              PROFILE IDENTITY
          ================================================= */}

          <div className="admin-profile-identity">

            <div className="admin-profile-avatar">
              <span>{initials}</span>

              <div className="admin-profile-avatar-status"></div>
            </div>

            <div className="admin-profile-identity-info">

              <h2>
                {fullName}
              </h2>

              <p>
                {email}
              </p>

              <div className="admin-profile-role">
                <span>✦</span>
                Administrator
              </div>

            </div>

          </div>


          {/* =================================================
              ACCOUNT INFORMATION
          ================================================= */}

          <div className="admin-profile-section">

            <div className="admin-profile-section-heading">

              <div>
                <span>
                  ACCOUNT INFORMATION
                </span>

                <h2>
                  Account details
                </h2>
              </div>

              <div className="admin-profile-active">
                <span></span>
                Active
              </div>

            </div>


            <div className="admin-profile-details">

              <div className="admin-profile-detail">

                <span className="admin-profile-detail-label">
                  Full name
                </span>

                <strong>
                  {fullName}
                </strong>

              </div>


              <div className="admin-profile-detail">

                <span className="admin-profile-detail-label">
                  Email address
                </span>

                <strong>
                  {email}
                </strong>

              </div>


              <div className="admin-profile-detail">

                <span className="admin-profile-detail-label">
                  Account role
                </span>

                <strong>
                  Administrator
                </strong>

              </div>


              <div className="admin-profile-detail">

                <span className="admin-profile-detail-label">
                  Platform access
                </span>

                <strong>
                  Administrative portal
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              SECURITY / ACCESS
          ================================================= */}

          <div className="admin-profile-section admin-profile-security">

            <div className="admin-profile-security-icon">
              ✓
            </div>

            <div>

              <span>
                SECURE ACCESS
              </span>

              <h3>
                Administrative session active
              </h3>

              <p>
                Your account has verified administrator
                privileges and access to CivicMind AI
                administrative operations.
              </p>

            </div>

          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="admin-profile-actions">

            <button
              type="button"
              className="admin-profile-dashboard-button"
              onClick={() =>
                navigate("/admin/dashboard")
              }
            >
              Return to dashboard
              <span>→</span>
            </button>

            <button
              type="button"
              className="admin-profile-logout-button"
              onClick={handleLogout}
            >
              <span>↪</span>
              Sign out
            </button>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="admin-profile-footer">

          <div>
            <strong>
              CivicMind AI
            </strong>

            <span>
              Intelligence for better communities.
            </span>
          </div>

          <div className="admin-profile-footer-status">
            <span></span>
            Administrative portal active
          </div>

        </footer>

      </main>

    </div>
  );
}

export default AdminProfile;