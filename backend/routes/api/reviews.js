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

//add image to a review based on review's id
router.post('/:reviewId/images', requireAuth, async (req, res, next) => {
    const { reviewId } = req.params;
    const { user } = req;
    const { url } = req.body;

    try {
        // Find the review by its ID
        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review couldn't be found" });
        }

        // Ensure that the review belongs to the current user
        if (review.userId !== user.id) {
            return res.status(403).json({
                message: "Forbidden: You cannot add an image to a review that doesn't belong to you",
            });
        }

        // Check if the review already has 10 images
        const existingImages = await ReviewImage.count({
            where: { reviewId },
        });
        if (existingImages >= 10) {
            return res.status(403).json({
                message: "Maximum number of images for this resource was reached",
            });
        }

        // Create the new review image
        const newImage = await ReviewImage.create({
            reviewId,
            url,
        });

        // Return the created image in the response
        res.status(201).json({
            id: newImage.id,
            url: newImage.url,
        });
    } catch (err) {
        next(err);
    }
});

// Delete a review image
// router.delete('/:reviewId/images/:imageId', requireAuth, async (req, res, next) => {
//     const { reviewId, imageId } = req.params;  // Extract reviewId and imageId from the URL params
//     const { user } = req; // The authenticated user from the requireAuth middleware
  
//     try {
//       // Find the review by its ID
//       const review = await Review.findByPk(reviewId);
  
//       // If the review doesn't exist, return a 404 error
//       if (!review) {
//         return res.status(404).json({
//           message: "Review couldn't be found"
//         });
//       }
  
//       // Check if the review belongs to the current user
//       if (review.userId !== user.id) {
//         return res.status(403).json({
//           message: "Forbidden: You do not have permission to delete this image"
//         });
//       }
  
//       // Find the review image by its ID
//       const reviewImage = await ReviewImage.findByPk(imageId);
  
//       // If the image doesn't exist, return a 404 error
//       if (!reviewImage) {
//         return res.status(404).json({
//           message: "Review Image couldn't be found"
//         });
//       }
  
//       // Check if the review image belongs to the given review
//       if (reviewImage.reviewId !== review.id) {
//         return res.status(404).json({
//           message: "Review Image couldn't be found"
//         });
//       }
  
//       // Delete the review image
//       await reviewImage.destroy();
  
//       // Return success message
//       return res.status(200).json({
//         message: "Successfully deleted"
//       });
  
//     } catch (err) {
//       next(err); // Pass the error to the error-handling middleware
//     }
//   });

  // Delete a review
router.delete('/:reviewId', requireAuth, async (req, res, next) => {
    const { reviewId } = req.params;  // Extract reviewId from the URL params
    const { user } = req; // The authenticated user from the requireAuth middleware
  
    try {
      // Find the review by its ID
      const review = await Review.findByPk(reviewId);
  
      // If the review doesn't exist, return a 404 error
      if (!review) {
        return res.status(404).json({
          message: "Review couldn't be found"
        });
      }
  
      // Check if the review belongs to the current user
      if (review.userId !== user.id) {
        return res.status(403).json({
          message: "Forbidden: You do not have permission to delete this review"
        });
      }
  
      // Delete the review
      await review.destroy();
  
      // Return success message
      return res.status(200).json({
        message: "Successfully deleted"
      });
  
    } catch (err) {
      next(err); // Pass the error to the error-handling middleware
    }
  });

// Edit a review
router.put('/:reviewId', requireAuth, async (req, res, next) => {
    const { reviewId } = req.params; // Get the reviewId from URL params
    const { review, stars } = req.body; // Extract review text and stars from the request body
    const { user } = req; // The user making the request (from requireAuth middleware)
  
    try {
      // Find the review by id
      const reviewToUpdate = await Review.findByPk(reviewId);
  
      // If the review doesn't exist, return 404 error
      if (!reviewToUpdate) {
        return res.status(404).json({
          message: "Review couldn't be found"
        });
      }
  
      // Check if the review belongs to the current user
      if (reviewToUpdate.userId !== user.id) {
        return res.status(403).json({
          message: "Forbidden: You do not have permission to edit this review"
        });
      }
  
      // Validation for the request body
      const errors = {};
      if (!review) errors.review = "Review text is required";
      if (typeof stars !== 'number' || stars < 1 || stars > 5) {
        errors.stars = "Stars must be an integer from 1 to 5";
      }
  
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          message: "Bad Request",
          errors: errors
        });
      }
  
      // Update the review
      reviewToUpdate.review = review;
      reviewToUpdate.stars = stars;
  
      // Save the updated review
      await reviewToUpdate.save();
  
      // Send the updated review as the response
      return res.status(200).json(reviewToUpdate);
    } catch (err) {
      next(err); // Pass the error to the error-handling middleware
    }
  });

module.exports = router;