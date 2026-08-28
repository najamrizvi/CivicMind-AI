import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import profileService from "../services/profileService";

import "./Profile.css";

const API_BASE_URL = "http://localhost:8000";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

function Profile() {
  const navigate = useNavigate();

  const {
    user,
    setUser,
    logout,
  } = useAuth();

  const fileInputRef = useRef(null);

  const [isEditingName, setIsEditingName] =
    useState(false);

  const [editedName, setEditedName] =
    useState("");

  const [savingName, setSavingName] =
    useState(false);

  const [uploadingPicture, setUploadingPicture] =
    useState(false);

  const [deletingPicture, setDeletingPicture] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // ============================================================
  // DERIVED USER INFORMATION
  // ============================================================

  const displayName =
    user?.full_name || "Citizen";

  const email =
    user?.email || "Not available";

  const initial =
    displayName.charAt(0).toUpperCase();

  const profilePicture =
    user?.profile_picture
      ? `${API_BASE_URL}${user.profile_picture}`
      : null;


  // ============================================================
  // CLEAR NOTIFICATIONS
  // ============================================================

  useEffect(() => {
    if (!message && !error) {
      return;
    }

    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [message, error]);


  // ============================================================
  // ERROR MESSAGE HELPER
  // ============================================================

  const getErrorMessage = (
    err,
    fallbackMessage
  ) => {
    const detail =
      err?.response?.data?.detail;

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => item?.msg)
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    if (typeof detail === "string") {
      return detail;
    }

    return fallbackMessage;
  };


  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  // ============================================================
  // START EDITING NAME
  // ============================================================

  const handleStartEditing = () => {
    setEditedName(displayName);
    setIsEditingName(true);
    setMessage("");
    setError("");
  };


  // ============================================================
  // CANCEL NAME EDIT
  // ============================================================

  const handleCancelEditing = () => {
    setEditedName(displayName);
    setIsEditingName(false);
    setMessage("");
    setError("");
  };


  // ============================================================
  // SAVE NAME
  // ============================================================

  const handleSaveName = async () => {
    const trimmedName =
      editedName.trim();

    if (!trimmedName) {
      setError(
        "Full name cannot be empty."
      );
      return;
    }

    if (trimmedName.length > 150) {
      setError(
        "Full name cannot exceed 150 characters."
      );
      return;
    }

    if (trimmedName === displayName) {
      setIsEditingName(false);
      return;
    }

    setSavingName(true);
    setMessage("");
    setError("");

    try {
      const updatedUser =
        await profileService.updateProfile(
          trimmedName
        );

      setUser(updatedUser);

      setIsEditingName(false);

      setMessage(
        "Your profile name has been updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile name update failed:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to update your profile name."
        )
      );
    } finally {
      setSavingName(false);
    }
  };


  // ============================================================
  // OPEN FILE SELECTOR
  // ============================================================

  const handleChoosePicture = () => {
    if (
      uploadingPicture ||
      deletingPicture
    ) {
      return;
    }

    setMessage("");
    setError("");

    fileInputRef.current?.click();
  };


  // ============================================================
  // UPLOAD PROFILE PICTURE
  // ============================================================

  const handlePictureChange = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    // Allow the same file to be selected again.
    event.target.value = "";

    if (!file) {
      return;
    }

    // ----------------------------------------------------------
    // VALIDATE FILE TYPE
    // ----------------------------------------------------------

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      setError(
        "Please upload a JPG, PNG, or WEBP image."
      );
      return;
    }

    // ----------------------------------------------------------
    // VALIDATE FILE SIZE
    // ----------------------------------------------------------

    if (
      file.size >
      MAX_PROFILE_IMAGE_SIZE
    ) {
      setError(
        "Profile picture must be 5 MB or smaller."
      );
      return;
    }

    setUploadingPicture(true);
    setMessage("");
    setError("");

    try {
      const updatedUser =
        await profileService.uploadProfilePicture(
          file
        );

      setUser(updatedUser);

      setMessage(
        "Your profile picture has been updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile picture upload failed:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to upload your profile picture."
        )
      );
    } finally {
      setUploadingPicture(false);
    }
  };


  // ============================================================
  // DELETE PROFILE PICTURE
  // ============================================================

  const handleDeletePicture = async () => {
    if (
      !profilePicture ||
      deletingPicture ||
      uploadingPicture
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Remove your profile picture?"
      );

    if (!confirmed) {
      return;
    }

    setDeletingPicture(true);
    setMessage("");
    setError("");

    try {
      const updatedUser =
        await profileService.deleteProfilePicture();

      setUser(updatedUser);

      setMessage(
        "Your profile picture has been removed."
      );
    } catch (err) {
      console.error(
        "Profile picture deletion failed:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to remove your profile picture."
        )
      );
    } finally {
      setDeletingPicture(false);
    }
  };


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="profile-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="profile-sidebar">

        <div className="profile-sidebar-brand">

          <div className="profile-sidebar-brand-icon">
            C
          </div>

          <div className="profile-sidebar-brand-name">
            <strong>
              CivicMind
            </strong>

            <span>
              AI
            </span>
          </div>

        </div>

        <div className="profile-sidebar-label">
          CITIZEN PORTAL
        </div>

        <nav className="profile-sidebar-navigation">

          <button
            type="button"
            className="profile-sidebar-link"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span className="profile-sidebar-link-icon">
              ⌂
            </span>

            <span>
              Dashboard
            </span>
          </button>

          <button
            type="button"
            className="profile-sidebar-link"
            onClick={() =>
              navigate("/report")
            }
          >
            <span className="profile-sidebar-link-icon">
              ＋
            </span>

            <span>
              Report Issue
            </span>
          </button>

          <button
            type="button"
            className="profile-sidebar-link"
            onClick={() =>
              navigate("/complaints")
            }
          >
            <span className="profile-sidebar-link-icon">
              ▤
            </span>

            <span>
              My Complaints
            </span>
          </button>

          <button
            type="button"
            className="profile-sidebar-link"
            onClick={() =>
              navigate("/tracking")
            }
          >
            <span className="profile-sidebar-link-icon">
              ⌁
            </span>

            <span>
              Track Issue
            </span>
          </button>

          <button
            type="button"
            className="profile-sidebar-link active"
          >
            <span className="profile-sidebar-link-icon">
              ◯
            </span>

            <span>
              Profile
            </span>
          </button>

        </nav>

        <div className="profile-sidebar-bottom">

          <div className="profile-sidebar-help">

            <div className="profile-help-icon">
              ✦
            </div>

            <div>
              <strong>
                CivicMind AI
              </strong>

              <p>
                Intelligence for better communities.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="profile-logout"
            onClick={handleLogout}
          >
            <span>
              ↪
            </span>

            Logout
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="profile-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="profile-header">

          <div>

            <span className="profile-header-label">
              CIVICMIND AI · ACCOUNT
            </span>

            <h1>
              Your
              <span>
                {" "}profile.
              </span>
            </h1>

            <p>
              Manage your CivicMind AI account and
              view your citizen information.
            </p>

          </div>

        </header>


        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        {(message || error) && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "12px",
              border: `1px solid ${
                error
                  ? "rgba(153, 87, 74, 0.18)"
                  : "rgba(102, 143, 117, 0.18)"
              }`,
              background: error
                ? "rgba(177, 105, 90, 0.08)"
                : "rgba(107, 151, 122, 0.08)",
              color: error
                ? "#9a6258"
                : "#678775",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {error || message}
          </div>
        )}


        {/* ===================================================
            PROFILE HERO
        =================================================== */}

        <section className="profile-hero-card">

          <div className="profile-hero-glow"></div>


          {/* =================================================
              AVATAR
          ================================================= */}

          <div
            className="profile-avatar-large"
            style={{
              overflow: "hidden",
              position: "relative",
            }}
          >

            {profilePicture ? (
              <img
                src={profilePicture}
                alt={`${displayName}'s profile`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              initial
            )}

            {(uploadingPicture ||
              deletingPicture) && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(48, 44, 37, 0.45)",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {uploadingPicture
                  ? "Uploading..."
                  : "Removing..."}
              </div>
            )}

          </div>


          {/* =================================================
              HERO CONTENT
          ================================================= */}

          <div className="profile-hero-content">

            <span className="profile-role-badge">
              CITIZEN ACCOUNT
            </span>

            <h2>
              {displayName}
            </h2>

            <p>
              {email}
            </p>


            {/* ===============================================
                PROFILE PICTURE ACTIONS
            =============================================== */}

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "16px",
              }}
            >

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePictureChange}
                style={{
                  display: "none",
                }}
              />

              <button
                type="button"
                onClick={handleChoosePicture}
                disabled={
                  uploadingPicture ||
                  deletingPicture
                }
                style={{
                  border:
                    "1px solid rgba(164, 124, 61, 0.16)",
                  borderRadius: "9px",
                  padding: "8px 12px",
                  color: "#8e6938",
                  background:
                    "rgba(220, 188, 128, 0.12)",
                  fontSize: "10px",
                  fontWeight: 700,
                  cursor:
                    uploadingPicture ||
                    deletingPicture
                      ? "wait"
                      : "pointer",
                  opacity:
                    uploadingPicture ||
                    deletingPicture
                      ? 0.65
                      : 1,
                }}
              >
                {profilePicture
                  ? "Change picture"
                  : "Upload picture"}
              </button>

              {profilePicture && (
                <button
                  type="button"
                  onClick={handleDeletePicture}
                  disabled={
                    uploadingPicture ||
                    deletingPicture
                  }
                  style={{
                    border:
                      "1px solid rgba(153, 87, 74, 0.14)",
                    borderRadius: "9px",
                    padding: "8px 12px",
                    color: "#9a6258",
                    background:
                      "rgba(177, 105, 90, 0.07)",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor:
                      uploadingPicture ||
                      deletingPicture
                        ? "wait"
                        : "pointer",
                    opacity:
                      uploadingPicture ||
                      deletingPicture
                        ? 0.65
                        : 1,
                  }}
                >
                  {deletingPicture
                    ? "Removing..."
                    : "Remove picture"}
                </button>
              )}

            </div>

          </div>


          {/* =================================================
              CRYSTAL
          ================================================= */}

          <div className="profile-hero-crystal">

            <div className="profile-crystal-glow"></div>

            <div className="profile-crystal">
              <span>
                C
              </span>

              <small>
                AI
              </small>
            </div>

          </div>

        </section>


        {/* ===================================================
            ACCOUNT INFORMATION
        =================================================== */}

        <section className="profile-section">

          <div className="profile-section-heading">

            <span>
              ACCOUNT INFORMATION
            </span>

            <h2>
              Your details
            </h2>

          </div>


          <div className="profile-info-grid">

            {/* ===============================================
                FULL NAME
            =============================================== */}

            <div className="profile-info-card">

              <div className="profile-info-icon">
                ◯
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >

                <span>
                  FULL NAME
                </span>

                {isEditingName ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >

                    <input
                      type="text"
                      value={editedName}
                      onChange={(event) =>
                        setEditedName(
                          event.target.value
                        )
                      }
                      maxLength={150}
                      autoFocus
                      disabled={savingName}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter"
                        ) {
                          handleSaveName();
                        }

                        if (
                          event.key === "Escape"
                        ) {
                          handleCancelEditing();
                        }
                      }}
                      style={{
                        flex: 1,
                        minWidth: "150px",
                        padding: "8px 10px",
                        border:
                          "1px solid rgba(164, 124, 61, 0.2)",
                        borderRadius: "8px",
                        outline: "none",
                        background:
                          "rgba(255, 255, 255, 0.7)",
                        color: "#4f493f",
                        fontSize: "12px",
                      }}
                    />

                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={savingName}
                      style={{
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 11px",
                        color: "#fff",
                        background:
                          "linear-gradient(145deg, #d0aa68, #a57838)",
                        fontSize: "9px",
                        fontWeight: 700,
                        cursor:
                          savingName
                            ? "wait"
                            : "pointer",
                        opacity:
                          savingName
                            ? 0.65
                            : 1,
                      }}
                    >
                      {savingName
                        ? "Saving..."
                        : "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleCancelEditing
                      }
                      disabled={savingName}
                      style={{
                        border:
                          "1px solid rgba(92, 74, 45, 0.12)",
                        borderRadius: "8px",
                        padding: "8px 11px",
                        color: "#71695d",
                        background:
                          "rgba(255, 255, 255, 0.5)",
                        fontSize: "9px",
                        fontWeight: 700,
                        cursor:
                          savingName
                            ? "wait"
                            : "pointer",
                      }}
                    >
                      Cancel
                    </button>

                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >

                    <strong>
                      {displayName}
                    </strong>

                    <button
                      type="button"
                      onClick={
                        handleStartEditing
                      }
                      style={{
                        border:
                          "1px solid rgba(164, 124, 61, 0.14)",
                        borderRadius: "7px",
                        padding: "5px 8px",
                        color: "#8e6938",
                        background:
                          "rgba(220, 188, 128, 0.1)",
                        fontSize: "8px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>

                  </div>
                )}

              </div>

            </div>


            {/* ===============================================
                EMAIL
            =============================================== */}

            <div className="profile-info-card">

              <div className="profile-info-icon">
                @
              </div>

              <div>

                <span>
                  EMAIL ADDRESS
                </span>

                <strong>
                  {email}
                </strong>

              </div>

            </div>


            {/* ===============================================
                ACCOUNT TYPE
            =============================================== */}

            <div className="profile-info-card">

              <div className="profile-info-icon">
                ◆
              </div>

              <div>

                <span>
                  ACCOUNT TYPE
                </span>

                <strong>
                  Citizen
                </strong>

              </div>

            </div>


            {/* ===============================================
                ACCOUNT STATUS
            =============================================== */}

            <div className="profile-info-card">

              <div className="profile-info-icon">
                ✓
              </div>

              <div>

                <span>
                  ACCOUNT STATUS
                </span>

                <strong className="profile-status-active">
                  {user?.is_active
                    ? "Active"
                    : "Inactive"}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            SECURITY
        =================================================== */}

        <section className="profile-security-card">

          <div className="profile-security-icon">
            ◈
          </div>

          <div className="profile-security-content">

            <span>
              ACCOUNT SECURITY
            </span>

            <h2>
              Keep your account secure.
            </h2>

            <p>
              Your CivicMind AI account is protected
              by authenticated access. Never share your
              password or login credentials with anyone.
            </p>

          </div>

          <div className="profile-security-badge">

            <span></span>

            Secure

          </div>

        </section>


        {/* ===================================================
            ACCOUNT ACTIONS
        =================================================== */}

        <section className="profile-actions">

          <button
            type="button"
            className="profile-dashboard-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Back to dashboard
          </button>

          <button
            type="button"
            className="profile-logout-main"
            onClick={handleLogout}
          >
            Logout

            <span>
              ↪
            </span>
          </button>

        </section>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="profile-footer">

          <div>

            <strong>
              CivicMind AI
            </strong>

            <span>
              Intelligence for better communities.
            </span>

          </div>

          <div className="profile-footer-status">

            <span></span>

            Citizen portal active

          </div>

        </footer>

      </main>

    </div>
  );
}

export default Profile;