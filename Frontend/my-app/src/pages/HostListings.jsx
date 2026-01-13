import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import { getHostListings,deleteListing,updateListing } from "../api/listing.api"; 
import { useAuthContext } from '../utils/AuthContext';
import { MapPin, Trash2, Edit, Star, SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "../styles/HostListing.css"

function HostListings() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [hostlisting, setHostlisting] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadFeed = async () => {
      try {
        if (!isAuthenticated) return;
        setDataLoading(true);
        const data = await getHostListings();
        setHostlisting(data || []);
      } catch (error) {
        console.error("Failed to load listings", error);
        setHostlisting([]);
      } finally {
        setDataLoading(false);
      }
    };
    
    loadFeed();
  }, [isAuthenticated, authLoading]);

const handleDelete = async (e, listingId) => {
  e.stopPropagation();

  if (!window.confirm("Are you sure you want to delete this listing?")) return;

  try {
    await deleteListing(listingId);

    setHostlisting(prev => prev.filter(item => item._id !== listingId));
  } catch (err) {

    console.error("Delete failed:", err);
    alert("Could not delete listing");
  }
};

  const handleEdit = (e, listingId) => {
    e.stopPropagation();
    navigate(`/host/manage-listings/${listingId}`); // send req to other component
  };

  const handleCardClick = (listingId) => {
    navigate(`/host/listing/${listingId}`);
  };

  return (
    <div className="history-page">
      <Navbar />
      <div className="history-container">
 
        <header className="history-header">
          <div className="header-content">
            <h1>My Listings</h1>
            <p>Manage your active properties and pricing..</p>
          </div>
        </header>

        <div className="history-list">
          
          {(authLoading || dataLoading) && (
            <>
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </>
          )}

          {!dataLoading && hostlisting.length > 0 && (
            hostlisting.map((item, index) => {
              
              return (
                <div 
                  key={item._id || index} 
                  className="history-item-wrapper"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCardClick(item._id)}
                >
                    
                    <div className="listing-card-inner">
                        
                 
                        <div className="card-image-box">
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="card-img"
                            />
                            {item.badgeText && (
                                <span className="card-badge">{item.badgeText}</span>
                            )}
                        </div>

                     
                        <div className="card-details">
                            <h3 className="card-title">{item.title}</h3>
                            
                            <div className="card-meta-row">
                                <MapPin size={14} className="meta-icon" />
                                <span>{item.location}</span>
                            </div>

                            <div className="card-meta-row">
                                <Star size={14} className="meta-icon star" />
                                <span>
                                    {item.rating > 0 ? `${item.rating} (${item.reviewCount} reviews)` : "New"}
                                </span>
                            </div>

                            <div className="card-price-row">
                                <span className="price-final">{item.finalPrice}</span>
                                <span className="price-unit"> night</span>
                                {item.originalPrice && (
                                    <span className="price-original">{item.originalPrice}</span>
                                )}
                            </div>
                        </div>

             
                        <div className="card-actions">
                            <button 
                                className="action-btn edit" 
                                onClick={(e) => handleEdit(e, item._id)}
                                title="Edit Listing"
                            >
                                <Edit size={18} />
                            </button>
                            <button 
                                className="action-btn delete" 
                                onClick={(e) => handleDelete(e, item._id)}
                                title="Delete Listing"
                            ><Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
              );
            })
          )}

         
          {!dataLoading && hostlisting.length === 0 && (
            <div className="empty-state">
              <SearchX size={48} color="#CCCCCC" />
              <h3>No listings found</h3>
              <p>You haven't posted any properties yet.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default HostListings;