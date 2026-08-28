import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/api";

import "./AdminComplaintDetails.css";


function AdminComplaintDetails() {
  const { complaintId } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");
  const [note, setNote] = useState("");

  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");


  /* =========================================================
     LOAD COMPLAINT
  ========================================================= */

  useEffect(() => {
    const loadComplaint = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/admin/complaints/${complaintId}`
        );

        setComplaint(response.data);

        setSelectedStatus("");
      } catch (err) {
        console.error(
          "Admin complaint loading failed:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Unable to load complaint details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaint();
  }, [complaintId]);


  /* =========================================================
     LOAD STATUS HISTORY
  ========================================================= */

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const response = await api.get(
          `/admin/complaints/${complaintId}/history`
        );

        setHistory(
          response.data?.history || []
        );
      } catch (err) {
        console.error(
          "Complaint history loading failed:",
          err
        );

        setHistoryError(
          err?.response?.data?.detail ||
            "Unable to load complaint history."
        );
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [complaintId]);


  /* =========================================================
     STATUS HELPERS
  ========================================================= */

  const currentStatus = useMemo(() => {
    return (
      complaint?.status
        ?.toString()
        .trim()
        .toUpperCase() || ""
    );
  }, [complaint]);


  const nextStatusMap = {
    SUBMITTED: "UNDER_REVIEW",
    UNDER_REVIEW: "IN_PROGRESS",
    IN_PROGRESS: "RESOLVED",
    RESOLVED: "CLOSED",
  };


  const nextStatus =
    nextStatusMap[currentStatus] || "";


  const statusLabel = (statusValue) => {
    if (!statusValue) {
      return "Unknown";
    }

    return statusValue
      .toString()
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };


  const priorityLabel =
    complaint?.priority
      ?.toString()
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      ) || "Unknown";


  /* =========================================================
     DATE FORMATTER
  ========================================================= */

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };


  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const handleStatusUpdate = async (event) => {
    event.preventDefault();

    if (!selectedStatus) {
      setUpdateError(
        "Please select a status update."
      );

      return;
    }

    try {
      setUpdating(true);
      setUpdateMessage("");
      setUpdateError("");

      const response = await api.patch(
        `/admin/complaints/${complaintId}/status`,
        {
          status: selectedStatus,
          note:
            note.trim() || null,
        }
      );

      const updatedStatus =
        response.data?.new_status ||
        selectedStatus;

      setComplaint((previous) => ({
        ...previous,
        status: updatedStatus,
        updated_at:
          response.data?.updated_at ||
          previous?.updated_at,
      }));

      setSelectedStatus("");
      setNote("");

      setUpdateMessage(
        "Complaint status updated successfully."
      );


      /* -----------------------------------------------
         Refresh history
      ----------------------------------------------- */

      try {
        const historyResponse =
          await api.get(
            `/admin/complaints/${complaintId}/history`
          );

        setHistory(
          historyResponse.data?.history || []
        );
      } catch (historyRefreshError) {
        console.error(
          "History refresh failed:",
          historyRefreshError
        );
      }

    } catch (err) {
      console.error(
        "Complaint status update failed:",
        err
      );

      setUpdateError(
        err?.response?.data?.detail ||
          "Unable to update complaint status."
      );
    } finally {
      setUpdating(false);
    }
  };


  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <main className="admin-complaint-details-page">

        <div className="admin-details-loading">

          <div className="admin-details-loading-spinner"></div>

          <p>
            Loading complaint details...
          </p>

        </div>

      </main>
    );
  }


  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (error || !complaint) {
    return (
      <main className="admin-complaint-details-page">

        <div className="admin-details-error-state">

          <div className="admin-details-error-icon">
            !
          </div>

          <span className="admin-details-label">
            ADMINISTRATION
          </span>

          <h1>
            Complaint unavailable.
          </h1>

          <p>
            {error ||
              "The requested complaint could not be found."}
          </p>

          <button
            type="button"
            className="admin-details-back-button"
            onClick={() =>
              navigate("/admin/complaints")
            }
          >
            ← Back to complaints
          </button>

        </div>

      </main>
    );
  }


  return (
    <div className="admin-complaint-details-page">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="admin-details-background"></div>

      <div className="admin-details-light admin-details-light-one"></div>

      <div className="admin-details-light admin-details-light-two"></div>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-details-header">

        <div className="admin-details-header-left">

          <Link
            to="/admin/complaints"
            className="admin-details-back-link"
          >
            ← Complaints
          </Link>

          <div className="admin-details-heading">

            <span className="admin-details-label">
              CIVICMIND AI · COMPLAINT MANAGEMENT
            </span>

            <h1>
              Complaint
              <span> details.</span>
            </h1>

            <p>
              Review the complaint, monitor its
              lifecycle, and manage the next
              operational status.
            </p>

          </div>

        </div>


        {/* Receipt */}

        <div className="admin-details-receipt">

          <span>
            RECEIPT NUMBER
          </span>

          <strong>
            {complaint.receipt_number ||
              `#${complaint.id}`}
          </strong>

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="admin-details-main">

        {/* ===================================================
            TOP INFORMATION
        =================================================== */}

        <section className="admin-details-top-grid">


          {/* COMPLAINT */}

          <article className="admin-details-card admin-details-complaint-card">

            <div className="admin-details-card-heading">

              <div>

                <span>
                  CITIZEN REPORT
                </span>

                <h2>
                  Complaint
                </h2>

              </div>

              <div className="admin-details-card-mark">
                ◈
              </div>

            </div>


            <div className="admin-details-complaint-text">

              {complaint.complaint_text ||
                "No complaint description available."}

            </div>


            <div className="admin-details-meta-grid">

              <div className="admin-details-meta-item">

                <span>
                  COMPLAINT ID
                </span>

                <strong>
                  #{complaint.id}
                </strong>

              </div>


              <div className="admin-details-meta-item">

                <span>
                  CITIZEN ID
                </span>

                <strong>
                  {complaint.user_id ?? "—"}
                </strong>

              </div>


              <div className="admin-details-meta-item">

                <span>
                  SUBMITTED
                </span>

                <strong>
                  {formatDate(
                    complaint.created_at
                  )}
                </strong>

              </div>


              <div className="admin-details-meta-item">

                <span>
                  LAST UPDATED
                </span>

                <strong>
                  {formatDate(
                    complaint.updated_at
                  )}
                </strong>

              </div>

            </div>

          </article>


          {/* CLASSIFICATION */}

          <article className="admin-details-card">

            <div className="admin-details-card-heading">

              <div>

                <span>
                  AI CLASSIFICATION
                </span>

                <h2>
                  Operational routing
                </h2>

              </div>

              <div className="admin-details-ai-mark">
                ✦
              </div>

            </div>


            <div className="admin-details-classification-list">

              <div className="admin-details-classification-row">

                <span>
                  Category
                </span>

                <strong>
                  {complaint.category ||
                    "Unknown"}
                </strong>

              </div>


              <div className="admin-details-classification-row">

                <span>
                  Priority
                </span>

                <strong
                  className={`priority-${complaint.priority
                    ?.toString()
                    .toLowerCase()}`}
                >
                  {priorityLabel}
                </strong>

              </div>


              <div className="admin-details-classification-row">

                <span>
                  Department
                </span>

                <strong>
                  {complaint.department ||
                    "Unknown"}
                </strong>

              </div>


              <div className="admin-details-classification-row">

                <span>
                  Current status
                </span>

                <strong>
                  {statusLabel(
                    currentStatus
                  )}
                </strong>

              </div>

            </div>

          </article>

        </section>


        {/* ===================================================
            MANAGEMENT + HISTORY
        =================================================== */}

        <section className="admin-details-bottom-grid">


          {/* STATUS MANAGEMENT */}

          <article className="admin-details-card admin-status-management-card">

            <div className="admin-details-card-heading">

              <div>

                <span>
                  ADMINISTRATIVE ACTION
                </span>

                <h2>
                  Manage status
                </h2>

              </div>

              <div className="admin-details-action-mark">
                ◌
              </div>

            </div>


            {updateMessage && (
              <div
                className="admin-details-success"
                role="status"
              >
                <span>✓</span>
                {updateMessage}
              </div>
            )}


            {updateError && (
              <div
                className="admin-details-update-error"
                role="alert"
              >
                <span>!</span>
                {updateError}
              </div>
            )}


            {nextStatus ? (
              <form
                className="admin-status-form"
                onSubmit={handleStatusUpdate}
              >

                <div className="admin-current-status">

                  <span>
                    CURRENT STATUS
                  </span>

                  <strong>
                    {statusLabel(
                      currentStatus
                    )}
                  </strong>

                </div>


                <div className="admin-next-status-indicator">

                  <span>
                    NEXT ALLOWED STEP
                  </span>

                  <strong>
                    {statusLabel(
                      nextStatus
                    )}
                  </strong>

                </div>


                <div className="admin-form-field">

                  <label htmlFor="admin-status">
                    Update status
                  </label>

                  <select
                    id="admin-status"
                    value={selectedStatus}
                    onChange={(event) => {
                      setSelectedStatus(
                        event.target.value
                      );

                      setUpdateError("");
                      setUpdateMessage("");
                    }}
                    disabled={updating}
                  >

                    <option value="">
                      Select next status
                    </option>

                    <option value={nextStatus}>
                      {statusLabel(
                        nextStatus
                      )}
                    </option>

                  </select>

                </div>


                <div className="admin-form-field">

                  <label htmlFor="admin-note">
                    Administrative note
                    <span>Optional</span>
                  </label>

                  <textarea
                    id="admin-note"
                    value={note}
                    onChange={(event) => {
                      setNote(
                        event.target.value
                      );

                      setUpdateError("");
                    }}
                    placeholder="Add a note about this status change..."
                    rows={5}
                    disabled={updating}
                  />

                </div>


                <button
                  type="submit"
                  className="admin-status-submit"
                  disabled={
                    updating ||
                    !selectedStatus
                  }
                >

                  {updating ? (
                    <>
                      <span className="admin-button-spinner"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      Update complaint
                      <span>→</span>
                    </>
                  )}

                </button>

              </form>

            ) : (
              <div className="admin-closed-state">

                <div className="admin-closed-icon">
                  ✓
                </div>

                <strong>
                  Complaint lifecycle complete
                </strong>

                <p>
                  This complaint has reached its
                  final status and requires no
                  further status transition.
                </p>

              </div>
            )}

          </article>


          {/* STATUS HISTORY */}

          <article className="admin-details-card admin-history-card">

            <div className="admin-details-card-heading">

              <div>

                <span>
                  AUDIT TRAIL
                </span>

                <h2>
                  Status history
                </h2>

              </div>

              <div className="admin-details-history-mark">
                ◷
              </div>

            </div>


            {historyError && (
              <div className="admin-history-error">
                {historyError}
              </div>
            )}


            {historyLoading ? (
              <div className="admin-history-loading">

                <span className="admin-history-spinner"></span>

                Loading history...

              </div>
            ) : history.length > 0 ? (

              <div className="admin-history-timeline">

                {history.map(
                  (record, index) => (
                    <div
                      className="admin-history-item"
                      key={
                        record.id ||
                        `${record.created_at}-${index}`
                      }
                    >

                      <div className="admin-history-marker">

                        <span></span>

                      </div>


                      <div className="admin-history-content">

                        <div className="admin-history-top">

                          <strong>
                            {statusLabel(
                              record.new_status
                            )}
                          </strong>

                          <span>
                            {formatDate(
                              record.created_at
                            )}
                          </span>

                        </div>


                        <div className="admin-history-transition">

                          {record.previous_status ? (
                            <>
                              <span>
                                {statusLabel(
                                  record.previous_status
                                )}
                              </span>

                              <b>
                                →
                              </b>
                            </>
                          ) : null}

                          <span>
                            {statusLabel(
                              record.new_status
                            )}
                          </span>

                        </div>


                        {record.note && (
                          <p>
                            {record.note}
                          </p>
                        )}


                        <small>
                          Changed by admin
                          {record.changed_by
                            ? ` · #${record.changed_by}`
                            : ""}
                        </small>

                      </div>

                    </div>
                  )
                )}

              </div>

            ) : (
              <div className="admin-history-empty">

                <div>
                  ◷
                </div>

                <strong>
                  No status history yet
                </strong>

                <p>
                  Status changes will appear here
                  as administrators process the
                  complaint.
                </p>

              </div>
            )}

          </article>

        </section>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="admin-details-footer">

          <div>

            <strong>
              CivicMind AI
            </strong>

            <span>
              Intelligence for better communities.
            </span>

          </div>

          <div className="admin-details-footer-status">

            <span></span>

            Administrative portal active

          </div>

        </footer>

      </main>

    </div>
  );
}


export default AdminComplaintDetails;