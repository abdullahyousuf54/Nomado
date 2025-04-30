const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage});

const listingController = require("../controllers/listings.js");

router
  .route("/")
  .get(wrapAsync(listingController.index)) //Index Route
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  ); //Create Route

// .post(upload.single("listing[image]"), (req,res) => {
//     res.send(req.file);
// }
// )

//New Route
router.get("/new", isLoggedIn, listingController.rendernewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing)) //Show Route
  .put(
    isOwner,
    isLoggedIn,
    validateListing,
    wrapAsync(listingController.updateListing)
  ) //Update Route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing)); //Delete Route

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

module.exports = router;
