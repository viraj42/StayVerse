import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  MapPin,
  Calendar,
  CreditCard,
  Home
} from "lucide-react";

import "../styles/ProfilePage.css";
import { apiRequest } from "../api/apiClient";
import { uploadProfileImage } from "../api/profileImage.api";
import Navbar from "./Navbar";
const ProfilePage = () => {

  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [click,setClick]=useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await apiRequest("/profile/me", "GET", null, true);
        setUser(profileData);

        setFormData({
          name: profileData.name,
          email: profileData.email
        });

        const dashboardData = await apiRequest("/profile/me/dashboard", "GET", null, true);
        setDashboard(dashboardData);
        setClick(false)
      } catch (err) {
        console.error("Profile Load Error:", err.message);
      }
    };

    loadProfile();
  },[click]);

  const handleImageClick = () => fileInputRef.current.click();
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const updatedUser = await uploadProfileImage(file);
      setUser(updatedUser);
      setProfileImage(updatedUser.profileImage);
    } catch (err) {
      console.error("Upload error:", err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updated = await apiRequest(
        "/profile/me",
        "PATCH",
        {
          name: formData.name,
          email: formData.email
        },
        true
      );
      setUser(updated);
      setFormData({
        name: updated.name,
        email: updated.email
      });
      setClick(true);
    } catch (err) {
      console.error("Update Error:", err.message);
    }
  };

  const renderHostStats = () => (
    <div className="dashboard-section">
      <h2 className="section-title">Hosting Dashboard</h2>
        <div className="stat-card-container">
        <div className="stat-card">
          <Home size={20} />
          <span className="stat-value">{dashboard?.listingsCount || 0}</span>
          <span className="stat-label">Active Listings</span>
        </div>

        <div className="stat-card">
          <CreditCard size={20} />
          <span className="stat-value">₹{dashboard?.earnings || 0}</span>
          <span className="stat-label">Total Earnings</span>
        </div>

        <div className="stat-card">
          <Calendar size={20} />
          <span className="stat-value">{dashboard?.upcomingBookings || 0}</span>
          <span className="stat-label">Upcoming Bookings</span>
        </div>
      </div>
    </div>
  );

  const renderGuestStats = () => (
    <div className="dashboard-section">
      <h2 className="section-title">Your Trips</h2>
      <div className="stat-card-container">
        <div className="stat-card">
          <MapPin size={20} />
          <span className="stat-value">{dashboard?.citiesVisited || 0}</span>
          <span className="stat-label">Cities Visited</span>
        </div>

        <div className="stat-card">
          <Calendar size={20} />
          <span className="stat-value">{dashboard?.upcomingTrips || 0}</span>
          <span className="stat-label">Upcoming Trips</span>
        </div>

        <div className="stat-card">
          <Home size={20} />
          <span className="stat-value">{dashboard?.totalTrips || 0}</span>
          <span className="stat-label">Total Trips</span>
        </div>
      </div>
    </div>
  );

  if (!user) return <p style={{ padding: "40px" }}>Loading profile...</p>;

  return (
    <>
      <Navbar></Navbar>
      <div className="profile-page-wrapper">
      <div className="dashboard-container">

        <div className="profile-header">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img
                src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}`}
                alt="Profile"
                className="avatar-img"
              />
            </div>
            <button className="avatar-upload-btn" onClick={handleImageClick}>
              <Camera size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="user-meta">
            <h1>{user.name}</h1>
            <p className="section-subtitle">{user.email}</p>
            <span className="role-badge">
              {user.role === "host" ? "Property Host" : "Guest"}
            </span>
          </div>
        </div>

        <div className="profile-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div>

            <div className="dashboard-section">
              <h2 className="section-title">Personal Information</h2>
              <p className="section-subtitle">Update your details.</p>

              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <button className="btn-primary">Save</button>
              </form>
            </div>

            {user.role === "host"
              ? renderHostStats()
              : renderGuestStats()
            }
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfilePage;
