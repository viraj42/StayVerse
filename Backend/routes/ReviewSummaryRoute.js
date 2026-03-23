const express = require("express");
const router = express.Router();
const reviewSummaryController = require("../controllers/ReviewSummaryController");
const {requireAuth} = require("../middleware/authMiddleware"); // adjust path to your auth middleware

// ─────────────────────────────────────────────────────────────
// PUBLIC ROUTES (no auth required — guests can read summaries)
// ─────────────────────────────────────────────────────────────

// Full AI-powered review summary for a listing detail page
// GET /api/reviews/summary/:listingId
router.get("/summary/:listingId",requireAuth, reviewSummaryController.getReviewSummary);

// // Lightweight headline + rating — for cards / hover previews
// // GET /api/reviews/summary/:listingId/quick
// router.get("/summary/:listingId/quick", reviewSummaryController.getQuickSummary);

module.exports = router;