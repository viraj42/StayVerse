import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";
import "../styles/SearchHistory.css";

import { MapPin, SearchX } from "lucide-react";

import FeatureCard from "../components/FeatureCard";
import WishButton from "../components/WishButton";
import { useWishlist } from "../utils/WishlistContext";
import { useAuthContext } from "../utils/AuthContext";

function WishlistPage() {
  const { isAuthenticated, loading: authLoading, role } = useAuthContext();
  const { wishlistIds, loadingWishlist } = useWishlist();

  const [wishlistItems, setWishlistItems] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const loadWishlistItems = async () => {
      try {
        const { getWishlist } = await import("../api/wishlist.api");
        const data = await getWishlist();
        setWishlistItems(data.items || []);
      } catch {
        setWishlistItems([]);
      }
    };

    if (isAuthenticated && role === "guest") {
      loadWishlistItems();
    }
  }, [isAuthenticated, role, wishlistIds]);

  const handleCardClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  if (!authLoading && !isAuthenticated) return null;

  return (
    <div className="history-page">
      <Navbar />

      <div className="history-container">
        <header className="history-header">
          <div className="header-content">
            <h1>Your Wishlist</h1>
            <p>All properties you liked are saved here.</p>
          </div>
        </header>

        <div className="history-list">

          {(authLoading || loadingWishlist) && (
            <>
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </>
          )}

          {!loadingWishlist && wishlistItems.length > 0 && (
            wishlistItems.map((item, index) => {

              const isEven = index % 2 === 0;
              const accents = ["purple", "red", "yellow", "blue"];
              const currentAccent = accents[index % accents.length];

              return (
                <div
                  key={item._id}
                  className="history-item-wrapper"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div style={{ position: "relative" }}>

                    {/* Heart Button Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        zIndex: 10
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <WishButton listingId={item._id} />
                    </div>

                    <FeatureCard
                      layout="horizontal"
                      align={isEven ? "left" : "right"}
                      title={item.title}
                      description={
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {item.location.city}, {item.location.state}
                        </span>
                      }
                      image={item.images?.[0] || "https://via.placeholder.com/600x400?text=No+Image"}
                      icon={<MapPin size={24} />}
                      accent={currentAccent}
                      onClick={() => handleCardClick(item._id)}
                    />
                  </div>
                </div>
              );
            })
          )}

          {!loadingWishlist && wishlistItems.length === 0 && (
            <div className="empty-state">
              <SearchX size={48} color="#CCCCCC" />
              <h3>No items in wishlist</h3>
              <p>Tap the heart icon on listings to save them here.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default WishlistPage;
