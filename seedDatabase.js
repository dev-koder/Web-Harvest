require('dotenv').config();
const mongoose = require('mongoose');
const Machine = require('./models/Machine');
const Booking = require('./models/Booking');

// Import data from JSON files
const machinesData = require('./machines.json');
const bookingsData = require('./bookings.json');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Seed Database
async function seedDatabase() {
    try {
        // Clear existing data
        await Machine.deleteMany({});
        await Booking.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert machines
        const machines = await Machine.insertMany(machinesData.machines);
        console.log(`✅ Inserted ${machines.length} machines`);

        // Insert bookings
        const bookings = await Booking.insertMany(bookingsData.bookingRequests);
        console.log(`✅ Inserted ${bookings.length} bookings`);

        console.log('🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
