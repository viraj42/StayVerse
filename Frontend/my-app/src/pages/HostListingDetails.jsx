import React, { useState, useEffect } from "react";
import Navbar from "../pages/Navbar";
import "../styles/ListingDetail.css";
import GuestReviewPage from "./GuestReviewPage";
import { getListingById } from "../api/listing.api";
import { useParams, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { Star, MapPin, Heart } from "lucide-react";
import {ArrowLeft} from "lucide-react"
import { useAuthContext } from "../utils/AuthContext";
import { trackActivity } from "../api/userActivity.api";
import ListingMap from "../components/ListingMap";

//map icon from lucide
const facilityIcons = {
  "Indoor swimming pool": Icons.Waves,
  "Free parking": Icons.ParkingCircle,
  "Room service": Icons.Bell,
  "Restaurant": Icons.Utensils,
  "Non-smoking rooms": Icons.Ban,
  "Free Wifi": Icons.Wifi,
  "Family rooms": Icons.Users,
  "24-hour front desk": Icons.Clock,
  "Fitness center": Icons.Dumbbell,
  "Garden": Icons.TreePine,
  "Terrace": Icons.Sun,
  "Private parking": Icons.ParkingSquare,
  "Swimming Pool": Icons.WavesLadder,
  "Air Conditioning": Icons.Fan
};

function HostListingDetails() {
  const { isAuthenticated, loading } = useAuthContext();
  const { id } = useParams();
  const navigate = useNavigate();

  const [listDetail, setListDetail] = useState({
    title: "",
    images: [],
    location: {},
    description: "",
    pricePerNight: 0,
    facilities: [],
    highlights: [],
    avgRating: 0,
    hostName: "",
    hostJoined: ""
  });

  useEffect(() => {
    const listingDetail = async () => {
      try {
        const data = await getListingById(id);
        if (data) setListDetail(data);
      } catch {
        console.error("Listing fetch failed");
      }
    };
    if (id) listingDetail();
  }, [id]);

  const handleUpdateListing = () => {
    navigate(`/host/manage-listings/${id}`);
  };

  const handleback=()=>{
    navigate(-1);
  }
  
  return (
    <>
      <Navbar />

      <div className="listing-container">

        <header className="listing-header">
          <div>
            <span><ArrowLeft style={{ cursor: "pointer", border:"1px solid #FEBF4F",borderRadius:"2px",height:"30px",width:"30px"}} onClick={handleback}/></span>
            <h1 className="listing-title">{listDetail.title}</h1>
            <div className="listing-sub-info">
              <span>
                <Star size={16} fill="var(--text-primary)" />{" "}
                <b>{listDetail.avgRating}</b>
              </span>
              <span className="dot">·</span>
              <span className="underline">
                {listDetail.location?.address}
              </span>
            </div>
          </div>

        </header>
        <section className="image-grid-section">
          <div className="image-grid">
            <div className="img-main">
              {listDetail.images[0] && (
                <img src={listDetail.images[0]} alt="Main" />
              )}
            </div>
            <div className="img-sub">
              {listDetail.images[1] && (
                <img src={listDetail.images[1]} alt="Sub1" />
              )}
            </div>
            <div className="img-sub">
              {listDetail.images[2] && (
                <img src={listDetail.images[2]} alt="Sub2" />
              )}
            </div>
            <div className="img-sub">
              {listDetail.images[3] && (
                <img src={listDetail.images[3]} alt="Sub3" />
              )}
            </div>
            <div className="img-sub">
              {listDetail.images[4] && (
                <img src={listDetail.images[4]} alt="Sub4" />
              )}
            </div>
          </div>
        </section>

        <div className="listing-content-layout">
          <div className="listing-details-left">

            <div className="host-section">
              <div>
                <h2>Hosted by {listDetail.hostName}</h2>
                <p className="text-muted">
  Joined in {new Date(listDetail.hostJoined).getFullYear()}
</p>
              </div>
            </div>

            <hr className="divider" />

            <div className="description-section">
              <p>{listDetail.description}</p>
            </div>

            <hr className="divider" />
            <div className="amenities-section">
              <h2>What this place offers</h2>
              <div className="amenities-grid">
                {(listDetail.facilities || []).map((item, index) => {
                  const IconComponent =
                    facilityIcons[item] || Icons.HelpCircle;

                  return (
                    <div key={index} className="amenity-item">
                      <IconComponent size={18} />
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="divider" />

                 <div className="map-placeholder">
  <ListingMap 
    lat={listDetail.location?.lat} 
    lng={listDetail.location?.lng} 
  />
  <span className="text-muted">
    {listDetail.location?.address}
  </span>
</div>

          </div>
          <div className="listing-details-right">
            <div className="booking-card">


              <div className="booking-header">
                <h3>
                  ₹{listDetail.pricePerNight.toLocaleString()}
                  <span className="price-unit"> night</span>
                </h3>
                <div className="rating-tag">
                  <Star size={14} fill="var(--text-primary)" />
                  <span>{listDetail.avgRating}</span>
                </div>
              </div>

              <button
                className="book-btn"
                onClick={handleUpdateListing}
              >
                Update Listing
              </button>

          </div>
          </div>

             </div>
                    <section className="listing-review-section">
  <GuestReviewPage listingId={id} />
</section>
      </div>
       </>
  );
}

export default HostListingDetails;
