const prisma = require('../prisma');

/**
 * @desc    Submit user feedback
 * @route   POST /api/feedback
 * @access  Private
 */
const submitFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback message is required and must be a valid text.'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User ID not found.'
      });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        message: message.trim()
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Our team will look into this shortly...',
      feedback
    });
  } catch (err) {
    console.error('Error in submitFeedback:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Internal server error.'
    });
  }
};

/**
 * @desc    Get all user feedbacks (Super Admin only)
 * @route   GET /api/feedback
 * @access  Private (Admin)
 */
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      feedbacks
    });
  } catch (err) {
    console.error('Error in getAllFeedbacks:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedbacks. Internal server error.'
    });
  }
};

/**
 * @desc    Clear/Delete a feedback entry (Super Admin only)
 * @route   DELETE /api/feedback/:id
 * @access  Private (Admin)
 */
const clearFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedbackId = parseInt(id, 10);

    if (isNaN(feedbackId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID provided.'
      });
    }

    const feedbackExists = await prisma.feedback.findUnique({
      where: { id: feedbackId }
    });

    if (!feedbackExists) {
      return res.status(404).json({
        success: false,
        message: 'Feedback entry not found.'
      });
    }

    await prisma.feedback.delete({
      where: { id: feedbackId }
    });

    return res.status(200).json({
      success: true,
      message: 'Feedback cleared successfully.'
    });
  } catch (err) {
    console.error('Error in clearFeedback:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear feedback. Internal server error.'
    });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedbacks,
  clearFeedback
};
