const request = require('supertest');
const app = require('../server');
const { connectDB, disconnectDB, clearDB } = require('./db');

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('Auth API', () => {
  it('should register a new HOD successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test HOD',
      email: 'hod@test.com',
      password: 'password123',
      department: 'CSE',
      role: 'hod'
    });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('HOD registered successfully');
  });

  it('should prevent registering duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test HOD',
      email: 'hod@test.com',
      password: 'password123',
      department: 'CSE',
      role: 'hod'
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Another HOD',
      email: 'hod@test.com',
      password: 'newpassword',
      department: 'CSE',
      role: 'hod'
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Email already registered');
  });

  it('should login an existing user and return a token', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test Fac',
      email: 'fac@test.com',
      password: 'password123',
      department: 'CSE',
      role: 'faculty'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'fac@test.com',
      password: 'password123'
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toEqual('faculty');
  });

  it('should block login for wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test Fac',
      email: 'fac@test.com',
      password: 'password123',
      department: 'CSE',
      role: 'faculty'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'fac@test.com',
      password: 'wrongpassword'
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Invalid password');
  });
});
