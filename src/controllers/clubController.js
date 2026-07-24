const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllClubs = async (req, res, next) => {
  try {
    const clubs = await prisma.club.findMany({
      include: {
        _count: {
          select: { members: true, events: true }
        }
      }
    });
    res.status(200).json({ success: true, count: clubs.length, data: clubs });
  } catch (error) {
    next(error);
  }
};

exports.getClubById = async (req, res, next) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        members: {
          include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } }
          }
        },
        events: {
          where: { status: 'UPCOMING' },
          orderBy: { date: 'asc' },
          take: 5
        }
      }
    });

    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    res.status(200).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
};

exports.createClub = async (req, res, next) => {
  try {
    // Only SUPER_ADMIN or INSTITUTE_ADMIN can create clubs
    if (!['SUPER_ADMIN', 'INSTITUTE_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { name, description, instituteId } = req.body;
    const club = await prisma.club.create({
      data: { name, description, instituteId: parseInt(instituteId) }
    });

    res.status(201).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
};

exports.updateClub = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const club = await prisma.club.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description }
    });
    res.status(200).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
};

exports.deleteClub = async (req, res, next) => {
  try {
    await prisma.club.delete({ where: { id: parseInt(req.params.id) } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.joinClub = async (req, res, next) => {
  try {
    const clubId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if already a member
    const existing = await prisma.clubMember.findFirst({
      where: { clubId, userId }
    });
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }
    
    const membership = await prisma.clubMember.create({
      data: { clubId, userId, role: 'MEMBER' }
    });
    
    res.status(200).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
};

exports.leaveClub = async (req, res, next) => {
  try {
    const clubId = parseInt(req.params.id);
    const userId = req.user.id;
    
    await prisma.clubMember.deleteMany({
      where: { clubId, userId }
    });
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
