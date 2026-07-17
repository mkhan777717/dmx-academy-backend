const express = require("express");
const router = express.Router();
const { sendSyllabus } = require("../controllers/syllabusController");

/**
 * POST /api/syllabus/send
 * Public route — no auth required.
 * Body: { email: string }
 */
router.post("/send", sendSyllabus);

module.exports = router;
