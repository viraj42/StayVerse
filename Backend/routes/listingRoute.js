const express = require("express");
const router = express.Router();

const { upload } = require("../config/cloudinary");
const listingImageController = require("../controllers/listingImageController");
const listingController = require("../controllers/listingController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/userRole");


router.post(
  "/",
  requireAuth,
  requireRole("host"),
  listingController.createListing
);

router.put(
  "/:id",
  requireAuth,
  requireRole("host"),
  listingController.updateListing
);

// Trending listings (views + bookings)
router.get(
  "/trending",
  listingController.getTrendingListings
);


// Explore by country / state / city
router.get(
  "/explore",
  listingController.exploreByLocation
);

// Hot deals
router.get(
  "/hot-deals",
  listingController.getHotDeals
);
router.get('/highly-rated',listingController.gethighlyRatedListings)

router.delete(
  "/:id",
  requireAuth,
  requireRole("host"),
  listingController.deleteListing
);

router.get(
  "/host/my-listings",
  requireAuth,
  requireRole("host"),
  listingController.getHostListings
);

router.get("/", listingController.getAllListings);
router.get("/:id", listingController.getListingById);

router.post(
  "/:id/images",
  requireAuth,
  requireRole("host"),
  upload.array("images", 5),
  listingImageController.uploadListingImages
);

// Browse by property type (hotel, apartment, resort, villa, cabin)
router.get(
  "/browse/type/:propertyType",
  listingController.browseByPropertyType
);


// Related listings
router.get(
  "/:id/related",
  listingController.getRelatedListings
);

module.exports = router;
