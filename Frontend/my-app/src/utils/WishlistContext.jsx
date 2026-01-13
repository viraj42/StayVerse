import { createContext, useContext, useEffect, useState } from "react";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from "../api/wishlist.api";
import { useAuthContext } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, role } = useAuthContext();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  // Load wishlist once after login
  useEffect(() => {
    const loadWishlist = async () => {
      if (!isAuthenticated || role !== "guest") {
        setWishlistIds([]);
        setLoadingWishlist(false);
        return;
      }

      try {
        const data = await getWishlist();
        const ids = (data.items || []).map((item) => item._id);
        setWishlistIds(ids);
      } catch {
        setWishlistIds([]);
      } finally {
        setLoadingWishlist(false);
      }
    };

    loadWishlist();
  }, [isAuthenticated, role]);

  const toggleWishlist = async (listingId) => {
    if (!isAuthenticated) return;

    if (wishlistIds.includes(listingId)) {
      await removeFromWishlist(listingId);
      setWishlistIds((prev) => prev.filter((id) => id !== listingId));
    } else {
      await addToWishlist(listingId);
      setWishlistIds((prev) => [...prev, listingId]);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        loadingWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
