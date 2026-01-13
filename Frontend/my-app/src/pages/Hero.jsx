import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Hero.css'; // Make sure to save the CSS file as HeroSection.css
import { useAuthContext } from '../utils/AuthContext';
const Hero = () => {

  const {role,isAuthenticated}=useAuthContext();

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            StayVerse<span className="dot">.</span>
          </Link>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-secondary">Log in</Link>
            <Link to="/signup" className="btn btn-primary">Sign up</Link>
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          
          {/* Left Side: Text Content */}
          <div className="hero-text">
            <h1>
              Discover & Book <br /> 
              <span className="highlight">Personalized Stays.</span>
            </h1>
            <p className="hero-description">
              A transparent, rule-based marketplace platform. Experience a deterministic booking lifecycle, real-time availability checks, and a secure guest-host workflow—without the "black box" of machine learning.
            </p>
            
            <div className="hero-buttons">
              {role=="guest" && (
                <Link to="/dashboard" className="btn btn-large">Visit Website</Link>
              )}
              {role=="host" &&(
                <Link to="/host/dashboard" className="btn btn-large">Visit Website</Link>
              )}
              {!isAuthenticated && <Link to="/dashboard" className="btn btn-large">Visit Website</Link>}
              <div className="tech-stack-label">
                <small>Built with MongoDB, Express, React, Node</small>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="listing-card-mockup">
  <div className="card-image-placeholder">
    <img 
      src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/f4/c1/ea/novotel-pune-nagar-road.jpg?w=1200&h=-1&s=1"
      alt="listing"
    />
    
    {/* Hot Deal Ribbon */}
    <div className="hot-deal-ribbon">
      HOT<br />DEAL<br />-15%<br />OFF
    </div>
  </div>

  <div className="card-details">
    <div className="card-row">
      <h3>Cozy Villa in Pune</h3>
      <span className="rating">★ 4.8</span>
    </div>
    <p className="location">Maharashtra, India</p>
    <p className="price">
      <strong>₹4,500</strong> <span className="text-muted">/ night</span>
    </p>
  </div>
</div>

            
            {/* Floating Element: Availability Logic */}
            <div className="floating-badge">
              <span className="icon">✓</span>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default Hero;