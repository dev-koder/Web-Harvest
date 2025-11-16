const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    farmerName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const machineSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    operator: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Tractor', 'Harvester', 'Thresher', 'Seeder', 'Other']
    },
    price: {
        type: String,
        required: true
    },
    pricePerHour: {
        type: Number,
        required: true
    },
    crop: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    available: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: '🚜'
    },
    location: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        default: '0+ years'
    },
    reviews: [reviewSchema],
    totalBookings: {
        type: Number,
        default: 0
    },
    specifications: {
        horsepower: String,
        fuelType: String,
        weight: String,
        yearOfManufacture: String
    }
}, {
    timestamps: true
});

// Update average rating when reviews change
machineSchema.methods.updateRating = function() {
    if (this.reviews.length > 0) {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.rating = (sum / this.reviews.length).toFixed(1);
    }
};

module.exports = mongoose.model('Machine', machineSchema);
