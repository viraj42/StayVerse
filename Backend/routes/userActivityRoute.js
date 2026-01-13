const express = require("express");
const router = express.Router();

const userActivityController = require("../controllers/userActivityController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/userRole");

// Track activity (view / wishlist)
router.post("/",requireAuth,requireRole("guest"),userActivityController.trackActivity
);

// Get recent activity
router.get("/",requireAuth,requireRole("guest"),userActivityController.getRecentActivities
);

router.delete(
  "/",
  requireAuth,
  requireRole("guest"),
  userActivityController.deleteActivity
);

module.exports = router;
