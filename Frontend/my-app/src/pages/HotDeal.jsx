import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingCards from "../components/ListingCards";
import {getHotDeals} from "../api/listing.api"
import "../styles/TrendingListings.css"
import Navbar from "./Navbar";
function HotDeal() {
    const [hotDealisting,setHotDeal]=useState([]);
    const navigate=useNavigate();
    useEffect(()=>{
        const gethotLists=async()=>{
            try {
                const data=await getHotDeals();
                if(!data){
                    return;
                }
                setHotDeal(data);
            } catch (error) {
                setHotDeal([]);
            }
        }
        gethotLists();
    },[]); //only onces
  return (
    <>
    <Navbar />

<div className="trending-page">
  <div className="trending-page-container">
    <h2 className="page-title">Hot Deals</h2>

    <div className="trending-grid">
      {hotDealisting.map((item) => (
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

export default HotDeal
