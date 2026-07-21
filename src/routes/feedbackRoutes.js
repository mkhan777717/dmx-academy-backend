const express = require('express');
const { submitFeedback, getAllFeedbacks, clearFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Strict helper to guarantee only the Super Admin has access
const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to Super Admin only.'
    });
  }
  next();
};

// POST feedback is open to any authenticated user
router.post('/', protect, submitFeedback);

// GET and DELETE feedback are restricted strictly to Super Admin
router.get('/', protect, superAdminOnly, getAllFeedbacks);
router.delete('/:id', protect, superAdminOnly, clearFeedback);

module.exports = router;
