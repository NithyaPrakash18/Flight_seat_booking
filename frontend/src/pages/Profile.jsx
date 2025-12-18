import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import "../styles/Profile.css";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      fetchBookingStats();
    }
  }, [user]);

  const fetchBookingStats = async () => {
    try {
      const response = await api.get(`/bookings/user/${user.id}`);
      const bookings = response.data.data;

      const now = new Date();
      const stats = {
        total: bookings.length,
        upcoming: bookings.filter(
          (b) =>
            new Date(b.journeyDate) > now && b.bookingStatus === "confirmed"
        ).length,
        completed: bookings.filter(
          (b) =>
            new Date(b.journeyDate) <= now && b.bookingStatus === "confirmed"
        ).length,
        cancelled: bookings.filter((b) => b.bookingStatus === "cancelled")
          .length,
      };

      setBookingStats(stats);
    } catch (err) {
      console.error("Error fetching booking stats:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.put("/users/profile", formData);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      setPasswordLoading(false);
      return;
    }

    try {
      await api.put("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(
        err.response?.data?.error || "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMemberSince = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });
    }
    return "Recently";
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="avatar-large">
            {user?.name && getInitials(user.name)}
          </div>
          <div className="header-info">
            <h1>{user?.name}</h1>
            <p className="user-email-header">{user?.email}</p>
            <p className="member-badge">
              <span className="badge-icon">⭐</span>
              Member since {getMemberSince()}
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="tab-icon">📊</span>
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            <span className="tab-icon">✏️</span>
            Edit Profile
          </button>
          <button
            className={`tab-button ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <span className="tab-icon">🔒</span>
            Security
          </button>
          <button
            className="tab-button logout-button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <span className="tab-icon">🚪</span>
            Logout
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="tab-pane">
              {/* Booking Statistics */}
              <div className="stats-section">
                <h2>Booking Statistics</h2>
                <div className="stats-grid">
                  <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                      <p className="stat-value">{bookingStats.total}</p>
                      <p className="stat-label">Total Bookings</p>
                    </div>
                  </div>
                  <div className="stat-card upcoming">
                    <div className="stat-icon">🚌</div>
                    <div className="stat-info">
                      <p className="stat-value">{bookingStats.upcoming}</p>
                      <p className="stat-label">Upcoming Trips</p>
                    </div>
                  </div>
                  <div className="stat-card completed">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <p className="stat-value">{bookingStats.completed}</p>
                      <p className="stat-label">Completed</p>
                    </div>
                  </div>
                  <div className="stat-card cancelled">
                    <div className="stat-icon">❌</div>
                    <div className="stat-info">
                      <p className="stat-value">{bookingStats.cancelled}</p>
                      <p className="stat-label">Cancelled</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="info-card">
                <h2>Personal Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-icon">👤</span>
                    <div>
                      <p className="info-label">Full Name</p>
                      <p className="info-value">{user?.name}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📧</span>
                    <div>
                      <p className="info-label">Email</p>
                      <p className="info-value">{user?.email}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📱</span>
                    <div>
                      <p className="info-label">Phone</p>
                      <p className="info-value">
                        {user?.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">🎭</span>
                    <div>
                      <p className="info-label">Role</p>
                      <p className="info-value">
                        {user?.role === "admin" ? "Administrator" : "Customer"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === "edit" && (
            <div className="tab-pane">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="edit-card">
                <h2>Update Your Information</h2>
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="tab-pane">
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="success-message">{passwordSuccess}</div>
              )}

              <div className="security-card">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="profile-form">
                  <div className="form-group">
                    <label>Current Password *</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password *</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password (min 6 characters)"
                      required
                      minLength="6"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      required
                      minLength="6"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={passwordLoading}
                  >
                    {passwordLoading
                      ? "Changing Password..."
                      : "Change Password"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
