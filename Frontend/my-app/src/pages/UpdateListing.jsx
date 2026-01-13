import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getListingById, updateListing } from "../api/listing.api";
import { uploadListingImages } from "../api/listingImage.api";
import { apiRequest } from "../api/apiClient";
import "../styles/CreateListing.css";
import Navbar from "./Navbar";

const UpdateListing = () => {
  const navigate = useNavigate();
  const { listingId  } = useParams();

  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [facilitiesList, setFacilitiesList] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pricePerNight: "",
    category: "stay",
    propertyType: "apartment",
    maxGuestsPerRoom: 2,
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


  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const data = await apiRequest("/meta/facilities", "GET");
        setFacilitiesList(data || []);
      } catch {
        setFacilitiesList([]);
      }
    };
    loadFacilities();
  }, []);

useEffect(() => {
  const loadListing = async () => {
    try {
      const data = await getListingById(listingId);

      setFormData({
        title: data.title,
        description: data.description,
        pricePerNight: data.pricePerNight,
        category: data.category,
        propertyType: data.propertyType,
        maxGuestsPerRoom: data.maxGuestsPerRoom,
        address: data.location.address,
        city: data.location.city,
        state: data.location.state,
        country: data.location.country,
        lat: data.location.lat,
        lng: data.location.lng,
        facilities: data.facilities,
        breakfastPrice: data.addonPrices.breakfast,
        lunchPrice: data.addonPrices.lunch,
        dinnerPrice: data.addonPrices.dinner
      });

      setImagePreviews(data.images);

    } catch {
      console.error("Failed to load listing");
    }
  };

  if (listingId) loadListing();
}, [listingId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter(f => f !== facility)
          : [...prev.facilities, facility]
      };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
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

      await updateListing(listingId , listingPayload);

      if (selectedImages.length > 0) {
        const imageData = new FormData();
        selectedImages.forEach((img) => {
          imageData.append("images", img);
        });
        await uploadListingImages(listingId , imageData);
      }

      alert("Listing updated successfully!");
      navigate(`/host/listing/${listingId}`);

    } catch (error) {
      console.log("Update error:", error.response?.data || error.message);
      alert("Failed to update listing");
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
            <h1>Update Listing</h1>
            <p>Edit your listing details below.</p>
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
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <select
                  name="category"
                  className="select-field"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="stay">Stay</option>
                  <option value="experience">Experience</option>
                </select>
              </div>

              <div className="input-group">
                <label>Property Type</label>
                <select
                  name="propertyType"
                  className="select-field"
                  value={formData.propertyType}
                  onChange={handleChange}
                >
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
                  value={formData.maxGuestsPerRoom}
                  onChange={handleChange}
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
                  name="lat"
                  className="input-field"
                  value={formData.lat}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Longitude</label>
                <input
                  type="number"
                  name="lng"
                  className="input-field"
                  value={formData.lng}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Pricing</h3>
            <div className="input-grid">

              <div className="input-group full-width">
                <label>Base Price per Night</label>
                <input
                  type="number"
                  name="pricePerNight"
                  className="input-field"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Breakfast Price</label>
                <input
                  type="number"
                  name="breakfastPrice"
                  className="input-field"
                  value={formData.breakfastPrice}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Lunch Price</label>
                <input
                  type="number"
                  name="lunchPrice"
                  className="input-field"
                  value={formData.lunchPrice}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Dinner Price</label>
                <input
                  type="number"
                  name="dinnerPrice"
                  className="input-field"
                  value={formData.dinnerPrice}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Facilities & Amenities</h3>
            <div className="facilities-grid">
              {facilitiesList.map((facility) => (
                <div
                  key={facility}
                  className={`checkbox-card ${
                    formData.facilities.includes(facility) ? "selected" : ""
                  }`}
                  onClick={() => handleFacilityToggle(facility)}
                >
                  <span>{facility}</span>
                </div>
              ))}
            </div>
          </div>

          {/* IMAGES */}
          <div className="form-section">
            <h3 className="section-title">Photos</h3>
            <p className="helper-text">
              Upload new images to replace existing ones (optional)
            </p>

            <div className="image-upload-area">
              <input
                id="listing-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="file-input-hidden"
              />
              <label htmlFor="listing-images" className="upload-placeholder">
                <p><strong>Click to upload</strong></p>
                <p className="helper-text">
                  {selectedImages.length} new images selected
                </p>
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
              {loading ? "Updating..." : "Update Listing"}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default UpdateListing;
