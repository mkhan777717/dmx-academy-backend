const { sendEmail } = require("../utils/emailService");

const SYLLABUS_DOC_URL =
  "https://docs.google.com/document/d/1ARkcg8d43uyNOZN4pyVOUNMyQ7hTWM7Pezf4IYyJJ8I/edit?usp=sharing";

/**
 * POST /api/syllabus/send
 * Body: { email: string }
 *
 * Sends the free syllabus Google Doc link to the supplied email address.
 * Returns a JSON response with success/error status.
 */
const sendSyllabus = async (req, res) => {
  try {
    const { email } = req.body;

    // ── Basic validation ──────────────────────────────────────────────────────
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "A valid email address is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    // ── Build HTML email body ─────────────────────────────────────────────────
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Free Syllabus – Eduvantix</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1a6b47 0%,#0d4f33 100%);padding:40px 48px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
                      eduvantix
                    </h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:13px;font-weight:500;letter-spacing:0.5px;">
                      ACCELERATE YOUR ENGINEERING CAREER
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:48px 48px 32px;">
                    <h2 style="margin:0 0 16px;color:#111827;font-size:22px;font-weight:700;">
                      Your Free Syllabus is Ready! 🎉
                    </h2>
                    <p style="margin:0 0 12px;color:#4b5563;font-size:15px;line-height:1.7;">
                      Hi there,
                    </p>
                    <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.7;">
                      Thank you for your interest in Eduvantix. We've prepared a comprehensive
                      curriculum breakdown to help you understand exactly what you'll master across
                      our engineering tracks.
                    </p>
                    <p style="margin:0 0 32px;color:#4b5563;font-size:15px;line-height:1.7;">
                      Click the button below to access the full syllabus — no login required.
                    </p>

                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                      <tr>
                        <td style="border-radius:10px;background:linear-gradient(135deg,#1a6b47,#0d4f33);">
                          <a href="${SYLLABUS_DOC_URL}"
                            target="_blank"
                            style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;
                                   font-weight:700;text-decoration:none;letter-spacing:0.2px;">
                            📄 View Full Syllabus
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin:0 0 32px;">
                      <a href="${SYLLABUS_DOC_URL}"
                        style="color:#1a6b47;font-size:12px;word-break:break-all;text-decoration:underline;">
                        ${SYLLABUS_DOC_URL}
                      </a>
                    </p>

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 28px;" />

                    <!-- What's Inside section -->
                    <h3 style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:700;">
                      What's Inside the Syllabus?
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        ["🖥️", "Full-Stack Web Development", "React, Node.js, databases & deployment"],
                        ["🤖", "AI & Machine Learning", "Python, ML pipelines & model deployment"],
                        ["🔗", "Blockchain Development", "Smart contracts, Solidity & Web3"],
                        ["🏆", "Competitive Programming", "DSA, problem-solving & contest prep"],
                      ]
                        .map(
                          ([icon, title, desc]) => `
                        <tr>
                          <td style="padding:10px 0;vertical-align:top;width:36px;font-size:20px;">${icon}</td>
                          <td style="padding:10px 0 10px 12px;">
                            <p style="margin:0;color:#111827;font-size:14px;font-weight:600;">${title}</p>
                            <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">${desc}</p>
                          </td>
                        </tr>`
                        )
                        .join("")}
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:28px 48px;text-align:center;">
                    <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
                      © ${new Date().getFullYear()} Eduvantix. All rights reserved.
                    </p>
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                      You received this email because you requested a free syllabus from our website.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // ── Send email ────────────────────────────────────────────────────────────
    await sendEmail({
      to: email.trim(),
      subject: "🎓 Your Free Eduvantix Syllabus – Full Curriculum Breakdown",
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Syllabus sent successfully! Please check your inbox.",
    });
  } catch (error) {
    console.error("[SyllabusController] Failed to send syllabus email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email. Please try again later.",
    });
  }
};

module.exports = { sendSyllabus };
