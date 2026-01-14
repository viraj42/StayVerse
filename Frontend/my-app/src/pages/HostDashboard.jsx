import React, { useEffect, useState } from "react";
import "../styles/HostDashboard.css";
import { getHostDashboard } from "../api/hostDashboard.api";
import Navbar from "./Navbar";
import Loader from "../components/Loader";

const HostDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getHostDashboard();
        setData(response);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoad(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Loader while fetching
  if (load) return <Loader />;

  // Error state
  if (error) return <div style={{ padding: "20px" }}>{error}</div>;

  // Safety check (prevents null crash)
  if (!data) return null;

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <div className="dash-header">
          <h1>Host Dashboard</h1>
          <p>Welcome back!!</p>
        </div>

        {/* ===== Stats Section ===== */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Listings</div>
            <div className="stat-value">{data.totalListings}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total Earnings</div>
            <div className="stat-value money">
              ₹{data.totalEarnings.toLocaleString()}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Pending Requests</div>
            <div className="stat-value">{data.pendingBookingsCount}</div>
          </div>
        </div>

        {/* ===== Details Section ===== */}
        <div className="details-grid">

          {/* Pending Requests */}
          <div className="section-box">
            <h3 className="section-title">Pending Requests</h3>
            <div className="request-list">
              {data.recentRequests.length > 0 ? (
                data.recentRequests.map((req) => (
                  <div key={req._id} className="list-item">
                    <div className="item-info">
                      <h4>{req.guestId?.name || "Guest"}</h4>
                      <p>Listing: {req.listingId?.title}</p>
                      <p>
                        Request sent:{" "}
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="status-badge status-pending">
                      Pending
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">No pending requests</div>
              )}
            </div>
          </div>

          {/* Approved Bookings */}
          <div className="section-box">
            <h3 className="section-title">Approved Bookings</h3>
            <div className="upcoming-list">
              {data.upcomingBookings.length > 0 ? (
                data.upcomingBookings.map((booking) => (
                  <div key={booking._id} className="list-item">
                    <div className="item-info">
                      <h4>{booking.listingId?.title}</h4>
                      <p>
                        {new Date(booking.startDate).toLocaleDateString()} -{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="status-badge status-approved">
                      Approved
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">No upcoming bookings</div>
              )}
            </div>
          </div>

          {/* Top Listings */}
          <div className="section-box">
            <h3 className="section-title">Top Listings</h3>
            <div className="top-list">
              {data.topListings.length > 0 ? (
                data.topListings.map((listing) => (
                  <div key={listing._id} className="list-item">
                    <div className="item-info">
                      <h4>{listing.title}</h4>
                      <p>
                        {listing.viewsCount} Views • {listing.bookingCount} Bookings
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No listings yet</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default HostDashboard;
