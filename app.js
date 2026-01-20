const express  = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./Utils/wrapAsync');
const ExpressError = require('./Utils/ExpressError')
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const { wrap } = require('module');

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

app.post('/campgrounds', wrapAsync(async(req,res,next) =>{
    if(!req.body.campground) throw new ExpressError('Invalid data', 400); //we have client side validation but this will make sure even if it's done through postman it won't break
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.get('/campgrounds/:id', wrapAsync(async(req,res,next) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground })
}));

app.get('/campgrounds/:id/edit', wrapAsync(async(req,res,next) =>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
})); 

app.put('/campgrounds/:id', wrapAsync(async(req,res,next) =>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', wrapAsync(async(req,res,next) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
})); 

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

