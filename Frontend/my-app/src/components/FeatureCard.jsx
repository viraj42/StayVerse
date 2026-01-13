import React from "react";
import "../styles/FeatureCard.css";

const FeatureCard = ({
  layout = "horizontal",    // "horizontal" | "vertical"
  align = "left",           // "left" | "right" (Applies to horizontal image placement)
  order = "image-first",    // "image-first" | "content-first" (Applies to vertical stack)
  icon,
  title,
  description,
  image,
  accent = "purple",
  onClick,
  className = ""
}) => {

  const containerClasses = [
    "feature-card",
    layout === "horizontal" ? "fc-horizontal" : "fc-vertical",
    layout === "horizontal" ? (align === "right" ? "fc-right" : "fc-left") : "",
    layout === "vertical" ? (order === "content-first" ? "fc-content-first" : "fc-image-first") : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses} onClick={onClick}>
      
      {/* 1. Image Section */}
      {image && (
        <div className="fc-image-wrapper">
          <img src={image} alt={title || "Feature representation"} loading="lazy" />
        </div>
      )}

      {/* 2. Content Section */}
      <div className="fc-content">
        {icon && (
          <div className={`fc-icon ${accent}`}>
            {icon}
          </div>
        )}
        
        {title && <h3 className="fc-title">{title}</h3>}
        
        {description && <p className="fc-desc">{description}</p>}
      </div>

    </div>
  );
};

export default FeatureCard;