if(process.env.NODE_ENV != "production"){
    require('dotenv').config(); 
} 

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');

const flash = require('connect-flash'); 

//2->
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
//

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views" , path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.listen(8080, () => {
    console.log("server is listening");
})

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"
const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {
        console.log("connected to DB") 
    })
    .catch((err) => {
        console.log(err);
    })

const store = MongoStore.create({
    mongoUrl : dbUrl,
    touchAfter : 24 * 60 * 60,
    crypto : { secret : process.env.SECRET}
});
store.on("error", (e) => {
    console.log("session store error",e);
});

const sessionOptions = {
    store : store,
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 10000,
        maxAge : 7*24*60*60*10000
    }
};





app.use(session(sessionOptions));
app.use(flash());

//3-> (Use session from above also)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email : "abc@gmail.com",
//         username : "abc"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
    
// })

//

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/",async(req,res)=> {
    res.render("home/home.ejs");
})

app.use("/",userRouter);
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);


app.all("*", (req,res,next)=> {
    next(new ExpressError(404,"Page Not Found!"));
})

app.use((err, req, res, next) => {
    let {statusCode = "500", message="Something went wrong!"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{err});
});