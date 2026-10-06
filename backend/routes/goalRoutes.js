const express = require('express');
const router = express.Router();
const { getGoals, createGoal, toggleGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .put(toggleGoal)
  .delete(deleteGoal);

module.exports = router;

