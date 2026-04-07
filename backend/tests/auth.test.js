const request = require('supertest');

// Mock prisma before requiring app
jest.mock('../src/config/database', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return mockPrisma;
});

const app = require('../src/server');
const prisma = require('../src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });

    it('should return 401 for invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
    });

    it('should return token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'test-id',
        email: 'admin@school.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        active: true,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@school.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('admin@school.com');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });

    it('should return profile with valid token', async () => {
      const user = {
        id: 'test-id',
        email: 'admin@school.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        active: true,
        createdAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(user);

      const token = jwt.sign(
        { userId: 'test-id', role: 'ADMIN' },
        process.env.JWT_SECRET || 'dev-secret-key-do-not-use-in-production'
      );

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('admin@school.com');
    });
  });
});

describe('Health Check', () => {
  it('should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
