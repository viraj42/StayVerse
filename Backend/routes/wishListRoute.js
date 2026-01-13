const express = require("express");
const router = express.Router();

const wishlistController = require("../controllers/wishlistController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/userRole");

// Add listing to wishlist (guest)
router.post(
  "/:listingId",
  requireAuth,
  requireRole("guest"),
  wishlistController.addToWishlist
);

// Remove listing from wishlist (guest)
router.delete(
  "/:listingId",
  requireAuth,
  requireRole("guest"),
  wishlistController.removeFromWishlist
);

// Get logged-in user's wishlist (guest)
router.get(
  "/",
  requireAuth,
  requireRole("guest"),
  wishlistController.getWishlist
);

module.exports = router;
