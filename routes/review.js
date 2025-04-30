const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { route } = require("./listing.js");
const Review = require("../models/review.js");
// const validateReview = require("../middleware.js")
// const { isLoggedIn } = require("../middleware.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const { createReview, deleteReview } = require("../controllers/review.js");

//Post Review 
router.post('/', isLoggedIn, validateReview, wrapAsync(createReview));

//Delete Route
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(deleteReview));

module.exports = router;