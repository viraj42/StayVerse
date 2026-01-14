import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import RoleRedirect from "./utils/RoleRedirect";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Gdashboard from "./pages/Gdashboard";
import TredingListings from "./pages/TredingListings";
import HotDeal from "./pages/HotDeal";
import ListingDetails from "./pages/ListingDetails";
import BookingForm from "./components/BookingForm";
import ExploreList from "./pages/ExploreList";
import BrowseByProp from "./pages/BrowseByProp";
import SearchedListing from "./pages/SearchedListing";
import SearchHistory from "./pages/SearchHistory";
import ProfilePage from "./pages/ProfilePage";
import HostDashboard from "./pages/HostDashboard";
import HostListings from "./pages/HostListings";
import CreateListing from "./pages/CreateListing";
import HostListingDetails from "./pages/HostListingDetails";
import UpdateListing from "./pages/UpdateListing";
import GuestReviewPage from "./pages/GuestReviewPage";
import HostBooking from "./pages/HostBooking";
import GuestBooking from "./pages/GuestBooking";
import UnAuthorized from "./components/UnAuthorized";
import WishlistPage from "./pages/WishlistPage";

import "./index.css";
import Hero from "./pages/Hero";
import BookingDetailsPage from "./pages/BookingDetailsPage";

function App() {
  return (
    <Routes>

      {/* Catch unknown routes and redirect based on role */}
      <Route path="*" element={<RoleRedirect />} />

      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route path="/" element={<Hero />} />
      <Route path="/listing" element={<SearchedListing />} />
      <Route path="/dashboard" element={<Gdashboard />} />
      <Route path="/trending" element={<TredingListings />} />
      <Route path="/hot" element={<HotDeal />} />
      <Route path="/search/locations" element={<ExploreList />} />
      <Route path="/browse/propType/:types" element={<BrowseByProp />} />
      <Route path="/listing/:id" element={<ListingDetails />} />
      <Route path="/listing/reviews/:listingId" element={<GuestReviewPage />} />
      <Route path="/booking/details/:bookingId" element={<BookingDetailsPage />} />

      {/* ===== GUEST PROTECTED ROUTES ===== */}

      <Route
        path="/book"
        element={
          <ProtectedRoute allowedRole="guest">
            <BookingForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRole="guest">
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/guest/bookings"
        element={
          <ProtectedRoute allowedRole="guest">
            <GuestBooking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/search/history"
        element={
          <ProtectedRoute allowedRole="guest">
            <SearchHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wishlist"
        element={
          <ProtectedRoute allowedRole="guest">
            <WishlistPage />
          </ProtectedRoute>
        }
      />

      {/* ===== HOST PROTECTED ROUTES ===== */}
      <Route
        path="/host/dashboard"
        element={
          <ProtectedRoute allowedRole="host">
            <HostDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/profile"
        element={
          <ProtectedRoute allowedRole="host">
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/listings"
        element={
          <ProtectedRoute allowedRole="host">
            <HostListings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/listings/new"
        element={
          <ProtectedRoute allowedRole="host">
            <CreateListing />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/bookings"
        element={
          <ProtectedRoute allowedRole="host">
            <HostBooking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/listing/:id"
        element={
          <ProtectedRoute allowedRole="host">
            <HostListingDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/manage-listings/:listingId"
        element={
          <ProtectedRoute allowedRole="host">
            <UpdateListing />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<UnAuthorized />} />
    </Routes>
  );
}

export default App;
