import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "../api/map.api";
import "../styles/ListingMap.css";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px"
};

function ListingMap({ lat, lng }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  if (!isLoaded) return null;

  return (
    <div className="map-wrapper">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat, lng }}
        zoom={14}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </div>
  );
}

export default ListingMap;
