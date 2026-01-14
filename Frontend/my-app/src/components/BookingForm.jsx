import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";
import "../styles/BookingForm.css";
import { createBooking } from "../api/booking.api";
import Alert from "./Alert";   

function BookingForm() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    if (!state) navigate("/dashboard");
  }, [state, navigate]);

  if (!state) return null;

  const { listing, bookingData } = state;

  const [rooms, setRooms] = useState(bookingData.rooms || 1);
  const [addons, setAddons] = useState({
    breakfast: false,
    lunch: false,
    dinner: false
  });

  const nights = bookingData.totalNights;
  const maxGuestsPerRoom = listing.maxGuestsPerRoom || 1;

  // -------------------------
  // PRICE CALCULATION ALIGNED WITH BACKEND
  // -------------------------

  // Base subtotal (original price)
  const baseSubtotal = listing.pricePerNight * nights * rooms;

  // Discount
  const discountPercentage = listing.discountPercentage || 0;
  const discountAmount = (baseSubtotal * discountPercentage) / 100;

  // Subtotal AFTER discount
  const discountedSubtotal = baseSubtotal - discountAmount;

  // Add-ons total
  let addonsTotal = 0;
  if (addons.breakfast)
    addonsTotal += listing.addonPrices.breakfast * nights * maxGuestsPerRoom * rooms;
  if (addons.lunch)
    addonsTotal += listing.addonPrices.lunch * nights * maxGuestsPerRoom * rooms;
  if (addons.dinner)
    addonsTotal += listing.addonPrices.dinner * nights * maxGuestsPerRoom * rooms;

  // Tax AFTER discount
  const taxAmount = (discountedSubtotal + addonsTotal) * 0.12;

  // Service fee
  const serviceFee = 500;

  // Final total
  const totalPrice = Math.round(
    discountedSubtotal + addonsTotal + taxAmount + serviceFee
  );

  // -------------------
  // Submit Booking
  // -------------------

  const handleConfirmBooking = async () => {
    try {
      await createBooking({
        listingId: listing._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        rooms,
        addons
      });

      setAlertMsg("Booking created successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error) {
      setAlertMsg("Booking failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />

      <Alert msg={alertMsg} shut={() => setAlertMsg("")} />

      <div className="booking-form-container">
        <div className="booking-form-card">

          <h2>Confirm Your Booking</h2>

          <div className="summary-row">
            <span>Listing</span>
            <span>{listing.title}</span>
          </div>

          <div className="summary-row">
            <span>Check-in</span>
            <span>{new Date(bookingData.startDate).toDateString()}</span>
          </div>

          <div className="summary-row">
            <span>Check-out</span>
            <span>{new Date(bookingData.endDate).toDateString()}</span>
          </div>

          <div className="summary-row">
            <span>Nights</span>
            <span>{nights}</span>
          </div>

          <div className="summary-row">
            <span>Rooms</span>
            <input
              type="number"
              min="1"
              value={rooms}
              onChange={(e) => setRooms(Number(e.target.value))}
            />
          </div>

          <div className="summary-row">
            <span>Max Guests per Room</span>
            <span>{maxGuestsPerRoom}</span>
          </div>

          {(listing.addonPrices.breakfast > 0 ||
            listing.addonPrices.lunch > 0 ||
            listing.addonPrices.dinner > 0) && (

            <div className="addons-section">
              <h4>Add-ons (priced per person per night)</h4>

              {listing.addonPrices.breakfast > 0 && (
                <label>
                  <input
                    type="checkbox"
                    checked={addons.breakfast}
                    onChange={(e) =>
                      setAddons({ ...addons, breakfast: e.target.checked })
                    }
                  />
                  Breakfast (₹{listing.addonPrices.breakfast})
                </label>
              )}

              {listing.addonPrices.lunch > 0 && (
                <label>
                  <input
                    type="checkbox"
                    checked={addons.lunch}
                    onChange={(e) =>
                      setAddons({ ...addons, lunch: e.target.checked })
                    }
                  />
                  Lunch (₹{listing.addonPrices.lunch})
                </label>
              )}

              {listing.addonPrices.dinner > 0 && (
                <label>
                  <input
                    type="checkbox"
                    checked={addons.dinner}
                    onChange={(e) =>
                      setAddons({ ...addons, dinner: e.target.checked })
                    }
                  />
                  Dinner (₹{listing.addonPrices.dinner})
                </label>
              )}
            </div>
          )}

          <div className="price-box">
            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{Math.round(discountedSubtotal)}</span>
            </div>

            <div className="price-row">
              <span>Add-ons</span>
              <span>₹{addonsTotal}</span>
            </div>

            <div className="price-row">
              <span>Tax (12%)</span>
              <span>₹{Math.round(taxAmount)}</span>
            </div>

            <div className="price-row">
              <span>Service Fee</span>
              <span>₹500</span>
            </div>

            <div className="price-row">
              <span>Discount</span>
              <span>-₹{Math.round(discountAmount)}</span>
            </div>

            <hr />

            <div className="price-row total">
              <span>Total Payable</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>

          <button className="confirm-btn" onClick={handleConfirmBooking}>
            Confirm Booking
          </button>

        </div>
      </div>
    </>
  );
}

export default BookingForm;
