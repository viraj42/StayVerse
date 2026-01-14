import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BookingDetailCard from "../components/BookingDetailCard";
import Loader from "../components/Loader";
import "../styles/BookingDetailsPage.css";
import { apiRequest } from "../api/apiClient";
import Navbar from "../pages/Navbar"
import {ArrowLeft} from "lucide-react"
import { useNavigate } from "react-router-dom";
const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // apiRequest already returns parsed JSON
        const data = await apiRequest(`/bookings/details/${bookingId}`);
        setBooking(data.booking);
      } catch (err) {
        console.error("Failed to load booking", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="booking-details-loader">
        <Loader />
      </div>
    );
  }

    const handleback=()=>{
    navigate(-1);
  }

  return (
    <>
    <Navbar/>
    <div className="booking-details-page">
       <span><ArrowLeft style={{ cursor: "pointer", border:"1px solid #FEBF4F",borderRadius:"2px",height:"30px",width:"30px"}} onClick={handleback}/></span>
      <div className="booking-details-container">
        <BookingDetailCard booking={booking} />
      </div>
    </div>
        </>
  );

};

export default BookingDetailsPage;
