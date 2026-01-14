import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListingCards from "../components/ListingCards";
import { browseByPropertyType } from "../api/listing.api";
import "../styles/TrendingListings.css";
import { ArrowLeft } from "lucide-react";
import Navbar from "./Navbar";
import Loader from "../components/Loader";
import { useAuthContext } from "../utils/AuthContext";

function BrowseByProp() {
  const navigate = useNavigate();
  const { loading } = useAuthContext(); // auth loading remains untouched
  const { types } = useParams();

  const [propListing, setPropListing] = useState([]);
  const [load, setLoad] = useState(true); // ✅ page loading state

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const data = await browseByPropertyType(types);
        if (!data) setPropListing([]);
        else setPropListing(data);
      } catch (error) {
        setPropListing([]);
      } finally {
        setLoad(false); // ✅ stop loader after fetch
      }
    };
    loadFeed();
  }, [types]);

  const handleback = () => {
    navigate(-1);
  };

  return (
    <>
      <Navbar />

      {load || loading ? ( 
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
              Explore <span>{types}</span>
            </h2>
            <hr />

            <div className="trending-grid">
              {propListing.map((item) => (
                <div
                  key={item.id} 
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
      )}
    </>
  );
}

export default BrowseByProp;
