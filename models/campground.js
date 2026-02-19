const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    image: String,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

module.exports = mongoose.model('Campground', CampgroundSchema);

CampgroundSchema.post('findOneAndDelete', async function (camp){
    if(camp){
        await Review.deleteMany({
             _id: {
                $in: camp.reviews
             }
        })
    }
});