import React, { useEffect, useState } from "react";
import { useNavigate,useSearchParams  } from "react-router-dom";
import ListingCards from "../components/ListingCards";
import {exploreByLocation} from "../api/listing.api"
import "../styles/TrendingListings.css"
import {ArrowLeft} from "lucide-react"
import Navbar from "./Navbar";
function ExploreList() {
    const navigate=useNavigate();
    const [searchParams] = useSearchParams();
     const city = searchParams.get("city"); 
     console.log(city);
    const [listings,setListings]=useState([]);

   useEffect(() => {
  const loadFeed = async () => {
    try {
      const query = {};
      if (city) query.city = city;

      const data = await exploreByLocation(query);
      setListings(data || []);
    } catch (error) {
      setListings([]);
    }
  };

  loadFeed();
}, [city]);

  const handleback=()=>{
    navigate(-1);
  }

  return (
        <>
    <Navbar />

<div className="trending-page">
  <div className="trending-page-container">
     <span><ArrowLeft style={{ cursor: "pointer", border:"1px solid #FEBF4F",borderRadius:"2px",height:"30px",width:"30px"}} onClick={handleback}/></span>
    <h2 className="page-title">Explore <span>{city}</span></h2>
    <hr />

    <div className="trending-grid">
      {listings.map((item) => (
       <div key={item._id} className="trending-grid-card" onClick={() => navigate(`/listing/${item._id}`)} style={{ cursor: "pointer" }}>
          <ListingCards
            title={item.title}
            image={item.image}
            location={item.location}
            rating={item.rating}
            ratingLabel={item.ratingLabel}
            reviewCount={item.reviewCount}
            finalPrice={item.finalPrice}
            originalPrice={item.originalPrice}
            badgeText={item.badgeText}
          />
        </div>
      ))}
    </div>
  </div>
</div>
        </>
  )
}

export default ExploreList
