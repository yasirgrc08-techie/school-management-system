const prisma = require('../config/database');

class ClassService {
  async findAll({ page = 1, limit = 10, teacherId, search }) {
    const where = {};
    if (teacherId) where.teacherId = teacherId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
          subject: true,
          _count: { select: { enrollments: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.class.count({ where }),
    ]);

    return {
      data: classes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id) {
    const cls = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
        subject: true,
        enrollments: {
          include: { student: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });
    if (!cls) throw Object.assign(new Error('Class not found'), { status: 404 });
    return cls;
  }

  async create(data) {
    return prisma.class.create({
      data,
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
        subject: true,
      },
    });
  }

  async update(id, data) {
    return prisma.class.update({
      where: { id },
      data,
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
        subject: true,
      },
    });
  }

  async delete(id) {
    await prisma.class.delete({ where: { id } });
  }

  async enrollStudent(classId, studentId) {
    return prisma.enrollment.create({
      data: { classId, studentId },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        class: { include: { subject: true } },
      },
    });
  }

  async unenrollStudent(classId, studentId) {
    await prisma.enrollment.delete({
      where: { studentId_classId: { studentId, classId } },
    });
  }
}

module.exports = new ClassService();
