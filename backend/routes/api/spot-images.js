const express = require('express');
const { SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

const router = express.Router();

// DELETE /api/spot-images/:spotImageId
router.delete('/:spotImageId', requireAuth, async (req, res, next) => {
    const { spotImageId } = req.params;

    try {
        // Find the spot image
        const spotImage = await SpotImage.findByPk(spotImageId);

        if (!spotImage) {
            return res.status(404).json({
                message: "Spot Image couldn't be found"
            });
        }

        // Ensure the authenticated user is the owner of the image's associated spot
        const spot = await spotImage.getSpot(); // Assumes SpotImage has a `getSpot` method due to associations
        if (spot.ownerId !== req.user.id) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }

        // Delete the spot image
        await spotImage.destroy();

        res.status(200).json({
            message: "Successfully deleted"
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;