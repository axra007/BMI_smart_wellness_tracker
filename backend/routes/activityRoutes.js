const express = require('express');
const router = express.Router();
const { logActivity, getActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', logActivity);
router.get('/', getActivity);

module.exports = router;

