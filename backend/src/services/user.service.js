const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

class UserService {
  async findAll({ page = 1, limit = 10, role, search }) {
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true,
        active: true, createdAt: true,
        enrollments: { include: { class: { include: { subject: true } } } },
        teacherClasses: { include: { subject: true } },
      },
    });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    return user;
  }

  async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true },
    });
    return user;
  }

  async update(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true },
    });
    return user;
  }

  async delete(id) {
    await prisma.user.delete({ where: { id } });
  }
}

module.exports = new UserService();
