import React, { useState, useRef, useEffect } from "react";
import Navbar from "../pages/Navbar";
import "../styles/ListingDetail.css";
import { DateRange } from "react-date-range";
import GuestReviewPage from "./GuestReviewPage";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { getListingById } from "../api/listing.api";
import { useParams, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import {ArrowLeft} from "lucide-react"
import { Star, MapPin, Heart } from "lucide-react";
import Alert from "../components/Alert"; 
import { useAuthContext } from "../utils/AuthContext";
import { trackActivity } from "../api/userActivity.api";
import ListingMap from "../components/ListingMap";
import Loader from "../components/Loader";
import { apiRequest } from "../api/apiClient";

// simple icon map
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

function ListingDetails() {
     const [alertMsg, setAlertMsg] = useState("");
  const { isAuthenticated, loading } = useAuthContext();
   const { id } = useParams();
  const navigate = useNavigate();

const [blockedDates, setBlockedDates] = useState([]);
const [availableRooms, setAvailableRooms] = useState(0);

  // ✅ MOVED HERE (only position changed)
  const [openDate, setOpenDate] = useState(false);
  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" }
  ]);

  const dayCount = Math.round(
    (dateRange[0].endDate - dateRange[0].startDate) /
      (1000 * 60 * 60 * 24)
  );
  const totalNights = dayCount > 0 ? dayCount : 0;

  const [listDetail, setListDetail] = useState({
    title: "",
    images: [],
    location: {},
    description: "",
    pricePerNight: 0,
    facilities: [],
    highlights: [],
    discountPercentage: 0,
    avgRating: 0,
    hostName: "",
    hostJoined: "",
    maxGuestsPerRoom: 1,
    addonPrices: { breakfast: 0, lunch: 0, dinner: 0 }
  });

    // helper fn to block dates
const disabledDates = blockedDates.flatMap(b => {
  const dates = [];
  let current = new Date(b.startDate);
  const end = new Date(b.endDate);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
});

// Add dynamically blocked dates if selected range has no available rooms
const dynamicDisabledDates = [...disabledDates];

if (availableRooms === 0 && totalNights > 0) {
  let current = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);

  while (current <= end) {
    dynamicDisabledDates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
}


//fetch blocked dates
useEffect(() => {
  const loadBlockedDates = async () => {
    try {
      const data = await apiRequest(`/bookings/blocked-dates/${id}`);
      setBlockedDates(data || []);
    } catch {
      setBlockedDates([]);
    }
  };
  if (id) loadBlockedDates();
}, [id]);

//avaiable rooms
useEffect(() => {
  const fetchAvailableRooms = async () => {
    try {
      const res = await apiRequest("/bookings/available-rooms", "POST", {
        listingId: id,
        startDate: dateRange[0].startDate,
        endDate: dateRange[0].endDate
      });
      setAvailableRooms(res.availableRooms || 0);
    } catch {
      setAvailableRooms(0);
    }
  };
  if (id && totalNights > 0) fetchAvailableRooms();
}, [dateRange, id, totalNights]);

useEffect(() => {
  const listingDetail = async () => {
    try {
      const data = await getListingById(id);
      if (data) setListDetail(data);
    } catch {
      setAlertMsg("Listing fetch failed");
    }
  };
  if (id) listingDetail();
}, [id]);

useEffect(() => {
  if (loading) return;
  if (!isAuthenticated) return;

  const trackViewedListing = async () => {
    try {
      await trackActivity({ listingId: id, actionType: "view" });
    } catch {
      setAlertMsg("Activity tracking failed");
    }
  };

  if (id) trackViewedListing();
}, [id, isAuthenticated, loading]);

  const dateRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setOpenDate(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBookNow = () => {
    if(!isAuthenticated){
      setAlertMsg("Please select valid dates");
      return
    }
    if (totalNights === 0 ) {
      setAlertMsg("Please select valid dates");
      return;
    }

    navigate("/book", {
      state: {
        listing: listDetail,
        bookingData: {
          startDate: dateRange[0].startDate,
          endDate: dateRange[0].endDate,
          totalNights,
          rooms: 1
        }
      }
    });
  };

  const handleback=()=>{
    navigate(-1);
  }

  const effectiveNightPrice =
  listDetail.discountPercentage > 0
    ? Math.round(
        listDetail.pricePerNight -
        (listDetail.pricePerNight * listDetail.discountPercentage) / 100
      )
    : listDetail.pricePerNight;

  

  return (
    <>
    {loading && <Loader />}
      <Navbar />
          <Alert msg={alertMsg} shut={() => setAlertMsg("")} />

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

            {/*AMENITIES */}
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
    lat={Number(listDetail.location?.lat)} 
    lng={Number(listDetail.location?.lng)} 
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
                  ₹{effectiveNightPrice.toLocaleString()}

                  <span className="price-unit"> night</span>
                </h3>
                <div className="rating-tag">
                  <Star size={14} fill="var(--text-primary)" />
                  <span>{listDetail.avgRating}</span>
                </div>
              </div>

              <div
                className="date-input-group"
                onClick={() => setOpenDate(!openDate)}
              >
                <div className="date-field border-right">
                  <label>CHECK-IN</label>
                  <div className="input-text">
                    {format(dateRange[0].startDate, "dd/MM/yyyy")}
                  </div>
                </div>
                <div className="date-field">
                  <label>CHECKOUT</label>
                  <div className="input-text">
                    {format(dateRange[0].endDate, "dd/MM/yyyy")}
                  </div>
                </div>
              </div>

     {openDate && (
  <div className="widget-popup date-popup" ref={dateRef}>
    <DateRange
      editableDateInputs={true}
      onChange={(item) => setDateRange([item.selection])}
      moveRangeOnFirstSelection={false}
      ranges={dateRange}
      minDate={new Date()}
      rangeColors={["#FF385C"]}
      disabledDates={dynamicDisabledDates}
    />
  </div>
)}

{/* ✅ Always visible between dates and Book button */}
<div className="guest-capacity-row">
  <span>Total Rooms | Available</span>
  <span>
    {listDetail.totalRooms || 1} | {availableRooms}
  </span>
</div>


{isAuthenticated  && availableRooms > 0 && (
  <button className="book-btn" onClick={handleBookNow}>
  Book Now
</button>
)}

              {totalNights > 0 && (
                <div className="price-calc">
                  <div className="row">
                    <span>
                   ₹{effectiveNightPrice.toLocaleString()} x {totalNights} nights

                    </span>
                    <span>
                      ₹
                      {(effectiveNightPrice * totalNights).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

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

export default ListingDetails;
