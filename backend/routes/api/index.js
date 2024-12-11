// backend/routes/api/index.js
const router = require('express').Router();
const { restoreUser } = require('../../utils/auth.js');

router.use(restoreUser);

//test
router.post('/test', function(req, res) {
    res.json({ requestBody: req.body });
  });

// GET /api/restore-user
router.get(
  '/restore-user',
  (req, res) => {
    return res.json(req.user);
  }
);




module.exports = router;