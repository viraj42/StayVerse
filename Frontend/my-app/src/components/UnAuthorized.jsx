import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UnAuthorized.css';

const UnAuthorized = () => {
  const goBackHistory = useNavigate();

  const handleGoBack = () => {
    goBackHistory(-1); 
  };
  return (
    <div className="whole-page-container">
      <div className="oops-card-wrapper">
        <div className="emoji-top-part">
          🚫
        </div>
        
        <h2 className="big-scary-title">Access Denied!</h2>
        
        <p className="description-text-thing">
          Oops! You don't have permission to view this page. 
        </p>

        <button 
          className="go-back-pls-btn" 
          onClick={handleGoBack}
        >
          ← Go Back Safely
        </button>
      </div>
    </div>
  );
};

export default UnAuthorized;