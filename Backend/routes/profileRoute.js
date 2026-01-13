const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { requireAuth } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");
router.get("/me", requireAuth, profileController.getMyProfile);
router.patch("/me", requireAuth, profileController.updateMyProfile);
router.get("/me/dashboard", requireAuth, profileController.getDashboardStats);
router.post(
  "/me/upload",
  requireAuth,
  upload.single("image"),
  profileController.uploadProfileImage
);
module.exports = router;    
