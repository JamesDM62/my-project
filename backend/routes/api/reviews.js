const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Review, Spot, ReviewImage, User, SpotImage } = require('../../db/models');

const router = express.Router();

router.get('/current', requireAuth, async (req, res, next) => {
    const { user } = req;

    try {
        const reviews = await Review.findAll({
            where: { userId: user.id },
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Spot,
                    attributes: [
                        'id',
                        'ownerId',
                        'address',
                        'city',
                        'state',
                        'country',
                        'lat',
                        'lng',
                        'name',
                        'price'
                    ],
                    include: [
                        {
                            model: SpotImage,
                            attributes: ['url'],
                            where: { previewImage: true },
                            required: false
                        }
                    ]
                },
                {
                    model: ReviewImage,
                    attributes: ['id', 'url']
                }
            ]
        });

        const response = {
            Reviews: reviews.map(review => {
                const reviewData = review.toJSON();
                if (reviewData.Spot && reviewData.Spot.SpotImages) {
                    reviewData.Spot.previewImage =
                        reviewData.Spot.SpotImages[0]?.url || null;
                    delete reviewData.Spot.SpotImages;
                }
                return reviewData;
            })
        };

        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
});

module.exports = router;