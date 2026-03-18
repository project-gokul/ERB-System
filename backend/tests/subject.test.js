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

describe('Subject API', () => {
  it('should add a new subject', async () => {
    const res = await request(app)
      .post('/api/subjects/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        subjectName: 'Mathematics',
        subjectCode: 'MTH101',
        department: 'Basic Sciences',
        year: '1st'
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.subject.subjectCode).toEqual('MTH101');
  });

  it('should get subjects by year', async () => {
    await request(app).post('/api/subjects/add').set('Authorization', `Bearer ${token}`).send({
      subjectName: 'Physics', subjectCode: 'PHY101', department: 'BS', year: '1st'
    });
    
    await request(app).post('/api/subjects/add').set('Authorization', `Bearer ${token}`).send({
      subjectName: 'Data Structures', subjectCode: 'CS201', department: 'CSE', year: '2nd'
    });

    const res = await request(app).get('/api/subjects/1st').set('Authorization', `Bearer ${token}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].subjectName).toEqual('Physics');
  });

  it('should update material link', async () => {
    const createRes = await request(app).post('/api/subjects/add').set('Authorization', `Bearer ${token}`).send({
      subjectName: 'Chem', subjectCode: 'CHM101', department: 'BS', year: '1st'
    });
    
    const subjectId = createRes.body.subject._id;

    const res = await request(app).put(`/api/subjects/material/${subjectId}`).set('Authorization', `Bearer ${token}`).send({
      materialLink: 'http://drive.link'
    });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.subject.materialLink).toEqual('http://drive.link');
  });

  it('should delete a subject', async () => {
    const createRes = await request(app).post('/api/subjects/add').set('Authorization', `Bearer ${token}`).send({
      subjectName: 'Bio', subjectCode: 'BIO101', department: 'BS', year: '1st'
    });
      
    const res = await request(app).delete(`/api/subjects/${createRes.body.subject._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Subject deleted successfully');
  });
});
