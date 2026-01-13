const router = require("express").Router();
const { getHostDashboard } = require("../controllers/hostDashboardController");
const {requireAuth} = require("../middleware/authMiddleware");
const {requireRole} = require("../middleware/userRole");

router.get("/dashboard", requireAuth, requireRole("host"), getHostDashboard);

module.exports = router;
