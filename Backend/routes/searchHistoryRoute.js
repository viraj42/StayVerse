const express = require("express");
const router = express.Router();

const searchHistoryController = require("../controllers/searchHistoryController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/userRole");

// Save a search (guest)
router.post(
  "/",
  requireAuth,
  requireRole("guest"),
  searchHistoryController.saveSearchHistory
);

// Get recent searches (guest)
router.get(
  "/",
  requireAuth,
  requireRole("guest"),
  searchHistoryController.getSearchHistory
);

module.exports = router;
