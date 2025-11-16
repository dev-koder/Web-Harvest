const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// GET all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET a specific booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET bookings by status
router.get('/status/:status', async (req, res) => {
    try {
        const bookings = await Booking.find({ status: req.params.status }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create a new booking
router.post('/', async (req, res) => {
    const booking = new Booking(req.body);
    try {
        const newBooking = await booking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update a booking
router.put('/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PATCH update booking status
router.patch('/:id/status', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a booking
router.delete('/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET earnings summary
router.get('/stats/earnings', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate today's earnings
        const todayBookings = await Booking.find({ 
            date: today,
            status: 'accepted'
        });
        const todayEarnings = todayBookings.reduce((sum, booking) => sum + booking.amount, 0);
        
        // Calculate this month's earnings
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthBookings = await Booking.find({
            status: { $in: ['accepted', 'completed'] }
        });
        const monthEarnings = monthBookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
        }).reduce((sum, booking) => sum + booking.amount, 0);
        
        // Calculate total earnings
        const totalBookings = await Booking.find({
            status: { $in: ['accepted', 'completed'] }
        });
        const totalEarnings = totalBookings.reduce((sum, booking) => sum + booking.amount, 0);
        
        res.json({
            today: todayEarnings,
            thisMonth: monthEarnings,
            total: totalEarnings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
