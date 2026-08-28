import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Login.css";

import { useAuth } from "../context/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("citizen");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login(formData);

      const isAdmin = Boolean(
        response.user?.is_admin
      );

      if (role === "admin" && !isAdmin) {
        setError(
          "This account does not have administrator access."
        );
        return;
      }

      if (role === "citizen" && isAdmin) {
        setError(
          "Administrator accounts must sign in using Administrator access."
        );
        return;
      }

      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (requestError) {
      console.error(
        "Login failed:",
        requestError
      );

      const detail =
        requestError?.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item?.msg)
            .filter(Boolean)
            .join(" ")
        );
      } else if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else {
        setError(
          "Unable to sign in. Please check your email and password."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const roleLabel =
    role === "admin"
      ? "Administrator"
      : "Citizen";

  return (
    <main className="auth-page">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="auth-background"></div>

      <div className="auth-light auth-light-one"></div>
      <div className="auth-light auth-light-two"></div>


      {/* =====================================================
          DECORATIVE CRYSTALS
      ===================================================== */}

      <div className="auth-crystal auth-crystal-left">
        <div className="auth-crystal-face auth-crystal-face-one"></div>
        <div className="auth-crystal-face auth-crystal-face-two"></div>
        <div className="auth-crystal-shine"></div>
      </div>

      <div className="auth-crystal auth-crystal-right">
        <div className="auth-crystal-face auth-crystal-face-one"></div>
        <div className="auth-crystal-face auth-crystal-face-two"></div>
        <div className="auth-crystal-shine"></div>
      </div>


      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="auth-container">

        {/* ===================================================
            BRAND
        =================================================== */}

        <div className="auth-brand">

          <Link
            to="/"
            className="auth-brand-link"
          >
            <div className="brand-icon">
              C
            </div>

            <div className="brand-name">
              <strong>
                CivicMind
              </strong>

              <span>
                AI
              </span>
            </div>
          </Link>

        </div>


        {/* ===================================================
            AUTH CARD
        =================================================== */}

        <section className="auth-card">

          <div className="auth-card-glow"></div>
          <div className="auth-card-reflection"></div>


          {/* =================================================
              HEADING
          ================================================= */}

          <div className="auth-heading">

            <span className="section-label">
              CIVICMIND AI
            </span>

            <h1>
              Welcome
              <br />
              <span>
                back.
              </span>
            </h1>

            <p>
              Sign in to continue to your
              CivicMind AI account.
            </p>

          </div>


          {/* =================================================
              ROLE SELECTOR
          ================================================= */}

          <div className="auth-role-section">

            <div className="auth-role-heading">
              <span>
                CONTINUE AS
              </span>

              <small>
                Choose your account type
              </small>
            </div>


            <div className="auth-role-selector">

              {/* =============================================
                  CITIZEN
              ============================================= */}

              <button
                type="button"
                className={`auth-role-card ${
                  role === "citizen"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  handleRoleChange(
                    "citizen"
                  )
                }
                disabled={loading}
              >

                <span className="auth-role-icon">
                  ◯
                </span>

                <span className="auth-role-content">
                  <strong>
                    Citizen
                  </strong>

                  <small>
                    Report and track civic issues
                  </small>
                </span>

                <span className="auth-role-check">
                  {role === "citizen"
                    ? "✓"
                    : ""}
                </span>

              </button>


              {/* =============================================
                  ADMINISTRATOR
              ============================================= */}

              <button
                type="button"
                className={`auth-role-card ${
                  role === "admin"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  handleRoleChange(
                    "admin"
                  )
                }
                disabled={loading}
              >

                <span className="auth-role-icon admin">
                  ◆
                </span>

                <span className="auth-role-content">
                  <strong>
                    Administrator
                  </strong>

                  <small>
                    Manage civic intelligence
                  </small>
                </span>

                <span className="auth-role-check">
                  {role === "admin"
                    ? "✓"
                    : ""}
                </span>

              </button>

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              <span className="auth-error-icon">
                !
              </span>

              <span>
                {error}
              </span>
            </div>
          )}


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* ===============================================
                EMAIL
            =============================================== */}

            <div className="form-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  @
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                />

              </div>

            </div>


            {/* ===============================================
                PASSWORD
            =============================================== */}

            <div className="form-field">

              <div className="form-label-row">

                <label htmlFor="password">
                  Password
                </label>

              </div>

              <div className="input-wrapper">

                <span className="input-icon">
                  •
                </span>

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* ===============================================
                SUBMIT
            =============================================== */}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="auth-spinner"></span>

                  Signing in...
                </>
              ) : (
                <>
                  Sign in as {roleLabel}

                  <span>
                    →
                  </span>
                </>
              )}

            </button>

          </form>


          {/* =================================================
              REGISTER
          ================================================= */}

          <div className="auth-footer">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create one
            </Link>

          </div>

        </section>


        {/* ===================================================
            BACK
        =================================================== */}

        <div className="auth-back">

          <Link to="/">
            ← Back to CivicMind AI
          </Link>

        </div>


        {/* ===================================================
            STATUS
        =================================================== */}

        <div className="auth-status">

          <span></span>

          CivicMind AI systems ready

        </div>

      </div>

    </main>
  );
}

export default Login;