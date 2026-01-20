const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require("./cities");
const {descriptors,places} = require('./seedhelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(()=>{
        console.log("Mongodb connected successfully");
    })
    .catch(error => handleError(error));

const random = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const randomNo = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            title: `${random(descriptors)} ${random(places)}`,
            location: `${cities[randomNo].city}, ${cities[randomNo].state}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime veniam aliquam sit cum suscipit fugit minus, aspernatur tempora voluptate sint doloribus officia obcaecati est rem quo animi, explicabo minima quos.',
            image: `https://picsum.photos/400?random=${Math.random()}`,
            price
        })
        await camp.save();
    }
}

seedDB().then(() =>{
    mongoose.connection.close();
});