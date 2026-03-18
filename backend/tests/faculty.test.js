const request = require('supertest');
const app = require('../server');
const { connectDB, disconnectDB, clearDB } = require('./db');
const jwt = require('jsonwebtoken');

let token;

beforeAll(async () => {
  await connectDB();
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

describe('Faculty API', () => {
  it('should create a new faculty', async () => {
    const res = await request(app)
      .post('/api/faculty')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Dr. Smith',
        email: 'smith@test.com',
        department: 'CSE',
        year: '1st',
        extraFields: { specialized: 'AI' }
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual('Dr. Smith');
  });

  it('should get all faculty members', async () => {
    await request(app).post('/api/faculty').set('Authorization', `Bearer ${token}`).send({
      name: 'Dr. Jane', email: 'jane@test.com', department: 'IT', year: '2nd'
    });
    
    const res = await request(app).get('/api/faculty').set('Authorization', `Bearer ${token}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].name).toEqual('Dr. Jane');
  });

  it('should update a faculty column/extrafield', async () => {
    const facRes = await request(app).post('/api/faculty').set('Authorization', `Bearer ${token}`).send({
      name: 'Dr. Bob', email: 'bob@test.com', department: 'ECE', year: '3rd', extraFields: { dynamicCol: 'value1' }
    });
    
    const res = await request(app).put(`/api/faculty/${facRes.body._id}`).set('Authorization', `Bearer ${token}`).send({
      extraFields: { dynamicCol: 'value2' }
    });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.extraFields.dynamicCol).toEqual('value2');
  });

  it('should delete a faculty', async () => {
    const createRes = await request(app).post('/api/faculty').set('Authorization', `Bearer ${token}`).send({
      name: 'Dr. Delete', email: 'delete@test.com', department: 'CE', year: '4th'
    });
      
    const res = await request(app).delete(`/api/faculty/${createRes.body._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    
    const fetchRes = await request(app).get('/api/faculty').set('Authorization', `Bearer ${token}`);
    expect(fetchRes.body.length).toEqual(0);
  });
  
  it('should get faculty count and year-count', async () => {
    await request(app).post('/api/faculty').set('Authorization', `Bearer ${token}`).send({
      name: 'F1', email: 'f1@test.com', department: 'CSE', year: '1st'
    });
    await request(app).post('/api/faculty').set('Authorization', `Bearer ${token}`).send({
      name: 'F2', email: 'f2@test.com', department: 'IT', year: '1st'
    });
    await request(app).post('/api/faculty').set('Authorization', `Bearer ${token}`).send({
      name: 'F3', email: 'f3@test.com', department: 'ME', year: '3rd'
    });

    const countRes = await request(app).get('/api/faculty/count').set('Authorization', `Bearer ${token}`);
    expect(countRes.statusCode).toEqual(200);
    expect(countRes.body.count).toEqual(3);

    const yearRes = await request(app).get('/api/faculty/year-count').set('Authorization', `Bearer ${token}`);
    expect(yearRes.statusCode).toEqual(200);
    expect(yearRes.body['1st']).toEqual(2);
    expect(yearRes.body['3rd']).toEqual(1);
  });
});
