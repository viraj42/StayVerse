import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import useAuth from "../utils/useAuth";
import { locationAutocomplete,getSearchListing } from "../api/search.api";
import { logoutUser } from "../api/auth.api";

// Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const LocationPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "10px" }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout, loading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        try {
          const results = await locationAutocomplete(searchQuery);
          setSuggestions(results || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Autocomplete error:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(`/listing?q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    const locationString = [
      suggestion.address,
      suggestion.city,
      suggestion.state
    ].filter(Boolean).join(", ");

    setSearchQuery(locationString);
    navigate(`/listing?q=${encodeURIComponent(searchQuery)}`);
    setTimeout(() => setShowSuggestions(false), 0);
  };

  const handleProfileClick = () => {
    if (loading) return;
    if (!user) navigate("/login");
    else setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch (_) {}
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  return (
    <div className="main-container">
      <div className="f-layer">

        <div className="logo-section">
          <p className="logo" onClick={() => navigate("/dashboard")}>StayVerse</p>
        </div>

        <div className="search-section" ref={searchRef}>
          <div className="searchbox">
            <input
              type="text"
              placeholder="Where do you want to go?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              onFocus={() => { if (searchQuery.length > 1) setShowSuggestions(true); }}
            />
            <div className="searchbutton">
              <button onClick={handleSearch}><SearchIcon /></button>
            </div>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((item, index) => (
                <div 
                  key={index} 
                  className="suggestion-item" 
                  onClick={() => handleSuggestionClick(item)}
                >
                  <LocationPinIcon />
                  <div className="suggestion-text">
                    <span className="city">
                      {[item.address, item.city, item.state].filter(Boolean).join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

  
        <div className="profile-section" ref={profileRef}>

          {role === "host" && (
            <div 
              className="create-listing-btn" 
              onClick={() => navigate("/host/listings/new")}
            >
              CREATE LISTING
            </div>
          )}

          <div className="profile-pill" onClick={handleProfileClick}>
            <MenuIcon />
            <UserIcon />
          </div>

          {isMenuOpen && user && (
            <div className="profile-dropdown">
              {role === "guest" && (
                <>
                  <p onClick={() => navigate("/profile")}>My Profile</p>
                  <p onClick={() => navigate("/wishlist")}>My Wishlist</p>
                  <p onClick={() => navigate("/search/history")}>My Activity</p>
                </>
              )}
              {role === "host" && (
                <>
                  <p onClick={() => navigate("/host/profile")}>My Profile</p>
                  <p onClick={() => navigate("/host/bookings")}>Booking Activity</p>
                </>
              )}
              <hr />
              <p className="logout-text" onClick={handleLogout}>Logout</p>
            </div>
          )}
        </div>

      </div>

      <div className="s-layer">
        {role=="guest" && (
          <>
            <div className={`nav-bubble ${isActive("/dashboard") ? "highlight" : ""}`} onClick={() => navigate("/dashboard")}>
              My Home
            </div>
            <div className={`nav-bubble ${isActive("/trending") ? "highlight" : ""}`} onClick={() => navigate("/trending")}>
              Trending Lists
            </div>
            <div className={`nav-bubble ${isActive("/hot") ? "highlight" : ""}`} onClick={() => navigate("/hot")}>
              Hot Deals
            </div>
            <div className={`nav-bubble ${isActive("/guest/bookings") ? "highlight" : ""}`} onClick={() => navigate("/guest/bookings")}>
              My Bookings
            </div>
          </>
        )}

        {role=="host" && (
          <>
            <div className={`nav-bubble ${isActive("/host/dashboard") ? "highlight" : ""}`} onClick={() => navigate("/host/dashboard")}>
              Dashboard
            </div>
            <div className={`nav-bubble ${isActive("/host/listings") ? "highlight" : ""}`} onClick={() => navigate("/host/listings")}>
              My Listings
            </div>
            <div className={`nav-bubble ${isActive("/host/bookings") ? "highlight" : ""}`} onClick={() => navigate("/host/bookings")}>
              Pending Booking
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
