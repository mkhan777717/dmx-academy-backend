const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

exports.submitRSVP = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.id;
    const { status } = req.body; // GOING, INTERESTED, NOT_GOING

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: { where: { status: 'GOING' } } }
        }
      }
    });

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    let finalStatus = status;

    // Check capacity if GOING
    if (status === 'GOING' && event.maxCapacity) {
      if (event._count.registrations >= event.maxCapacity) {
        finalStatus = 'WAITLISTED';
      }
    }

    const registration = await prisma.eventRegistration.upsert({
      where: {
        eventId_userId: { eventId, userId }
      },
      update: {
        status: finalStatus,
        qrToken: finalStatus === 'GOING' ? crypto.randomUUID() : null
      },
      create: {
        eventId,
        userId,
        status: finalStatus,
        qrToken: finalStatus === 'GOING' ? crypto.randomUUID() : null
      }
    });

    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
};

exports.getTicketDetails = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.id;

    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
      include: {
        event: {
          select: {
            title: true,
            bannerUrl: true,
            venue: true,
            isOnline: true,
            meetingLink: true,
            date: true,
            startTime: true,
            endTime: true,
            institute: { select: { name: true } }
          }
        },
        user: {
          select: {
            fullName: true,
            email: true,
            institute: { select: { name: true } }
          }
        }
      }
    });

    if (!registration || registration.status !== 'GOING') {
      return res.status(403).json({ success: false, message: 'No valid ticket found' });
    }

    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
};
