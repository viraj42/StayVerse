import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ListingCards from "../components/ListingCards";
import "../styles/Gdashboard.css";
import {
  getHomeFeed,
  getPersonalizedTrending,
} from "../api/personalization.api";
import { getDestinationSuggestions } from "../api/search.api";
import { ratedListings } from "../api/listing.api";
import { apiRequest } from "../api/apiClient";
import { useAuthContext } from "../utils/AuthContext";
import Navbar from "../pages/Navbar";

const GDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuthContext();

  const [homeFeed, setHomeFeed] = useState([]);
  const [trending, setTrending] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [locationType, setLocationType] = useState([]);
  const [ratedList, setRatedList] = useState([]);
  const [trendingDest, setTrendingDest] = useState([]);

  const feedRef = useRef(null);
  const trendingRef = useRef(null);
  const ratingRef = useRef(null);
  const locationRef = useRef(null);
  const trendingDestRef = useRef(null);

  useEffect(() => {
    const loadDest = async () => {
      try {
        const data = await ratedListings();
        if (!data) {
          setTrendingDest([]);
          return;
        }
        setTrendingDest(data);
      } catch (error) {
        setTrendingDest([]);
      }
    };
    loadDest();
  }, []);

  useEffect(() => {
    const loadRatedList = async () => {
      try {
        const data = await ratedListings();
        if (!data) {
          setRatedList([]);
          return;
        }
        setRatedList(data);
      } catch (error) {
        setRatedList([]);
      }
    };
    loadRatedList();
  }, []);

  useEffect(() => {
    const loadTypes = async () => {
      const data = await apiRequest("/meta/location-city");
      setLocationType(data || []);
    };
    loadTypes();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      setHomeFeed([]);
      return;
    }
    const loadFeed = async () => {
      try {
        const data = await getHomeFeed();
        setHomeFeed(data || []);
      } catch {
        setHomeFeed([]);
      }
    };
    loadFeed();
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadTrending = async () => {
      try {
        const data = await getPersonalizedTrending();
        setTrending(data || []);
      } catch {
        setTrending([]);
      }
    };
    loadTrending();
  }, [isAuthenticated]);

  useEffect(() => {
    const loadTypes = async () => {
      const data = await apiRequest("/meta/property-types");
      setPropertyTypes(data || []);
    };
    loadTypes();
  }, []);

  useEffect(() => {
    const attachWheel = (ref) => {
      if (!ref.current) return;

      const element = ref.current;
      const handler = (e) => {
        const atStart = element.scrollLeft === 0;
        const atEnd =
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;

        if (
          (e.deltaY > 0 && !atEnd) ||
          (e.deltaY < 0 && !atStart)
        ) {
          e.preventDefault();
          element.scrollLeft += e.deltaY;
        }
      };

      element.addEventListener("wheel", handler, { passive: false });
      return () => element.removeEventListener("wheel", handler);
    };

    const cleanups = [
      attachWheel(feedRef),
      attachWheel(trendingRef),
      attachWheel(locationRef),
      attachWheel(ratingRef),
      attachWheel(trendingDestRef)
    ];

    return () => cleanups.forEach((fn) => fn && fn());
  }, []);

  const scrollLeft = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        {homeFeed.length > 0 && (
          <section className="dashboard-section">
            <h2 className="section-title">
              {isAuthenticated ? "Recommended for You" : "Popular Stays"}
            </h2>

            <div className="scroll-wrapper">
              <button className="scroll-arrow left" onClick={() => scrollLeft(feedRef)}>‹</button>

              <div className="feed-scroll-container" ref={feedRef}>
                {homeFeed.map((item) => (
                  <div
                    key={item._id}
                    className="feed-card-wrapper"
                    onClick={() => navigate(`/listing/${item._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <ListingCards {...item} />
                  </div>
                ))}
              </div>

              <button className="scroll-arrow right" onClick={() => scrollRight(feedRef)}>›</button>
            </div>
          </section>
        )}

        {isAuthenticated && trending.length > 0 && (
          <section className="dashboard-section">
            <h2 className="section-title">Trending for You</h2>
            <p className="section-subtitle">
              Travelers searching for India also booked these
            </p>

            <div className="scroll-wrapper">
              <button className="scroll-arrow left" onClick={() => scrollLeft(trendingRef)}>‹</button>

              <div className="horizontal-scroll-container" ref={trendingRef}>
                {trending.map((item) => (
                  <div
                    key={item._id}
                    className="trending-card-wrapper"
                    onClick={() => navigate(`/listing/${item._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <ListingCards {...item} />
                  </div>
                ))}
              </div>

              <button className="scroll-arrow right" onClick={() => scrollRight(trendingRef)}>›</button>
            </div>
          </section>
        )}

        <section className="dashboard-section">
          <h2 className="section-title">Explore by Location</h2>
          <p className="section-subtitle">
            Travelers searching for India also booked these
          </p>

          <div className="scroll-wrapper">
            <button className="scroll-arrow left" onClick={() => scrollLeft(locationRef)}>‹</button>

            <div className="location-scroll-container" ref={locationRef}>
              {Array.from({ length: Math.ceil(locationType.length / 5) }).map(
                (_, pageIndex) => (
                  <div className="location-grid" key={pageIndex}>
                    {locationType
                      .slice(pageIndex * 5, pageIndex * 5 + 5)
                      .map((loc) => (
                        <div
                          key={loc.name}
                          className="location-card"
                          onClick={() =>
                            navigate(`/search/locations?city=${encodeURIComponent(loc.name)}`)
                          }
                        >
                          <img src={loc.imgUrl} className="location-img" alt={loc.name} />
                          <div className="location-overlay">
                            <span className="location-name">{loc.name}</span>
                            <img
                              src="https://flagcdn.com/w20/in.png"
                              alt="India"
                              className="location-flag"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )
              )}
            </div>

            <button className="scroll-arrow right" onClick={() => scrollRight(locationRef)}>›</button>
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="section-title">Browse by Property Type</h2>
          <div className="horizontal-scroll-container">
            {propertyTypes.map((pro) => (
              <div
                key={pro.type}
                className="type-card"
                onClick={() => navigate(`/browse/propType/${pro.type}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="type-img-wrapper">
                  <img className="type-img" src={pro.imgUrl} alt={pro.type} />
                </div>
                <span className="type-label">
                  {pro.type.charAt(0).toUpperCase() + pro.type.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {ratedList.length > 0 && (
          <section className="dashboard-section">
            <h2 className="section-title">Highly Rated List</h2>
            <div className="scroll-wrapper">
              <button className="scroll-arrow left" onClick={() => scrollLeft(ratingRef)}>‹</button>
              <div className="horizontal-scroll-container" ref={ratingRef}>
                {ratedList.map((item) => (
                  <div
                    key={item._id}
                    className="trending-card-wrapper"
                    onClick={() => navigate(`/listing/${item._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <ListingCards {...item} />
                  </div>
                ))}
              </div>
              <button className="scroll-arrow right" onClick={() => scrollRight(ratingRef)}>›</button>
            </div>
          </section>
        )}

        {trendingDest.length > 0 && (
          <section className="dashboard-section">
            <h2 className="section-title">Trending Destinations</h2>
            <p className="section-subtitle">
              Travelers searching more about these Destinations!!
            </p>

            <div className="scroll-wrapper">
              <button className="scroll-arrow left" onClick={() => scrollLeft(trendingDestRef)}>‹</button>

              <div className="horizontal-scroll-container" ref={trendingDestRef}>
                {trendingDest.map((item) => (
                  <div
                    key={item._id}
                    className="trending-card-wrapper"
                    onClick={() => navigate(`/listing/${item._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <ListingCards {...item} />
                  </div>
                ))}
              </div>

              <button className="scroll-arrow right" onClick={() => scrollRight(trendingDestRef)}>›</button>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default GDashboard;
