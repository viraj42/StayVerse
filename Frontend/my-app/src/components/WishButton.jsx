import React, { useState } from "react";
import { useWishlist } from "../utils/WishlistContext";

const HeartIcon = ({ filled }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "#FF385C" : "none"}
    stroke={filled ? "#FF385C" : "#FF385C"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);
function WishButton({ listingId }) {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const [loading, setLoading] = useState(false);
  const liked = wishlistIds.includes(listingId);
  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      await toggleWishlist(listingId);
    } catch (error) {
      console.error("Wishlist update failed", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span onClick={handleToggleWishlist} style={{ cursor: "pointer" }}>
      <HeartIcon filled={liked} />
    </span>
  );
}

export default WishButton;
