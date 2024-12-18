const express = require('express');
const { Spot } = require('../../db/models'); // Assuming Spot model is in the models folder
const { requireAuth } = require('../../utils/auth');

const router = express.Router();

// Route to get all spots owned by the current user (requires authentication)
router.get('/session/spots', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id; // Get the current user's id from the session
    const spots = await Spot.findAll({
      where: {
        ownerId: userId, // Fetch spots owned by the current user
      },
    });
    return res.status(200).json({
      Spots: spots,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});


// GET all spots
router.get('/', async (req, res) => {
  try {
    const spots = await Spot.findAll(); // Find all spots from the database
    return res.status(200).json({
      Spots: spots,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;