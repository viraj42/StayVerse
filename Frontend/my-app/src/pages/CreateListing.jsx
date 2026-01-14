import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '../api/listing.api'; 
import { uploadListingImages } from '../api/listingImage.api'; 
import { apiRequest } from "../api/apiClient"; 
import '../styles/CreateListing.css';
import Navbar from './Navbar'; 

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [facilitiesList, setFacilitiesList] = useState([]);

  // Form data fr0 listing info
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pricePerNight: "",
    category: "stay",
    propertyType: "apartment",
    maxGuestsPerRoom: 2,

    totalRooms: 1,              // ✅ NEW
    isHotDeal: false,           // ✅ NEW
    discountPercentage: 0,      // ✅ NEW

    address: "",
    city: "",
    state: "",
    country: "",
    lat: "",
    lng: "",
    facilities: [],
    breakfastPrice: 0,
    lunchPrice: 0,
    dinnerPrice: 0
  });

  //fetch Facilities from Backend
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const data = await apiRequest("/meta/facilities", "GET");
        setFacilitiesList(data || []);
      } catch (error) {
        console.error("Failed to load facilities:", error);
        setFacilitiesList([]);
      }
    };
    loadFacilities();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => {
      const exists = prev.facilities.includes(facility);
      if (exists) {
        return { ...prev, facilities: prev.facilities.filter(f => f !== facility) };
      } else {
        return { ...prev, facilities: [...prev.facilities, facility] };
      }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Please select up to 5 images.");
      return;
    }
    
    setSelectedImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const listingPayload = {
      title: formData.title,
      description: formData.description,
      pricePerNight: Number(formData.pricePerNight),
      category: formData.category,
      propertyType: formData.propertyType,
      maxGuestsPerRoom: Number(formData.maxGuestsPerRoom),

      totalRooms: Number(formData.totalRooms),                 // ✅ NEW
      isHotDeal: formData.isHotDeal,                           // ✅ NEW
      discountPercentage: Number(formData.discountPercentage), // ✅ NEW

      facilities: formData.facilities,
      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        lat: Number(formData.lat),
        lng: Number(formData.lng)
      },
      addonPrices: {
        breakfast: Number(formData.breakfastPrice),
        lunch: Number(formData.lunchPrice),
        dinner: Number(formData.dinnerPrice)
      }
    };

    const newListing = await createListing(listingPayload);
    if (newListing && newListing._id) {
        const imageData = new FormData();

      selectedImages.forEach((image) => {
         imageData.append("images", image);
      });

       await uploadListingImages(newListing._id, imageData);
    }

    alert("Listing created successfully!");
    navigate("/host/dashboard");

  } catch (error) {
    console.log("Error:", error.response?.data || error.message);
    alert("Failed to create listing. Check backend console.");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Navbar />
      <div className="create-listing-page">
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-header">
            <h1>Create New Listing</h1>
            <p>Fill out the details</p>
          </div>
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="input-grid">
              <div className="input-group full-width">
                <label>Listing Title</label>
                <input 
                  type="text" 
                  name="title" 
                  className="input-field" 
                  placeholder="Hotel Taj" 
                  value={formData.title} 
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="input-group full-width">
                <label>Description</label>
                <textarea 
                  name="description" 
                  className="textarea-field" 
                  placeholder="Describe your listing!!.." 
                  value={formData.description} 
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <select name="category" className="select-field" value={formData.category} onChange={handleChange}>
                  <option value="stay">Stay</option>
                  <option value="experience">Experience</option>
                </select>
              </div>
              <div className="input-group">
                <label>Property Type</label>
                <select name="propertyType" className="select-field" value={formData.propertyType} onChange={handleChange}>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="resort">Resort</option>
                  <option value="cabin">Cabin</option>
                  <option value="hotel">Hotel</option>
                </select>
              </div>
              <div className="input-group">
                <label>Max Guests</label>
                <input 
                  type="number" 
                  name="maxGuestsPerRoom" 
                  className="input-field" 
                  min="1" 
                  value={formData.maxGuestsPerRoom} 
                  onChange={handleChange}
                />
              </div>

              {/* ✅ NEW FIELD: TOTAL ROOMS */}
              <div className="input-group">
                <label>Total Rooms Available</label>
                <input 
                  type="number" 
                  name="totalRooms" 
                  className="input-field" 
                  min="1" 
                  value={formData.totalRooms} 
                  onChange={handleChange}
                  required
                />
              </div>

            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Location</h3>
            <div className="input-grid">
              <div className="input-group full-width">
                <label>Full Address</label>
                <input 
                  type="text" 
                  name="address" 
                  className="input-field" 
                  placeholder="Street address, P.O. box" 
                  value={formData.address} 
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="input-group">
                <label>City</label>
                <input 
                  type="text" 
                  name="city" 
                  className="input-field" 
                  value={formData.city} 
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="input-group">
                <label>State</label>
                <input 
                  type="text" 
                  name="state" 
                  className="input-field" 
                  value={formData.state} 
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Country</label>
                <input 
                  type="text" 
                  name="country" 
                  className="input-field" 
                  value={formData.country} 
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Latitude</label>
                <input 
                  type="number" 
                  step="any" 
                  name="lat" 
                  className="input-field" 
                  placeholder="e.g. 40.7128" 
                  value={formData.lat} 
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Longitude</label>
                <input 
                  type="number" 
                  step="any" 
                  name="lng" 
                  className="input-field" 
                  placeholder="e.g. -74.0060" 
                  value={formData.lng} 
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing */}
          <div className="form-section">
            <h3 className="section-title">Pricing</h3>
            <div className="input-grid">
              <div className="input-group full-width">
                <label>Base Price per Night (₹)</label>
                <input 
                  type="number" 
                  name="pricePerNight" 
                  className="input-field" 
                  placeholder="0.00" 
                  min="0"
                  value={formData.pricePerNight} 
                  onChange={handleChange}
                  required 
                />
              </div>

              {/* ✅ NEW: DISCOUNT TOGGLE */}
              <div className="input-group">
                <label>
                  <input 
                    type="checkbox"
                    name="isHotDeal"
                    checked={formData.isHotDeal}
                    onChange={handleChange}
                  /> Enable Discount
                </label>
              </div>

              {/* ✅ NEW: DISCOUNT PERCENTAGE */}
              {formData.isHotDeal && (
                <div className="input-group">
                  <label>Discount Percentage (%)</label>
                  <input 
                    type="number"
                    name="discountPercentage"
                    className="input-field"
                    min="0"
                    max="90"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="input-group">
                <label>Breakfast Price (Optional)</label>
                <input type="number" name="breakfastPrice" className="input-field" value={formData.breakfastPrice} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Lunch Price (Optional)</label>
                <input type="number" name="lunchPrice" className="input-field" value={formData.lunchPrice} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Dinner Price (Optional)</label>
                <input type="number" name="dinnerPrice" className="input-field" value={formData.dinnerPrice} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Facilities & Amenities</h3>
            <div className="facilities-grid">
              {facilitiesList.map((facility) => (
                <div 
                  key={facility} 
                  className={`checkbox-card ${formData.facilities.includes(facility) ? 'selected' : ''}`}
                  onClick={() => handleFacilityToggle(facility)}
                >
                  <span>{facility}</span>
                </div>
              ))}
            </div>
          </div>

          {/*Photos */}
          <div className="form-section">
            <h3 className="section-title">Photos</h3>
            <p className="helper-text">Add at least 5 photos to start (Supported: JPG, PNG)</p>
            
            <div className="image-upload-area">
              <input 
                id="listing-images"
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange} 
                className="file-input-hidden" 
                required
              />
              <label htmlFor="listing-images" className="upload-placeholder">
                <p><strong>Click to Upload</strong></p>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((src, index) => (
                  <img key={index} src={src} alt="Preview" className="preview-thumb" />
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating Listing...' : 'Publish Listing'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default CreateListing;
