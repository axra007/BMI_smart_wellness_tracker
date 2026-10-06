const express = require('express');
const router = express.Router();
const { logSleep, getSleep } = require('../controllers/sleepController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', logSleep);
router.get('/', getSleep);

module.exports = router;

