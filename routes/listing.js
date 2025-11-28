const express =require("express"); 
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing =require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} =require("../middleware");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage});



// router.route is method this method combine the same path in one method
router.route("/")
// index Route
.get( wrapAsync(listingController.index))

// Create Route
.post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));




// New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);


router.route("/:id")
// show Route
.get(wrapAsync(listingController.showListing))

// update Route
.put( isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))

// Delete Route
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));



// edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm))

module.exports =router;