const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const rsvpController = require('../controllers/rsvpController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Get all events (with filtering logic inside controller)
router.get('/', protect, eventController.getAllEvents);

// Get specific event details
router.get('/:id', protect, eventController.getEventById);

// RSVP endpoints
router.post('/:id/rsvp', protect, rsvpController.submitRSVP);
router.get('/:id/ticket', protect, rsvpController.getTicketDetails);

// Organizer & Admin only routes
// We will also check ownership inside the controller.
router.use(protect);

// Create a new event
router.post('/', eventController.createEvent);

// Update event
router.put('/:id', eventController.updateEvent);

// Cancel/Delete event
router.delete('/:id', eventController.deleteEvent);

// Organizer specific metrics/attendees
router.get('/:id/attendees', eventController.getEventAttendees);
router.get('/:id/analytics', eventController.getEventAnalytics);

module.exports = router;
