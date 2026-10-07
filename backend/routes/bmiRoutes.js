const express = require('express');
const router = express.Router();
const {
  saveBMI,
  getBMIHistory,
  getLatestBMI,
  updateBMI,
  deleteBMI,
} = require('../controllers/bmiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', saveBMI);
router.get('/', getLatestBMI);
router.get('/history', getBMIHistory);

// CRUD — Update & Delete individual records
router.put('/:id', updateBMI);
router.delete('/:id', deleteBMI);

module.exports = router;
