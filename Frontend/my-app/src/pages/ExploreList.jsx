import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ListingCards from "../components/ListingCards";
import { exploreByLocation } from "../api/listing.api";
import "../styles/TrendingListings.css";
import { ArrowLeft } from "lucide-react";
import Navbar from "./Navbar";
import Loader from "../components/Loader";

function ExploreList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city");
  
  const [listings, setListings] = useState([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const query = {};
        if (city) query.city = city;

        const data = await exploreByLocation(query);
        setListings(Array.isArray(data) ? data : []);
      } catch (error) {
        setListings([]);
      } finally {
        setLoad(false);
      }
    };

    loadFeed();
  }, [city]);

  const handleback = () => navigate(-1);

  // Normalize location for card display
  const formatLocation = (location) => {
    if (!location) return "Unknown Location";
    if (typeof location === "string") return location;
    if (typeof location === "object")
      return `${location.city}, ${location.state}`;
    return "Unknown Location";
  };

  return (
    <>
      <Navbar />

      {load ? (
        <Loader />
      ) : (
        <div className="trending-page">
          <div className="trending-page-container">
            <span>
              <ArrowLeft
                style={{
                  cursor: "pointer",
                  border: "1px solid #FEBF4F",
                  borderRadius: "2px",
                  height: "30px",
                  width: "30px",
                }}
                onClick={handleback}
              />
            </span>

            <h2 className="page-title">
              Explore <span>{city}</span>
            </h2>
            <hr />

            <div className="trending-grid">
              {listings.length === 0 && (
                <p style={{ padding: "20px" }}>No listings found.</p>
              )}

              {listings.map((item) =>
                item?._id ? (
                  <div
                    key={item._id}
                    className="trending-grid-card"
                     onClick={() => navigate(`/listing/${item._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <ListingCards
                      title={item.title}
                      image={item.image}
                      location={formatLocation(item.location)}
                      rating={item.rating || 0}
                      ratingLabel={item.ratingLabel}
                      reviewCount={item.reviewCount}
                      finalPrice={item.finalPrice}
                      originalPrice={item.originalPrice}
                      badgeText={item.badgeText}
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExploreList;
