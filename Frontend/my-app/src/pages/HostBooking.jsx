import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar";
import { getHostBookings, performBookingAction } from "../api/booking.api"; 
import { useAuthContext } from '../utils/AuthContext';
import { MapPin, X, Check, Star, SearchX } from 'lucide-react';
import "../styles/HostListing.css"
import Alert from "../components/Alert"; 
function HostBooking() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [hostBookings, setHostBookings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
 const [alertMsg, setAlertMsg] = useState("");
  useEffect(() => {
    const loadBookings = async () => {
      try {
        if (!isAuthenticated) return;
        setDataLoading(true);
        const data = await getHostBookings();
        setHostBookings(data || []);
      } catch (error) {
        setAlertMsg("Failed to load bookings", error);
        setHostBookings([]);
      } finally {
        setDataLoading(false);
      }
    };

    loadBookings();
  }, [isAuthenticated, authLoading]);

  const handleAction = async (e, bookingId, status) => {
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this booking?`)) return;

    try {
      await performBookingAction(bookingId, status);

      setHostBookings(prev =>
        prev.map(item =>
          item._id === bookingId ? { ...item, status } : item
        )
      );
    } catch (error) {
      console.error("Action failed:", error);
      setAlertMsg("Already Booked for this Days");
    }
  };

  return (
    <div className="history-page">
      <Navbar />
         <Alert msg={alertMsg} shut={() => setAlertMsg("")} />

      <div className="history-container">

        <header className="history-header">
          <div className="header-content">
            <h1>Booking Requests</h1>
            <p>Approve or reject guest booking requests.</p>
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

          {!dataLoading && hostBookings.length > 0 && (
            hostBookings.map((item, index) => {

              const listing = item.listingId;

              if (!listing) return null;
                console.log(listing);
                
              return (
                <div 
                  key={item._id || index}
                  className="history-item-wrapper"
                  style={{ animationDelay: `${index * 100}ms` }}
                >

                  <div className="listing-card-inner">

                    <div className="card-image-box">
            <img 
              src={listing.images?.[0]} 
              alt={listing.title} 
              className="card-img"
            />
          </div>

                    <div className="card-details">
                      <h3 className="card-title">{listing.title}</h3>

                      <div className="card-meta-row">
  <MapPin size={14} className="meta-icon" />
  <span>
    {listing.location.address || 
     `${listing.location.city}, ${listing.location.state}`}
  </span>
</div>

                      <div className="card-meta-row">
                        <Star size={14} className="meta-icon star" />
                        <span>{item.rooms} Room(s)</span>
                      </div>

                      <div className="card-price-row">
                        <span className="price-final">₹ {item.totalAmount}</span>
                        <span className="price-unit"> total</span>
                      </div>

                      <div className="card-meta-row">
                     <span>
  Status:{" "}
  {item.status === "APPROVED" ? (
    <strong style={{ color: "green" }}>{item.status}</strong>
  ) : (
    <strong style={{ color: "red" }}>{item.status}</strong>
  )}
</span>

                      </div>
                    </div>

                    <div className="card-actions">
                      {item.status === "PENDING" && (
                        <>
                          <button 
                            className="action-btn edit"
                            title="Approve Booking"
                            onClick={(e) => handleAction(e, item._id, "APPROVED")}
                          >
                            <Check size={18} />
                          </button>

                          <button 
                            className="action-btn delete"
                            title="Reject Booking"
                            onClick={(e) => handleAction(e, item._id, "REJECTED")}
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}

                      {item.status !== "PENDING" && (
                        <span style={{ fontSize: "12px", color: "#888" }}>
                          Processed
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}

          {!dataLoading && hostBookings.length === 0 && (
            <div className="empty-state">
              <SearchX size={48} color="#CCCCCC" />
              <h3>No booking requests found</h3>
              <p>You have no booking requests yet.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default HostBooking;
