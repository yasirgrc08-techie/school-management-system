const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

class AuthService {
  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true },
    });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    return user;
  }
}

module.exports = new AuthService();
