const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllEvents = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    let whereClause = {};

    // For normal users, only show global events or events belonging to their institute
    if (req.user.role !== 'SUPER_ADMIN') {
      whereClause = {
        OR: [
          { type: 'GLOBAL' },
          { instituteId: req.user.instituteId }
        ]
      };
    }

    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        category: true,
        organizer: {
          select: { id: true, fullName: true, avatarUrl: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        organizer: { select: { id: true, fullName: true, avatarUrl: true } },
        speakers: true,
        schedules: { orderBy: { startTime: 'asc' } },
        attachments: true,
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const {
      title, description, bannerUrl, type, status, venue, isOnline, meetingLink,
      date, startTime, endTime, registrationDeadline, maxCapacity,
      instituteId, clubId, categoryId, tags, requirements,
      speakers, schedules, attachments
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        bannerUrl,
        type,
        status,
        venue,
        isOnline,
        meetingLink,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        maxCapacity,
        instituteId,
        clubId,
        categoryId,
        tags: tags || [],
        requirements,
        organizerId: req.user.id,
        speakers: speakers?.length ? {
          create: speakers
        } : undefined,
        schedules: schedules?.length ? {
          create: schedules.map(s => ({ ...s, startTime: new Date(s.startTime), endTime: new Date(s.endTime) }))
        } : undefined,
        attachments: attachments?.length ? {
          create: attachments
        } : undefined
      },
      include: {
        speakers: true,
        schedules: true,
        attachments: true
      }
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    if (event.organizerId !== req.user.id && !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    const { date, startTime, endTime, registrationDeadline, ...rest } = req.body;
    
    const dataToUpdate = { ...rest };
    if (date) dataToUpdate.date = new Date(date);
    if (startTime) dataToUpdate.startTime = new Date(startTime);
    if (endTime) dataToUpdate.endTime = new Date(endTime);
    if (registrationDeadline) dataToUpdate.registrationDeadline = new Date(registrationDeadline);

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(req.params.id) },
      data: dataToUpdate
    });

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    if (event.organizerId !== req.user.id && !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await prisma.event.delete({ where: { id: parseInt(req.params.id) } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.getEventAttendees = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id);
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { registeredAt: 'asc' }
    });

    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    next(error);
  }
};

exports.getEventAnalytics = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = await prisma.event.findUnique({ where: { id: eventId }});
    
    const stats = await prisma.eventRegistration.groupBy({
      by: ['status'],
      where: { eventId },
      _count: { status: true }
    });

    res.status(200).json({ 
      success: true, 
      data: {
        maxCapacity: event.maxCapacity,
        breakdown: stats
      } 
    });
  } catch (error) {
    next(error);
  }
};
