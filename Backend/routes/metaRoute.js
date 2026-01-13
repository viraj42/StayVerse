const express = require("express");
const router = express.Router();
const { FACILITY_LIST  } = require("../utils/facilityConstant")
const { PROPERTY_TYPES } = require("../utils/propertyConstant");
const { REVIEW_CATEGORIES } = require("../utils/reviewConstant");
const {FAMOUS_LOCATIONS} =require("../utils/locationConstant")
// Fixed facilities list
router.get("/facilities", (req, res) => {
   res.setHeader("Content-Type", "application/json");
  return res.status(200).json(FACILITY_LIST);
});

// Property categories (hotel, apartment, etc.)
router.get("/property-types", (req, res) => {
  return res.json(PROPERTY_TYPES);
});

// Review categories
router.get("/review-categories", (req, res) => {
  return res.json(REVIEW_CATEGORIES);
});
router.get("/location-city", (req, res) => {
  return res.json(FAMOUS_LOCATIONS);
});

module.exports = router;
