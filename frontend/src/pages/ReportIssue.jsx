import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import complaintService from "../services/complaintService";

import "./ReportIssue.css";

function ReportIssue() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const buildComplaintText = () => {
    return `
Title: ${formData.title}

Category: ${formData.category}

Location: ${formData.location}

Description:
${formData.description}
    `.trim();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setRequestError("");

    try {
      const complaintText = buildComplaintText();

      const response =
        await complaintService.submitComplaint(
          complaintText
        );

      console.log(
        "Complaint submitted successfully:",
        response
      );

      setReceipt(response);
      setSubmitted(true);
    } catch (error) {
      console.error(
        "Complaint submission failed:",
        error
      );

      const message =
        error?.response?.data?.detail ||
        "Unable to submit your complaint. Please try again.";

      setRequestError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewComplaints = () => {
    navigate("/complaints");
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="report-page">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="report-sidebar">
        <button
          type="button"
          className="report-brand"
          onClick={() => navigate("/dashboard")}
        >
          <div className="report-brand-icon">
            C
          </div>

          <div className="report-brand-name">
            <strong>CivicMind</strong>
            <span>AI</span>
          </div>
        </button>

        <div className="report-sidebar-label">
          CITIZEN PORTAL
        </div>

        <nav className="report-navigation">
          <button
            type="button"
            className="report-nav-link"
            onClick={() => navigate("/dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className="report-nav-link active"
          >
            <span>＋</span>
            Report Issue
          </button>

          <button
            type="button"
            className="report-nav-link"
            onClick={() => navigate("/complaints")}
          >
            <span>▤</span>
            My Complaints
          </button>

          <button
            type="button"
            className="report-nav-link"
            onClick={() => navigate("/tracking")}
          >
            <span>⌁</span>
            Track Issue
          </button>

          <button
            type="button"
            className="report-nav-link"
            onClick={() => navigate("/profile")}
          >
            <span>◯</span>
            Profile
          </button>
        </nav>

        <div className="report-sidebar-bottom">
          <div className="report-user">
            <div className="report-user-avatar">
              {user?.full_name
                ? user.full_name.charAt(0).toUpperCase()
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
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="report-main">
        {/* ===================================================
            TOPBAR
        =================================================== */}

        <header className="report-topbar">
          <div>
            <span className="report-topbar-label">
              CIVIC COMPLAINT
            </span>

            <h1>
              Report an
              <span> issue.</span>
            </h1>
          </div>

          <button
            type="button"
            className="report-back-button"
            onClick={handleBackToDashboard}
          >
            ← Back to dashboard
          </button>
        </header>

        {/* ===================================================
            INTRO
        =================================================== */}

        {!submitted && (
          <section className="report-intro">
            <div className="report-intro-icon">
              ＋
            </div>

            <div>
              <h2>
                Tell us what happened
              </h2>

              <p>
                Provide as much information as possible.
                CivicMind AI will analyze, categorize,
                prioritize and route your civic issue.
              </p>
            </div>
          </section>
        )}

        {/* ===================================================
            FORM / SUCCESS RECEIPT
        =================================================== */}

        <section className="report-card">
          {submitted ? (
            <div className="report-success">
              <div className="report-success-icon">
                ✓
              </div>

              <span>
                COMPLAINT SUCCESSFULLY SUBMITTED
              </span>

              <h2>
                Your civic report has been received.
              </h2>

              <p>
                CivicMind AI has processed your complaint
                and created your official complaint record.
              </p>

              {/* Receipt */}

              <div className="complaint-receipt">
                <div className="receipt-header">
                  <span>
                    CIVICMIND AI RECEIPT
                  </span>

                  <strong>
                    {receipt?.receipt_number ||
                      receipt?.tracking_number ||
                      `#${receipt?.id || "NEW"}`}
                  </strong>
                </div>

                <div className="receipt-grid">
                  <div className="receipt-item">
                    <span>
                      Complaint ID
                    </span>

                    <strong>
                      {receipt?.id || "Processing"}
                    </strong>
                  </div>

                  <div className="receipt-item">
                    <span>
                      Category
                    </span>

                    <strong>
                      {receipt?.category ||
                        receipt?.predicted_category ||
                        "AI Processing"}
                    </strong>
                  </div>

                  <div className="receipt-item">
                    <span>
                      Priority
                    </span>

                    <strong>
                      {receipt?.priority ||
                        "Pending analysis"}
                    </strong>
                  </div>

                  <div className="receipt-item">
                    <span>
                      Department
                    </span>

                    <strong>
                      {receipt?.department ||
                        receipt?.assigned_department ||
                        "Being assigned"}
                    </strong>
                  </div>

                  <div className="receipt-item">
                    <span>
                      Status
                    </span>

                    <strong>
                      {receipt?.status ||
                        "Submitted"}
                    </strong>
                  </div>

                  <div className="receipt-item">
                    <span>
                      Citizen
                    </span>

                    <strong>
                      {user?.full_name ||
                        "Citizen"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="report-success-actions">
                <button
                  type="button"
                  className="report-cancel-button"
                  onClick={handleBackToDashboard}
                >
                  Back to dashboard
                </button>

                <button
                  type="button"
                  className="report-submit-button"
                  onClick={handleViewComplaints}
                >
                  View my complaints
                  <span>→</span>
                </button>
              </div>
            </div>
          ) : (
            <form
              className="report-form"
              onSubmit={handleSubmit}
            >
              {/* Error */}

              {requestError && (
                <div className="report-error">
                  <strong>
                    Unable to submit your complaint
                  </strong>

                  <span>
                    {requestError}
                  </span>
                </div>
              )}

              {/* Issue title */}

              <div className="report-field full-width">
                <label htmlFor="title">
                  Issue title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: Large pothole on Main Street"
                  required
                  disabled={submitting}
                />

                <span className="field-hint">
                  Give your issue a short, clear title.
                </span>
              </div>

              {/* Category */}

              <div className="report-field">
                <label htmlFor="category">
                  Issue category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  <option value="">
                    Select a category
                  </option>

                  <option value="road">
                    Road & Infrastructure
                  </option>

                  <option value="street_light">
                    Street Light
                  </option>

                  <option value="waste">
                    Waste Management
                  </option>

                  <option value="water">
                    Water Supply
                  </option>

                  <option value="drainage">
                    Drainage & Sewerage
                  </option>

                  <option value="public_safety">
                    Public Safety
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              {/* Location */}

              <div className="report-field">
                <label htmlFor="location">
                  Issue location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Example: Main Street, Block A"
                  required
                  disabled={submitting}
                />
              </div>

              {/* Description */}

              <div className="report-field full-width">
                <label htmlFor="description">
                  Describe the issue
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what happened, how long the issue has existed, and any other useful details..."
                  rows="7"
                  required
                  disabled={submitting}
                />

                <span className="field-hint">
                  More detail helps CivicMind AI analyze
                  the issue more accurately.
                </span>
              </div>

              {/* AI Notice */}

              <div className="report-ai-notice">
                <div className="report-ai-icon">
                  ✦
                </div>

                <div>
                  <strong>
                    AI-powered civic intelligence
                  </strong>

                  <p>
                    Your report will be sent to the
                    CivicMind AI processing pipeline for
                    classification, priority prediction and
                    department routing.
                  </p>
                </div>
              </div>

              {/* Actions */}

              <div className="report-actions">
                <button
                  type="button"
                  className="report-cancel-button"
                  onClick={handleBackToDashboard}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="report-submit-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Processing..."
                    : "Submit report"}

                  <span>
                    {submitting ? "…" : "→"}
                  </span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* ===================================================
            FOOTER NOTE
        =================================================== */}

        <p className="report-footer-note">
          CivicMind AI helps communities identify,
          understand and improve civic services.
        </p>
      </main>
    </div>
  );
}

export default ReportIssue;