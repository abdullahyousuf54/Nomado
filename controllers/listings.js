const Listing = require("../models/listing");

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings});
}

module.exports.rendernewForm = (req,res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    let listings = await Listing.findById(id).populate( { path : "reviews", populate : { path : "author" }, } ).populate("owner");
    if (!listings){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{ listings});
}

module.exports.createListing = async (req,res,next) => {   
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings"); 
}

module.exports.editListing =async (req,res) => { //NEVER ADD VALIDATE LISTING MIDDLEWARE FOR GET REQUEST
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{ listing});
}

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    isOwner,
    await Listing.findByIdAndUpdate( id , {...req.body.listing});
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req,res) => {
    let {id} = req.params;
    let dltListing = await Listing.findById(id);
    req.flash("success", "Listing deleted!");
    console.log(dltListing);
    await Listing.findByIdAndDelete( id );
    res.redirect("/listings");
}