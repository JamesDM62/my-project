const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Booking, Spot, User } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

// Get all bookings of the current user
router.get('/current', requireAuth, async (req, res, next) => {
  const { user } = req; // Authenticated user from requireAuth middleware

  try {
    // Find all bookings for the current user
    const bookings = await Booking.findAll({
      where: { userId: user.id },
      include: {
        model: Spot,
        attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
      },
    });

    // Format the response to include previewImage
    const formattedBookings = bookings.map((booking) => {
      const bookingData = booking.toJSON();
      if (bookingData.Spot) {
        bookingData.Spot.previewImage = 'image url'; // Replace with actual logic to fetch the preview image
      }
      return bookingData;
    });

    // Return the bookings
    res.status(200).json({ Bookings: formattedBookings });
  } catch (err) {
    next(err); // Handle errors
  }
});

router.put('/:bookingId', requireAuth, async (req, res) => {
    const { bookingId } = req.params;
    const { startDate, endDate } = req.body;
    const userId = req.user.id; // Assuming `req.user` is set by `requireAuth`
  
    try {
      const booking = await Booking.findByPk(bookingId);
  
      if (!booking) {
        return res.status(404).json({
          message: "Booking couldn't be found",
        });
      }
  
      if (booking.userId !== userId) {
        return res.status(403).json({
          message: "You do not have permission to edit this booking",
        });
      }
  
      // Check if the booking is in the past
      const currentDate = new Date();
      const bookingEndDate = new Date(booking.endDate);
  
      if (bookingEndDate < currentDate) {
        return res.status(403).json({
          message: "Past bookings can't be modified",
        });
      }
  
      // Validate dates
      const newStartDate = new Date(startDate);
      const newEndDate = new Date(endDate);
  
      if (newStartDate < currentDate) {
        return res.status(400).json({
          message: "Bad Request",
          errors: {
            startDate: "startDate cannot be in the past",
          },
        });
      }
  
      if (newEndDate <= newStartDate) {
        return res.status(400).json({
          message: "Bad Request",
          errors: {
            endDate: "endDate cannot be on or before startDate",
          },
        });
      }
  
      // Check for booking conflicts
      const conflictingBooking = await Booking.findOne({
        where: {
          spotId: booking.spotId,
          id: { [Op.ne]: booking.id }, // Exclude the current booking
          [Op.or]: [
            { startDate: { [Op.between]: [newStartDate, newEndDate] } },
            { endDate: { [Op.between]: [newStartDate, newEndDate] } },
            {
              [Op.and]: [
                { startDate: { [Op.lte]: newStartDate } },
                { endDate: { [Op.gte]: newEndDate } },
              ],
            },
          ],
        },
      });
  
      if (conflictingBooking) {
        return res.status(403).json({
          message: "Sorry, this spot is already booked for the specified dates",
          errors: {
            startDate: "Start date conflicts with an existing booking",
            endDate: "End date conflicts with an existing booking",
          },
        });
      }
  
      // Update booking
      booking.startDate = startDate;
      booking.endDate = endDate;
      await booking.save();
  
      return res.status(200).json({
        id: booking.id,
        spotId: booking.spotId,
        userId: booking.userId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  });

  router.delete('/:bookingId', requireAuth, async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id; // Assuming `req.user` is populated by `requireAuth`
  
    try {
      // Find the booking by ID
      const booking = await Booking.findByPk(bookingId);
  
      if (!booking) {
        return res.status(404).json({
          message: "Booking couldn't be found",
        });
      }
  
      // Check if the current user owns the booking or the spot
      const spot = await Spot.findByPk(booking.spotId);
  
      if (booking.userId !== userId && spot.ownerId !== userId) {
        return res.status(403).json({
          message: "You do not have permission to delete this booking",
        });
      }
  
      // Check if the booking has already started
      const currentDate = new Date();
      const bookingStartDate = new Date(booking.startDate);
  
      if (currentDate >= bookingStartDate) {
        return res.status(403).json({
          message: "Bookings that have been started can't be deleted",
        });
      }
  
      // Delete the booking
      await booking.destroy();
  
      return res.json({
        message: "Successfully deleted",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  });

module.exports = router;