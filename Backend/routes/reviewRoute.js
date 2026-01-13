const express=require('express');
const router=express.Router();
const reviewController=require('../controllers/reviewController')
const {requireAuth}=require('../middleware/authMiddleware')
const {requireRole}=require('../middleware/userRole');

//Create a review
router.post('/',requireAuth,requireRole("guest"),reviewController.createReview);

//Fetch all review-guest
router.get('/listing/:listingId',reviewController.getListingReviews);

module.exports=router;