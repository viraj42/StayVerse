import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { getGuestBookings, cancelGuestBooking } from "../api/booking.api";
import { useAuthContext } from "../utils/AuthContext";
import { MapPin, Calendar, XCircle, SearchX, BadgeCheck, BadgeX } from "lucide-react";
import "../styles/HostListing.css";
import Alert from "../components/Alert"; 

function GuestBooking() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [guestBookings, setGuestBookings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      if (!isAuthenticated) return;

      setDataLoading(true);

      try {
        const data = await getGuestBookings();
        setGuestBookings(data || []);
      } catch {
        setGuestBookings([]);
      } finally {
        setDataLoading(false);
      }
    };

    loadBookings();
  }, [isAuthenticated, authLoading]);

  // Cancel booking → remove from UI
  const handleCancel = async (e, bookingId) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await cancelGuestBooking(bookingId);

      setGuestBookings(prev =>
        prev.filter(b => b._id !== bookingId)
      );
    } catch (err) {
      console.error("Cancel failed:", err);
      setAlertMsg("Could not cancel booking");
    }
  };

  const renderStatusBadge = (status) => {
    if (status === "APPROVED") {
      return (
        <span className="card-badge" style={{ backgroundColor: "#16a34a" }}>
          <BadgeCheck size={14} /> Approved
        </span>
      );
    }
    if (status === "REJECTED") {
      return (
        <span className="card-badge" style={{ backgroundColor: "#dc2626" }}>
          <BadgeX size={14} /> Rejected
        </span>
      );
    }
    return (
      <span className="card-badge" style={{ backgroundColor: "#f59e0b" }}>
        Pending
      </span>
    );
  };

  return (
    <div className="history-page">
      <Navbar />
      <Alert msg={alertMsg} shut={() => setAlertMsg("")} />

      <div className="history-container">

        <header className="history-header">
          <div className="header-content">
            <h1>My Bookings</h1>
            <p>Track your reservation status and manage bookings.</p>
          </div>
        </header>

        <div className="history-list">

          {(authLoading || dataLoading) && (
            <>
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </>
          )}
                
          {!dataLoading && guestBookings.length > 0 && (
            guestBookings.map((item, index) => {

              const basePrice = item.listingId.pricePerNight;
              const discount = item.listingId.discountPercentage || 0;
              const discountedPrice = Math.round(
                basePrice - (basePrice * discount) / 100
              );

              return (
                <div
                  key={item._id || index}
                  className="history-item-wrapper"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/booking/details/${item._id}`)}
                >
                  <div className="listing-card-inner">

                    <div className="card-image-box">
                      <img
                        src={item.listingImage || "/placeholder.jpg"}
                        alt={item.listingTitle}
                        className="card-img"
                      />
                      {renderStatusBadge(item.status)}
                    </div>

                    <div className="card-details">
                      <h3 className="card-title">{item.listingTitle}</h3>

                      <div className="card-meta-row">
                        <MapPin size={14} className="meta-icon" />
                        <span>
                          {item.listingLocation
                            ? `${item.listingLocation.city}, ${item.listingLocation.state}`
                            : "Location unavailable"}
                        </span>
                      </div>

                      <div className="card-meta-row">
                        <Calendar size={14} className="meta-icon" />
                        <span>
                          {new Date(item.startDate).toLocaleDateString()} →{" "}
                          {new Date(item.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="card-price-row">
                        <span className="price-final">₹ {item.totalAmount}</span>
                        <span className="price-unit"> total</span>
                      </div>

                      {discount > 0 && (
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          ₹ {discountedPrice} / night after {discount}% off
                        </div>
                      )}

                    </div>

                    <div className="card-actions">
                      {item.status === "PENDING" && (
                        <button
                          className="action-btn delete"
                          onClick={(e) => handleCancel(e, item._id)}
                          title="Cancel Booking"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}

          {!dataLoading && guestBookings.length === 0 && (
            <div className="empty-state">
              <SearchX size={48} color="#CCCCCC" />
              <h3>No bookings found</h3>
              <p>You have not made any reservations yet.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default GuestBooking;
