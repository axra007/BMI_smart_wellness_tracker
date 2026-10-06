const express = require('express');
const router = express.Router();
const { recordMood, getMood } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', recordMood);
router.get('/', getMood);

module.exports = router;

