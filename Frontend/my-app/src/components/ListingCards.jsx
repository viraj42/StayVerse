import React from "react";
import "../styles/ListingCards.css";
import WishButton from "./WishButton";  


const ListingCards = ({
  _id,               
  image,
  title,
  location,
  rating,
  ratingLabel,
  reviewCount,
  originalPrice,
  finalPrice,
  badgeText,
}) => {

  return (
    <div className="property-card">
      <div className="card-image-container">

        {/* Wishlist Button */}
        <div
          className="wishlist-btn"
          onClick={(e) => e.stopPropagation()}
        >
          <WishButton listingId={_id} />
        </div>
        {badgeText && <div className="card-badge">{badgeText}</div>}
        <img
          src={image || "/placeholder.jpg"}
          alt={title}
          className="card-image"
          loading="lazy"
        />
      </div>
      <div className="card-content">

        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <p className="card-location">{location}</p>
        </div>
        {(rating > 0 || reviewCount > 0) && (
          <div className="rating-row">
            {rating > 0 && <div className="rating-box">{rating}</div>}

            <div className="rating-text">
              {ratingLabel && <span className="rating-label">{ratingLabel}</span>}
              {reviewCount > 0 && (
                <span className="review-count">{reviewCount} reviews</span>
              )}
            </div>
          </div>
        )}
        <div className="card-footer">
          <div className="price-block">
            <span className="price-duration">Per night</span>
            <div className="price-row">
              {originalPrice && (
                <span className="price-original">{originalPrice}</span>
              )}
              {finalPrice && (
                <span className="price-final">{finalPrice}</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ListingCards;
