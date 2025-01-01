const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { ReviewImage, Review } = require('../../db/models');

const router = express.Router();

// DELETE /api/review-images/:reviewImageId
router.delete('/:reviewImageId', requireAuth, async (req, res, next) => {
    const { reviewImageId } = req.params;
    const { user } = req;

    try {
        // Find the review image
        const reviewImage = await ReviewImage.findByPk(reviewImageId, {
            include: { model: Review }
        });

        // Check if the review image exists
        if (!reviewImage) {
            return res.status(404).json({ message: "Review Image couldn't be found" });
        }

        // Check authorization: Does the review belong to the current user?
        if (reviewImage.Review.userId !== user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Delete the review image
        await reviewImage.destroy();

        res.status(200).json({ message: "Successfully deleted" });
    } catch (err) {
        next(err);
    }
});

module.exports = router;