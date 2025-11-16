const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true
    },
    farmerName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        village: String,
        district: String,
        state: String,
        pincode: String
    },
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    machineId: {
        type: Number,
        required: true
    },
    machineName: {
        type: String,
        required: true
    },
    crop: {
        type: String,
        required: true
    },
    fieldSize: {
        type: Number,
        default: 1
    },
    fieldSizeUnit: {
        type: String,
        enum: ['acres', 'hectares'],
        default: 'acres'
    },
    amount: {
        type: Number,
        required: true
    },
    advancePayment: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'advance-paid', 'fully-paid'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String,
        default: ''
    },
    operatorNotes: {
        type: String,
        default: ''
    },
    workCompleted: {
        type: Boolean,
        default: false
    },
    hasReview: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Generate booking ID
bookingSchema.pre('save', async function(next) {
    if (this.isNew && !this.bookingId) {
        const count = await mongoose.model('Booking').countDocuments();
        this.bookingId = `BK${Date.now()}-${count + 1}`;
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
