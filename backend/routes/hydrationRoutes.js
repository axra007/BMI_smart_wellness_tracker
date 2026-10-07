const express = require('express');
const router = express.Router();
const { addHydration, getHydration, deleteHydration } = require('../controllers/hydrationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addHydration);
router.get('/', getHydration);

// CRUD — Delete individual hydration log
router.delete('/:id', deleteHydration);

module.exports = router;
