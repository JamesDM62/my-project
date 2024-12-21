// backend/routes/api/spots.js
const express = require('express');
const { Spot, SpotImage, Review, User, sequelize } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');


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



// GET /api/spots - Get all spots
router.get('/', async (req, res) => {
  try {
    const spots = await Spot.findAll({
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

    res.status(200).json({ Spots: spotData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
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
      return res.status(403).json({ message: "You do not have permission to delete this spot" });
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