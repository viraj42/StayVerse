import React, { useEffect, useState } from "react";
import ListingCards from "../components/ListingCards";
import { useNavigate } from "react-router-dom";
import { getTrendingListings } from "../api/listing.api";
import "../styles/TrendingListings.css";
import Navbar from "./Navbar";

function TrendingListings() {
  const navigate = useNavigate();
  const [trendingList, setTrendingList] = useState([]);

  useEffect(() => {
    const loadTrend = async () => {
      try {
        const data = await getTrendingListings();
        setTrendingList(data || []);
      } catch {
        setTrendingList([]);
      }
    };
    loadTrend();
  });

  return (
     <>
      <Navbar />

      <div className="trending-page">
        <div className="trending-page-container">
          <h2 className="page-title">Trending Stays</h2>

          <div className="trending-grid">
            {trendingList.map((item) => (
              <div
                key={item._id}
                className="trending-grid-card"
                onClick={() => navigate(`/listing/${item._id}`)} 
                style={{ cursor: "pointer" }}                  
              >
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
  );
}

export default TrendingListings;