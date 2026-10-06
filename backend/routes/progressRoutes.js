const express = require('express');
const router = express.Router();
const { getProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getProgress);

module.exports = router;

