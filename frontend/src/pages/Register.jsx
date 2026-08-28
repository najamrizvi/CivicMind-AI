import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

import { useAuth } from "../context/useAuth";

function Register() {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register(formData);

      setSuccess(
        "Your CivicMind AI account has been created successfully."
      );

      setFormData({
        full_name: "",
        email: "",
        password: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (requestError) {
      const message =
        requestError.response?.data?.detail ||
        "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-background"></div>

      <div className="auth-container">
        <div className="auth-brand">
          <Link to="/" className="auth-brand-link">
            <div className="brand-icon">C</div>

            <div className="brand-name">
              <strong>CivicMind</strong>
              <span>AI</span>
            </div>
          </Link>
        </div>

        <section className="auth-card">
          <div className="auth-card-glow"></div>

          <div className="auth-heading">
            <span className="section-label">
              CIVICMIND AI
            </span>

            <h1>
              Join the
              <br />
              <span>community.</span>
            </h1>

            <p>
              Create your account and become part of
              smarter civic services.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-field">
              <label htmlFor="full_name">
                Full name
              </label>

              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                autoComplete="new-password"
                required
              />
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create account
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>
          </div>
        </section>

        <div className="auth-back">
          <Link to="/">
            ← Back to CivicMind AI
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Register;