import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ListingCards from "../components/ListingCards";
import "../styles/TrendingListings.css";
import Navbar from "./Navbar";
import { getSearchListing } from "../api/search.api";
import {ArrowLeft} from "lucide-react"
function SearchedListing() {
  const navigate = useNavigate();
  const location = useLocation();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract query from URL
  const queryParams = new URLSearchParams(location.search);
  const q = queryParams.get("q");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getSearchListing({ q });
        setListings(data?.listings || []);
      } catch (error) {
        console.error("Failed to fetch listings", error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    if (q) fetchListings();
  }, [q]);

  if (loading) return <p>Loading...</p>;

  const handleback=()=>{
    navigate(-1);
  }
  return (
    <>
      <Navbar />

      <div className="trending-page">
        <div className="trending-page-container">
           <span><ArrowLeft style={{ cursor: "pointer", border:"1px solid #FEBF4F",borderRadius:"2px",height:"30px",width:"30px"}} onClick={handleback}/></span>
          <h2 className="page-title">
            Search Results {q ? `for "${q}"` : ""}
          </h2>

          <div className="trending-grid">
            {listings.length === 0 && <p>No listings found.</p>}

            {listings.map((item) => (
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

export default SearchedListing;
