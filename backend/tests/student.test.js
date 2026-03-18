const request = require('supertest');
const app = require('../server');
const { connectDB, disconnectDB, clearDB } = require('./db');
const jwt = require('jsonwebtoken');

let token;

beforeAll(async () => {
  await connectDB();
  // Generate a dummy token for protected routes
  token = jwt.sign(
    { id: 'dummy_id', role: 'admin', email: 'admin@test.com' },
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

describe('Student API', () => {
  it('should create a new student', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John Doe',
        rollNo: '101',
        department: 'CSE',
        year: '2nd',
        email: 'john@test.com',
        phoneNo: '1234567890',
        extraFields: { dob: '2000-01-01' }
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual('John Doe');
    expect(res.body.rollNo).toEqual('101');
  });

  it('should fail to create student without required fields', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John Doe'
      });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Required fields missing');
  });

  it('should fetch all students', async () => {
    await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Alice',
        rollNo: '102',
        department: 'ECE',
        year: '1st',
        email: 'alice@test.com'
      });
      
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].name).toEqual('Alice');
  });

  it('should delete a student', async () => {
    const createRes = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bob',
        rollNo: '103',
        department: 'ME',
        year: '3rd',
        email: 'bob@test.com'
      });
      
    const studentId = createRes.body._id;
    
    const delRes = await request(app)
      .delete(`/api/students/${studentId}`)
      .set('Authorization', `Bearer ${token}`);
      
    expect(delRes.statusCode).toEqual(200);
    expect(delRes.body.message).toEqual('Student deleted successfully');
    
    const fetchRes = await request(app).get('/api/students').set('Authorization', `Bearer ${token}`);
    expect(fetchRes.body.length).toEqual(0);
  });
});
