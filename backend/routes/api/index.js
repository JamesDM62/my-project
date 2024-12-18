// backend/routes/api/index.js
const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const { restoreUser } = require("../../utils/auth.js");
const spotsRouter = require('./spots'); // Import the spots routes


// Connect restoreUser middleware to the API router
// If current user session is valid, set req.user to the user in the database
// If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/session/spots', spotsRouter);  // Route for getting spots owned by the current user
router.use('/spots', spotsRouter); // Register the '/api/spots' route

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;