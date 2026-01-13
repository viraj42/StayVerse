import React, { useEffect, useState } from 'react';
import '../styles/ReviewPage.css';
import { useAuthContext } from "../utils/AuthContext";
import { getListingReviews, createReview } from '../api/review.api';
import Alert from "../components/Alert"; 
const CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'comfort', label: 'Comfort' },
  { key: 'location', label: 'Location' },
  { key: 'facilities', label: 'Facilities' },
  { key: 'valueForMoney', label: 'Value for Money' }
];

const GuestReviewPage = ({ listingId }) => {
    const { isAuthenticated ,role } = useAuthContext();
   const [alertMsg, setAlertMsg] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallAvg, setOverallAvg] = useState(0);
  const [categoryStats, setCategoryStats] = useState({});

  // Form State
  const [commentText, setCommentText] = useState("");
  // Initial state for detailed ratings
  const [ratingsInput, setRatingsInput] = useState({
    cleanliness: 5,
    comfort: 5,
    location: 5,
    facilities: 5,
    valueForMoney: 5
  });

  useEffect(() => {
    if (listingId) loadReviews();
  }, [listingId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getListingReviews(listingId);
      setReviews(data || []);
      calculateStats(data || []);
    } catch (error) {
      setAlertMsg("Failed to load reviews", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewList) => {
    if (!reviewList.length) {
      setOverallAvg(0);
      setCategoryStats({});
      return;
    }

    // Initialize sums
    const sums = {};
    CATEGORIES.forEach(cat => sums[cat.key] = 0);
    let totalOverall = 0;

    reviewList.forEach((rev) => {
      totalOverall += rev.rating;
      // If review has detailed ratings, use them; otherwise fallback to overall rating
      CATEGORIES.forEach(cat => {
        const val = (rev.ratings && rev.ratings[cat.key]) ? rev.ratings[cat.key] : rev.rating;
        sums[cat.key] += val;
      });
    });

    // Calculate averages
    const count = reviewList.length;
    const finalStats = {};
    CATEGORIES.forEach(cat => {
      finalStats[cat.key] = (sums[cat.key] / count).toFixed(1);
    });

    setOverallAvg((totalOverall / count).toFixed(1));
    setCategoryStats(finalStats);
  };

  const handleRatingChange = (key, value) => {
    setRatingsInput(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // Calculate an overall rating based on the average of sub-ratings for the payload
    const values = Object.values(ratingsInput);
    const calculatedOverall = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

    const payload = {
      listingId,
      rating: calculatedOverall,
      comment: commentText.trim(),
      ratings: ratingsInput // Sending detailed ratings object
    };

    try {
      await createReview(payload);
      alert("Review posted successfully!");
      setCommentText("");
      // Reset form
      setRatingsInput({
        cleanliness: 5, comfort: 5, location: 5, facilities: 5, valueForMoney: 5
      });
      loadReviews();
    } catch (err) {
      const msg = err.response?.data?.error || "Could not post review";
      setAlertMsg(msg);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading reviews...</div>;

  return (
    <div className="review-section-main-wrapper">
       <Alert msg={alertMsg} shut={() => setAlertMsg("")} />

      {/* 1. Header Score Section */}
      <div className="head-score-part">
        <div className="big-number-box">
          {overallAvg || "New"}
        </div>
        <div className="score-text-detail">
          <h2>{overallAvg >= 4.5 ? "Wonderful" : "Good"}</h2>
          <div className="grey-count-text">
            {reviews.length} reviews
          </div>
        </div>
      </div>

      {/* 2. Category Averages Grid */}
      <div className="category-bars-container">
        {CATEGORIES.map((cat) => (
          <div className="single-cat-row" key={cat.key}>
            <div className="cat-labels">
              <span>{cat.label}</span>
              <span>{categoryStats[cat.key] || "-"}</span>
            </div>
            <div className="grey-line-bg">
              <div 
                className="colored-fill-line" 
                style={{ width: `${(categoryStats[cat.key] / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Review Cards List */}
      <div className="guest-comments-list">
        {reviews.map((rev) => (
          <div className="comment-card-box" key={rev._id}>
            <div className="user-info-top">
              <div className="profile-round-pic">
                {rev.userId?.name ? rev.userId.name.charAt(0).toUpperCase() : "G"}
              </div>
              <div className="name-date-stack">
                <span className="u-name">{rev.userId?.name || "Guest"}</span>
                <span className="u-country">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="the-review-text">
              "{rev.comment}"
            </div>
          </div>
        ))}
      </div>

      {/* 4. Write Review Form with Category Inputs */}
      {isAuthenticated && role!="host" && (
        <div className="write-review-area">
        <h3>Write a review</h3>
        <form onSubmit={handleSubmitReview}>
          
          {/* Detailed Ratings Inputs */}
          <div className="rating-inputs-grid">
            {CATEGORIES.map((cat) => (
              <div className="input-group-item" key={cat.key}>
                <label>{cat.label}</label>
                <select 
                  className="small-select"
                  value={ratingsInput[cat.key]}
                  onChange={(e) => handleRatingChange(cat.key, e.target.value)}
                >
                  <option value="5">5</option>
                  <option value="4">4</option>
                  <option value="3">3</option>
                  <option value="2">2</option>
                  <option value="1">1</option>
                </select>
              </div>
            ))}
          </div>

          <textarea
            className="my-input-field"
            placeholder="Share your experience..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows="3"
            required
          />

          <button type="submit" className="submit-btn-solid">
            Post Review
          </button>
        </form>
      </div>
      )}

    </div>
  );
};

export default GuestReviewPage;