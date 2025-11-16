const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');

// GET all favorites for a farmer
router.get('/farmer/:phone', async (req, res) => {
    try {
        const favorites = await Favorite.find({ farmerPhone: req.params.phone });
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST add to favorites
router.post('/', async (req, res) => {
    try {
        const favorite = new Favorite(req.body);
        const newFavorite = await favorite.save();
        res.status(201).json(newFavorite);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Machine already in favorites' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// DELETE remove from favorites
router.delete('/', async (req, res) => {
    try {
        const { farmerPhone, machineId } = req.body;
        const result = await Favorite.findOneAndDelete({ farmerPhone, machineId });
        if (!result) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
