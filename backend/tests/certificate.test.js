const request = require('supertest');
const app = require('../server');
const { connectDB, disconnectDB, clearDB } = require('./db');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

let tokenAdmin;
let tokenStudent;

beforeAll(async () => {
  await connectDB();
  tokenAdmin = jwt.sign(
    { id: 'admin_id', role: 'admin', email: 'admin@test.com' },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1d' }
  );
  tokenStudent = jwt.sign(
    { id: '111111111111111111111111', role: 'student', email: 'stu@test.com' },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1d' }
  );
  
  if (!fs.existsSync(path.join(__dirname, '../uploads/certificates'))) {
    fs.mkdirSync(path.join(__dirname, '../uploads/certificates'), { recursive: true });
  }
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('Certificate API', () => {
  it('should upload a new certificate', async () => {
    const dummyBuffer = Buffer.from('dummy file content');
    const res = await request(app)
      .post('/api/certificates/upload')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .field('title', 'Test Cert')
      .attach('certificate', dummyBuffer, 'test.pdf');
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('Certificate uploaded successfully');
    expect(res.body.certificate.status).toEqual('pending');
  });

  it('should fetch my certificates', async () => {
    const dummyBuffer = Buffer.from('dummy file content');
    await request(app)
      .post('/api/certificates/upload')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .field('title', 'My Cert')
      .attach('certificate', dummyBuffer, 'my.pdf');
      
    const res = await request(app)
      .get('/api/certificates/my')
      .set('Authorization', `Bearer ${tokenStudent}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].title).toEqual('My Cert');
  });

  it('should allow admin to fetch all certificates', async () => {
    const dummyBuffer = Buffer.from('dummy file content');
    await request(app)
      .post('/api/certificates/upload')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .field('title', 'Admin View Cert')
      .attach('certificate', dummyBuffer, 'admin_view.pdf');
      
    const res = await request(app)
      .get('/api/certificates/admin/all')
      .set('Authorization', `Bearer ${tokenAdmin}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].title).toEqual('Admin View Cert');
  });

  it('should allow admin to approve a certificate', async () => {
    const dummyBuffer = Buffer.from('dummy file content');
    const uploadRes = await request(app)
      .post('/api/certificates/upload')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .field('title', 'Approval Cert')
      .attach('certificate', dummyBuffer, 'approve.pdf');
      
    const certId = uploadRes.body.certificate._id;

    const res = await request(app)
      .patch(`/api/certificates/admin/${certId}/status`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ status: 'approved' });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.certificate.status).toEqual('approved');
  });
  
  it('should allow owner to delete certificate', async () => {
     const dummyBuffer = Buffer.from('dummy file content');
    const uploadRes = await request(app)
      .post('/api/certificates/upload')
      .set('Authorization', `Bearer ${tokenStudent}`)
      .field('title', 'To Delete')
      .attach('certificate', dummyBuffer, 'delete.pdf');
      
    const certId = uploadRes.body.certificate._id;

    const res = await request(app)
      .delete(`/api/certificates/${certId}`)
      .set('Authorization', `Bearer ${tokenStudent}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Certificate deleted successfully');
  });
});
