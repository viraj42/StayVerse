import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming react-router
import { getRecentActivity,clearHistory } from "../api/userActivity.api";
import FeatureCard from "../components/FeatureCard";
import { useAuthContext } from "../utils/AuthContext";

import Navbar from "../pages/Navbar";
import "../styles/SearchHistory.css"; 

import { MapPin, Clock, SearchX } from "lucide-react"; 

function SearchHistory() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [history, setHistory] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const loadHistory = async () => {
      setDataLoading(true);
      try {
        const data = await getRecentActivity();
        setHistory(data || []);
      } catch (error) {
        console.error("Failed to load history", error);
        setHistory([]);
      } finally {
        setDataLoading(false);
      }
    };

    loadHistory();
  }, [isAuthenticated, authLoading]);


  const formatDate = (dateString) => {
    if (!dateString) return "Visited recently";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }).format(date);
  };


  const handleCardClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

 const perfomDelete = async () => {
  try {
    await clearHistory();
    setHistory([]);
  } catch (error) {
    console.error("Failed to clear history");
  }
};

  if (!authLoading && !isAuthenticated) return null;

  return (
    <div className="history-page">
      <Navbar />

      <div className="history-container">
    
        <header className="history-header">
          <div className="header-content">
            <h1>Recent Activity</h1>
            <p>Your browsing history and viewed properties.</p>
          </div>
          {history.length > 0 && !dataLoading && (
            <button className="btn-clear" onClick={perfomDelete}>
              Clear History
            </button>
          )}
        </header>

        <div className="history-list">
          
          {(authLoading || dataLoading) && (
            <>
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </>
          )}
          {!dataLoading && history.length > 0 && (
            history.map((item, index) => {
              if (!item.listingId) return null;

              
              const isEven = index % 2 === 0;
              
              // Change color in order : Purple, Red, Yellow, Blue
              const accents = ["purple", "red", "yellow", "blue"];
              const currentAccent = accents[index % accents.length];

              return (
                <div 
                  key={item._id || index} 
                  className="history-item-wrapper"
                  style={{ animationDelay: `${index * 100}ms` }} // Staggered animation
                >
                  <FeatureCard
                    layout="horizontal"
                    align={isEven ? "left" : "right"} 
                    title={item.listingId.title}
        
                    description={
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         {item.listingId.location.city}, {item.listingId.location.state} 
                         <span style={{ opacity: 0.3 }}>|</span> 
                         <Clock size={14} /> {formatDate(item.createdAt)}
                      </span>
                    }
                    image={item.listingId.images?.[0] || "https://via.placeholder.com/600x400?text=No+Image"}
                    icon={<MapPin size={24} />}
                    accent={currentAccent}
                    onClick={() => handleCardClick(item.listingId._id)}
                  />
                </div>
              );
            })
          )}

          {!dataLoading && history.length === 0 && (
            <div className="empty-state">
              <SearchX size={48} color="#CCCCCC" />
              <h3>No recent history found</h3>
              <p>Properties you view will appear here so you can easily find them again.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default SearchHistory;