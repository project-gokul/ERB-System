const request = require('supertest');
const app = require('../server');
const { connectDB, disconnectDB, clearDB } = require('./db');
const jwt = require('jsonwebtoken');

let token;

beforeAll(async () => {
  await connectDB();
  token = jwt.sign(
    { id: 'dummy_id', role: 'student', email: 'stu@test.com' },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1d' }
  );
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('Chat API', () => {
  it('should reply to greeting', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'hi there' });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.reply).toContain('Hello 👋 How can I help you?');
  });

  it('should ask for valid message if empty', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: '' });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.reply).toEqual('Please enter something.');
  });
  
  it('should fallback to rephrase for unknown messages', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'what is the meaning of life' });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.reply).toEqual('Can you rephrase that?');
  });
});
