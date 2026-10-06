const express = require('express');
const router = express.Router();
const { saveBMI, getBMIHistory, getLatestBMI } = require('../controllers/bmiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', saveBMI);
router.get('/', getLatestBMI);
router.get('/history', getBMIHistory);

module.exports = router;

