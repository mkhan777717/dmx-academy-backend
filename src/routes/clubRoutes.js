const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Get all clubs
router.get('/', clubController.getAllClubs);

// Get specific club details
router.get('/:id', clubController.getClubById);

// Create a new club (Admin/Institute Admin only)
router.post('/', clubController.createClub);

// Update club
router.put('/:id', clubController.updateClub);

// Delete club
router.delete('/:id', clubController.deleteClub);

// Club membership routes
router.post('/:id/join', clubController.joinClub);
router.post('/:id/leave', clubController.leaveClub);

module.exports = router;
