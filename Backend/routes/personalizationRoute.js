const express = require("express");
const router = express.Router();
const {requireAuth}=require('../middleware/authMiddleware')
const {requireRole}=require('../middleware/userRole')

const personalizationController = require("../controllers/userPersonalizationController");


router.get(
  "/home",
  requireAuth,
  requireRole("guest"),
  personalizationController.getPersonalizedFeed
);

router.get(
  "/trending",
  requireAuth,
  requireRole("guest"),
  personalizationController.getPersonalizedTrending
);

module.exports = router;
