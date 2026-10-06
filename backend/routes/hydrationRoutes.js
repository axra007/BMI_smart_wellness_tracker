const express = require('express');
const router = express.Router();
const { addHydration, getHydration } = require('../controllers/hydrationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addHydration);
router.get('/', getHydration);

module.exports = router;

