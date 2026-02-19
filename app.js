const express  = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./Utils/wrapAsync');
const ExpressError = require('./Utils/ExpressError')
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const { wrap } = require('module');
const { title } = require('process');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(()=>{
        console.log("Database connected successfully");
        
    })
    .catch(error => handleError(error));

mongoose.connection.on('error', err => {   

    logError(err);
  });

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); //for access to req.body
app.use(methodOverride('_method')); //to use post delete etc methods in form

const validateCampground = (req,res,next) =>{
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400);
    } else {
        next();
    }
}

const validateReview = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400);
    } else {
        next();
    }
}

app.get('/', (req,res) =>{
     res.render('campgrounds/home')
});
 
app.get('/campgrounds', wrapAsync(async(req,res,next) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

app.get('/campgrounds/new', (req,res) =>{
    res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground, wrapAsync(async(req,res,next) =>{
    //if(!req.body.campground) throw new ExpressError('Invalid data', 400); //we have client side validation but this will make sure even if it's done through postman it won't break
    const campground = new Campground(req.body.campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.get('/campgrounds/:id', wrapAsync(async(req,res,next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    // console.log(campground);
    res.render('campgrounds/show', { campground })
}));

app.get('/campgrounds/:id/edit', wrapAsync(async(req,res,next) =>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
})); 

app.put('/campgrounds/:id', validateCampground, wrapAsync(async(req,res,next) =>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', wrapAsync(async(req,res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
})); 

app.post('/campgrounds/:id/reviews', validateReview, wrapAsync(async(req,res,next) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id/reviews/:reviewID', wrapAsync(async(req,res,next) =>{
    const {id, reviewID} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewID}} )
    await Review.findByIdAndDelete(reviewID);
    res.redirect(`/campgrounds/${id}`)
}));

app.post

app.all(/(.*)/, (req,res,next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const{statusCode = 500} = err;
    if(!err.message) err.message = "Something is wrong!"
    res.status(statusCode).render('error', { err });
});
     
app.listen(3000, ()=> {
    console.log("Server is running on port 3000");
});

