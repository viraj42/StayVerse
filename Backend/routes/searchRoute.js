const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/userRole");
const searchController = require("../controllers/searchController");

// Location autocomplete
router.get(
  "/locations",
  searchController.locationAutocomplete
);

//search lsit in for searchbar
router.get("/listing", searchController.searchListings);


// Destination suggestion
router.get(
  "/suggestions",
  searchController.destinationSuggestions
);

module.exports = router;
