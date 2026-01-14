import React from 'react';
import { 
  Calendar, 
  MapPin, 
  User, 
  Home, 
  Info, 
  CheckCircle, 
  Clock, 
  XCircle 
} from 'lucide-react';
import "../styles/BookingDetailCard.css";

const BookingDetailCard = ({ booking }) => {
  if (!booking) return null;

  const { listingId, guestId, hostId, status, startDate, endDate, rooms, addons, totalAmount, createdAt, _id } = booking;

  const getStatusStyle = (s) => {
    switch (s) {
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  return (
    <div className="booking-detail-card">
      {/* Property & Identity Header */}
      <div className="bd-header">
        <div className="bd-image-wrapper">
          <img src={listingId.images?.[0] || "/placeholder.jpg"} alt={listingId.title} />
        </div>
        <div className="bd-title-info">
          <div className={`bd-status-badge ${getStatusStyle(status)}`}>
            {status}
          </div>
          <h2 className="bd-listing-title">{listingId.title}</h2>
          <p className="bd-location-text">
            <MapPin size={14} /> {listingId.location.city}, {listingId.location.state}
          </p>
        </div>
      </div>

      <div className="bd-divider"></div>

      {/* Main Details Grid */}
      <div className="bd-info-grid">
        <div className="bd-info-item">
          <label><Calendar size={14} /> Stay Dates</label>
          <p>{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</p>
        </div>
        <div className="bd-info-item">
          <label><Home size={14} /> Property Type</label>
          <p>{listingId.propertyType}</p>
        </div>
        <div className="bd-info-item">
          <label><User size={14} /> Guest Details</label>
          <p>{guestId.name} <span>({guestId.email})</span></p>
        </div>
        <div className="bd-info-item">
          <label><Info size={14} /> Booking ID</label>
          <p className="bd-id-text">#{_id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* Addons Section */}
      {addons && (addons.breakfast || addons.lunch || addons.dinner) && (
        <div className="bd-addons-section">
          <label>Included Add-ons</label>
          <div className="bd-addon-pills">
            {addons.breakfast && <span>Breakfast</span>}
            {addons.lunch && <span>Lunch</span>}
            {addons.dinner && <span>Dinner</span>}
          </div>
        </div>
      )}

      <div className="bd-divider"></div>

      {/* Summary Section */}
      <div className="bd-footer">
        <div className="bd-footer-left">
          <p className="bd-created-at">Booked on: {new Date(createdAt).toLocaleDateString()}</p>
          <p className="bd-rooms-count">{rooms} Room(s) x ₹{listingId.pricePerNight}/night</p>
        </div>
        <div className="bd-total-box">
          <label>Total Paid</label>
          <span className="bd-total-amount">₹{totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailCard;