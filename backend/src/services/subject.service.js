const prisma = require('../config/database');

class SubjectService {
  async findAll({ page = 1, limit = 10, search }) {
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        include: { _count: { select: { classes: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.subject.count({ where }),
    ]);

    return {
      data: subjects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id) {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { classes: { include: { teacher: { select: { id: true, firstName: true, lastName: true } } } } },
    });
    if (!subject) throw Object.assign(new Error('Subject not found'), { status: 404 });
    return subject;
  }

  async create(data) {
    return prisma.subject.create({ data });
  }

  async update(id, data) {
    return prisma.subject.update({ where: { id }, data });
  }

  async delete(id) {
    await prisma.subject.delete({ where: { id } });
  }
}

module.exports = new SubjectService();
