const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    farmerName: {
        type: String,
        required: true,
        trim: true
    },
    farmerPhone: {
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
    }
}, {
    timestamps: true
});

// Ensure unique favorites per farmer-machine combination
favoriteSchema.index({ farmerPhone: 1, machineId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
