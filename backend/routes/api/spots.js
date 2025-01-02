// backend/routes/api/spots.js
const express = require('express');
const { Spot, SpotImage, Review, User, ReviewImage, Booking, sequelize } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');


const router = express.Router();

// Get all Spots owned by the Current User
router.get('/current', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const spots = await Spot.findAll({
      where: { ownerId: userId },
      include: [
        {
          model: Review,
          attributes: [],
        },
        {
          model: SpotImage,
          attributes: ['url', 'previewImage'],
          where: { previewImage: true },
          required: false,
        },
      ],
      attributes: {
        include: [
          [sequelize.fn('AVG', sequelize.col('Reviews.stars')), 'avgRating'],
        ],
      },
      group: ['Spot.id', 'SpotImages.id'],
    });

    const formattedSpots = spots.map(spot => ({
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      avgRating: spot.dataValues.avgRating || 0,
      previewImage: spot.SpotImages[0] ? spot.SpotImages[0].url : null,
    }));

    return res.json({ Spots: formattedSpots });
  } catch (error) {
    next(error);
  }
});

// Get all Bookings for a Spot based on the Spot's id
router.get('/:spotId/bookings', requireAuth, async (req, res, next) => {
  const { user } = req;
  const { spotId } = req.params;

  try {
    // Check if the spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if the current user is the owner of the spot
    const isOwner = spot.ownerId === user.id;

    // Fetch bookings
    const bookings = await Booking.findAll({
      where: { spotId },
      include: isOwner
        ? { model: User, attributes: ['id', 'firstName', 'lastName'] }
        : null,
    });

    // Format response
    const formattedBookings = bookings.map((booking) => {
      const bookingData = booking.toJSON();
      if (!isOwner) {
        // Restrict information if the user is not the owner
        return {
          spotId: bookingData.spotId,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
        };
      }
      return bookingData;
    });

    // Return the bookings
    res.status(200).json({ Bookings: formattedBookings });
  } catch (err) {
    next(err); // Pass error to the error handler
  }
});

// Route to get all reviews for a specific spot
router.get('/:spotId/reviews', async (req, res, next) => {
  const { spotId } = req.params;  // Get the spotId from the URL parameter

  try {
      // Check if the spot exists in the database
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
          return res.status(404).json({
              message: "Spot couldn't be found"
          });
      }

      // Fetch reviews for the specific spot using the spotId
      const reviews = await Review.findAll({
          where: { spotId },  // Filter reviews based on spotId
          include: [
              {
                  model: User,
                  attributes: ['id', 'firstName', 'lastName']  // Include user details for the reviewer
              },
              {
                  model: ReviewImage,
                  attributes: ['id', 'url']  // Include review images
              }
          ]
      });

      // Send reviews back in the response
      res.status(200).json({
          Reviews: reviews.map(review => review.toJSON())  // Map to JSON format for better consistency
      });
  } catch (err) {
      next(err);  // Handle any errors (e.g., database issues)
  }
});


// Get details of a Spot by id
router.get('/:spotId', async (req, res, next) => {
  const { spotId } = req.params;

  try {
    // Fetch the spot by its ID, including related images and owner
    const spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: SpotImage,
          attributes: ['id', 'url', 'previewImage'],
        },
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Calculate numReviews and avgStarRating
    const reviews = await Review.findAll({
      where: { spotId: spot.id },
      attributes: ['stars'],
    });

    const numReviews = reviews.length;
    const avgStarRating =
      reviews.reduce((sum, review) => sum + review.stars, 0) / numReviews || 0;

    // Format response
    const response = {
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      numReviews,
      avgStarRating,
      SpotImages: spot.SpotImages,
      Owner: spot.Owner,
    };

    return res.json(response);
  } catch (error) {
    next(error);
  }
});


//GET /api/spots - Get all spots
router.get('/', async (req, res) => {
  try {
    // Extract query parameters with defaults
    const {
      page = 1,
      size = 20,
      minLat,
      maxLat,
      minLng,
      maxLng,
      minPrice,
      maxPrice,
    } = req.query;

    // Validate query parameters
    const errors = {};
    if (page < 1) errors.page = "Page must be greater than or equal to 1";
    if (size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
    if (minLat && (isNaN(minLat) || minLat < -90 || minLat > 90)) {
      errors.minLat = "Minimum latitude is invalid";
    }
    if (maxLat && (isNaN(maxLat) || maxLat < -90 || maxLat > 90)) {
      errors.maxLat = "Maximum latitude is invalid";
    }
    if (minLng && (isNaN(minLng) || minLng < -180 || minLng > 180)) {
      errors.minLng = "Minimum longitude is invalid";
    }
    if (maxLng && (isNaN(maxLng) || maxLng < -180 || maxLng > 180)) {
      errors.maxLng = "Maximum longitude is invalid";
    }
    if (minPrice && (isNaN(minPrice) || minPrice < 0)) {
      errors.minPrice = "Minimum price must be greater than or equal to 0";
    }
    if (maxPrice && (isNaN(maxPrice) || maxPrice < 0)) {
      errors.maxPrice = "Maximum price must be greater than or equal to 0";
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({
        message: "Bad Request",
        errors,
      });
    }

    // Build the query filters
    const where = {};
    if (minLat) where.lat = { [Op.gte]: minLat };
    if (maxLat) where.lat = { ...where.lat, [Op.lte]: maxLat };
    if (minLng) where.lng = { [Op.gte]: minLng };
    if (maxLng) where.lng = { ...where.lng, [Op.lte]: maxLng };
    if (minPrice) where.price = { [Op.gte]: minPrice };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: maxPrice };

    // Calculate offset for pagination
    const limit = Math.min(size, 20); // Limit size to a maximum of 20
    const offset = (page - 1) * limit;

    const spots = await Spot.findAll({
      where,
      include: [
        {
          model: SpotImage,
          attributes: ['url', 'previewImage'],
          required: false, // Include even if there are no images
        },
        {
          model: Review,
          attributes: ['stars'], // Needed to calculate avgRating
          required: false, // Include even if there are no reviews
        },
      ],
      limit,
      offset,
    });

    const spotData = spots.map(spot => {
      const spotJSON = spot.toJSON();

      // Calculate avgRating
      const reviews = spotJSON.Reviews || [];
      const avgRating = reviews.length
        ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length
        : null;

      // Get previewImage
      const previewImage = spotJSON.SpotImages?.find(img => img.previewImage)?.url || null;

      // Return formatted spot object
      return {
        id: spotJSON.id,
        ownerId: spotJSON.ownerId,
        address: spotJSON.address,
        city: spotJSON.city,
        state: spotJSON.state,
        country: spotJSON.country,
        lat: spotJSON.lat,
        lng: spotJSON.lng,
        name: spotJSON.name,
        description: spotJSON.description,
        price: spotJSON.price,
        createdAt: spotJSON.createdAt,
        updatedAt: spotJSON.updatedAt,
        avgRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
        previewImage,
      };
    });

    res.json({ 
      Spots: spotData,
      page: parseInt(page, 10),
      size: parseInt(size, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a booking
router.post('/:spotId/bookings', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;
  const userId = req.user.id;

  try {
    // Check if the spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if the current user is the owner of the spot
    if (spot.ownerId === userId) {
      return res.status(403).json({ message: "You cannot book your own spot" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: 'Bad Request',
        errors: {
          startDate: 'Invalid start date',
          endDate: 'Invalid end date',
        },
      });
    }
    
    if (start <= new Date()) {
      return res.status(400).json({
        message: 'Bad Request',
        errors: { startDate: 'Start date cannot be in the past' },
      });
    }
    if (end <= start) {
      return res.status(400).json({
        message: 'Bad Request',
        errors: { endDate: 'End date cannot be on or before start date' },
      });
    }

    // Check for booking conflicts
    const existingBookings = await Booking.findAll({ where: { spotId } });
    for (const booking of existingBookings) {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      if (
        (start >= bookingStart && start <= bookingEnd) ||
        (end >= bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      ) {
        return res.status(403).json({
          message: 'Sorry, this spot is already booked for the specified dates',
          errors: {
            startDate: 'Start date conflicts with an existing booking',
            endDate: 'End date conflicts with an existing booking',
          },
        });
      }
    }

    // Create booking
    const newBooking = await Booking.create({
      spotId,
      userId,
      startDate,
      endDate,
    });

    return res.status(201).json(newBooking);
  } catch (err) {
    next(err);
  }
});

//create review for a spot based on spotId
router.post('/:spotId/reviews', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const { user } = req;
  const { review, stars } = req.body;

  try {
      // Check if the spot exists
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
          return res.status(404).json({ message: "Spot couldn't be found" });
      }

      // Check if the user already has a review for this spot
      const existingReview = await Review.findOne({
          where: {
              spotId,
              userId: user.id,
          },
      });
      if (existingReview) {
          return res.status(500).json({ message: "User already has a review for this spot" });
      }

      // Validate request body
      const errors = {};

      if (!review) {
        errors.review = "Review text is required";
      }
      if (!stars || !Number.isInteger(stars) || stars < 1 || stars > 5) {
          errors.stars = "Stars must be an integer from 1 to 5";
      }

       // If there are validation errors, send them in the response
      if (Object.keys(errors).length > 0) {
          return res.status(400).json({
              message: "Bad Request",
              errors,
          });
      }

      // Create the review
      const newReview = await Review.create({
          userId: user.id,
          spotId,
          review,
          stars,
      });

      res.status(201).json(newReview);
  } catch (err) {
      next(err);
  }
});


// Add an image to a spot
router.post('/:spotId/images', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { url, previewImage } = req.body;
  
  // Find the spot by id
  const spot = await Spot.findByPk(spotId);
  
  // If spot doesn't exist, return 404
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

    // Check if the current user is the owner of the spot
    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

  // Create a new spot image
  const newSpotImage = await SpotImage.create({
    spotId,
    url,
    previewImage
  });
  
  // Return the newly created image
  return res.status(201).json({
    id: newSpotImage.id,
    url: newSpotImage.url,
    previewImage: newSpotImage.previewImage
  });
});


// Create a Spot
router.post('/', requireAuth, async (req, res, next) => {
  const { 
      address, 
      city, 
      state, 
      country, 
      lat, 
      lng, 
      name, 
      description, 
      price 
  } = req.body;

  const ownerId = req.user.id;

  const errors = {};
  if (!address) errors.address = "Street address is required";
  if (!city) errors.city = "City is required";
  if (!state) errors.state = "State is required";
  if (!country) errors.country = "Country is required";
  if (lat === undefined || lat < -90 || lat > 90) errors.lat = "Latitude must be within -90 and 90";
  if (lng === undefined || lng < -180 || lng > 180) errors.lng = "Longitude must be within -180 and 180";
  if (!name || name.length > 50) errors.name = "Name must be less than 50 characters";
  if (!description) errors.description = "Description is required";
  if (!price || price <= 0) errors.price = "Price per day must be a positive number";

  if (Object.keys(errors).length) {
      return res.status(400).json({
          message: "Bad Request",
          errors
      });
  }

  try {
      const newSpot = await Spot.create({
          ownerId,
          address,
          city,
          state,
          country,
          lat,
          lng,
          name,
          description,
          price
      });

      return res.status(201).json(newSpot);
  } catch (err) {
      next(err);
  }
});

// PUT /api/spots/:spotId
router.put('/:spotId', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const {
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  } = req.body;

  try {
    // 1. Find the spot by its ID
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      // If the spot doesn't exist, send a 404 error
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    // 2. Check if the current user is the owner of the spot
    if (spot.ownerId !== req.user.id) {
      // If the current user is not the owner, send a 403 error (forbidden)
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    // 3. Validation checks for the request body fields
    const errors = {};

    if (!address) errors.address = "Street address is required";
    if (!city) errors.city = "City is required";
    if (!state) errors.state = "State is required";
    if (!country) errors.country = "Country is required";
    if (lat < -90 || lat > 90) errors.lat = "Latitude must be within -90 and 90";
    if (lng < -180 || lng > 180) errors.lng = "Longitude must be within -180 and 180";
    if (!name || name.length > 50) errors.name = "Name must be less than 50 characters";
    if (!description) errors.description = "Description is required";
    if (price <= 0) errors.price = "Price per day must be a positive number";

    // If there are validation errors, respond with 400 Bad Request
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Bad Request",
        errors,
      });
    }

    // 4. Update the spot with the new values
    spot.address = address;
    spot.city = city;
    spot.state = state;
    spot.country = country;
    spot.lat = lat;
    spot.lng = lng;
    spot.name = name;
    spot.description = description;
    spot.price = price;

    // Save the updated spot
    await spot.save();

    // 5. Respond with the updated spot
    return res.status(200).json(spot);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// Delete a spot image
// router.delete('/:spotId/images/:imageId', requireAuth, async (req, res, next) => {
//   const { spotId, imageId } = req.params;  // Extract spotId and imageId from the URL params
//   const { user } = req; // The authenticated user from the requireAuth middleware

//   try {
//     // Find the spot by its ID
//     const spot = await Spot.findByPk(spotId);

//     // If the spot doesn't exist, return a 404 error
//     if (!spot) {
//       return res.status(404).json({
//         message: "Spot couldn't be found"
//       });
//     }

//     // Check if the spot belongs to the current user (spot owner)
//     if (spot.ownerId !== user.id) {
//       return res.status(403).json({
//         message: "Forbidden: You do not have permission to delete this image"
//       });
//     }

//     // Find the spot image by its ID
//     const spotImage = await SpotImage.findByPk(imageId);

//     // If the image doesn't exist, return a 404 error
//     if (!spotImage) {
//       return res.status(404).json({
//         message: "Spot Image couldn't be found"
//       });
//     }

//     // Check if the image belongs to the given spot
//     if (spotImage.spotId !== spot.id) {
//       return res.status(404).json({
//         message: "Spot Image couldn't be found"
//       });
//     }

//     // Delete the spot image
//     await spotImage.destroy();

//     // Return success message
//     return res.status(200).json({
//       message: "Successfully deleted"
//     });

//   } catch (err) {
//     next(err); // Pass the error to the error-handling middleware
//   }
// });


// DELETE a spot
router.delete('/:spotId', requireAuth, async (req, res) => {
  try {
    const spotId = req.params.spotId;
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if the spot belongs to the current user
    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Delete the spot
    await spot.destroy();

    res.json({ message: 'Successfully deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;