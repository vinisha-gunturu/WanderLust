if(process.env.NODE_ENV != "production"){
   require('dotenv').config();
}

console.log("DB URL:", process.env.ATLASDB_URL);


const express =require("express");
const app =express();
const mongoose =require("mongoose");
const path =require("path"); 
const methodOverride =require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session =require("express-session")//express-sesstions for temparary data stroring
const MongoStore = require('connect-mongo');
const flash =require("connect-flash") // for msgs popup
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingsRouter =require("./routes/listing.js");
const reviewsRouter =require("./routes/review.js");
const userRouter =require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL
console.log(dbUrl);

main()  
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log("err");
})

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter :24 * 3600,
    // collectionName: "sessions",
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});


//express-sesstions for temparary data stroring
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave : false,
    saveUninitialized: false ,
    cookie:{
       expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
       maxAge: 7 * 24 * 60 * 60 * 1000,
       httpOnly: true,
       
    },
    
};





// app.get("/",(req,res)=>{
//  res.send("hi,i am root");
// });




// for msgs popup
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());// if user using application and user changing sesstion(using one page anethore page)
passport.deserializeUser(User.deserializeUser());//if user application closed it deserializetion it means user have loging if he want opn that application 

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})



// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })


app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);



// app.get("/testListing", async (req,res)=>{
//    let sampleListing = new Listing({
//     title:"my New villa",
//     description:"By the beach",
//     price: 1200,
//     location: "calangute Goa",
//     country: "india"
//    })

// await sampleListing.save();
//    console.log("sample was saved");
//    res.send("sucessful testing");
// });


app.all("/*splat",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found!"));
});


// // middelware
// app.use((err,req,res,next)=>{
//     let{statusCode=500, message="somthing went wrong"} = err;
//     res.status(statusCode).render("error.ejs",{message});
// });

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});



