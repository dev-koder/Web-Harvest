const express = require('express');
const router = express.Router();
const Machine = require('../models/Machine');

// GET all machines
router.get('/', async (req, res) => {
    try {
        const machines = await Machine.find();
        res.json(machines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET a specific machine by ID
router.get('/:id', async (req, res) => {
    try {
        const machine = await Machine.findOne({ id: req.params.id });
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        res.json(machine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET available machines
router.get('/status/available', async (req, res) => {
    try {
        const machines = await Machine.find({ available: true });
        res.json(machines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create a new machine
router.post('/', async (req, res) => {
    const machine = new Machine(req.body);
    try {
        const newMachine = await machine.save();
        res.status(201).json(newMachine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update a machine
router.put('/:id', async (req, res) => {
    try {
        const machine = await Machine.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        res.json(machine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a machine
router.delete('/:id', async (req, res) => {
    try {
        const machine = await Machine.findOneAndDelete({ id: req.params.id });
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        res.json({ message: 'Machine deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH update machine availability
router.patch('/:id/availability', async (req, res) => {
    try {
        const machine = await Machine.findOneAndUpdate(
            { id: req.params.id },
            { available: req.body.available },
            { new: true }
        );
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        res.json(machine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST add a review to a machine
router.post('/:id/reviews', async (req, res) => {
    try {
        const machine = await Machine.findOne({ id: req.params.id });
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        
        machine.reviews.push(req.body);
        machine.updateRating();
        await machine.save();
        
        res.status(201).json(machine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET reviews for a machine
router.get('/:id/reviews', async (req, res) => {
    try {
        const machine = await Machine.findOne({ id: req.params.id });
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        res.json(machine.reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE a review from a machine
router.delete('/:id/reviews/:reviewId', async (req, res) => {
    try {
        const machine = await Machine.findOne({ id: req.params.id });
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        
        machine.reviews = machine.reviews.filter(r => r._id.toString() !== req.params.reviewId);
        machine.updateRating();
        await machine.save();
        
        res.json({ message: 'Review deleted successfully', machine });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
