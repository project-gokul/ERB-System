const request = require('supertest');
const app = require('../server');
const { connectDB, disconnectDB, clearDB } = require('./db');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

let tokenFac;
let facId;

beforeAll(async () => {
  await connectDB();
  facId = new mongoose.Types.ObjectId();
  tokenFac = jwt.sign(
    { id: facId.toString(), role: 'faculty', email: 'fac@test.com' },
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

describe('Notification API', () => {
  it('should fetch my notifications', async () => {
    await Notification.create({
      recipientRole: 'faculty',
      recipientId: facId,
      message: 'Test notification',
      isRead: false
    });
      
    const res = await request(app)
      .get('/api/notifications/my')
      .set('Authorization', `Bearer ${tokenFac}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].message).toEqual('Test notification');
  });

  it('should mark a notification as read', async () => {
    const notif = await Notification.create({
      recipientRole: 'faculty',
      recipientId: facId,
      message: 'Unread notif',
      isRead: false
    });
      
    const res = await request(app)
      .patch(`/api/notifications/${notif._id}/read`)
      .set('Authorization', `Bearer ${tokenFac}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.notification.isRead).toEqual(true);
  });

  it('should delete a notification', async () => {
    const notif = await Notification.create({
      recipientRole: 'faculty',
      recipientId: facId,
      message: 'Delete me',
      isRead: false
    });
      
    const res = await request(app)
      .delete(`/api/notifications/${notif._id}`)
      .set('Authorization', `Bearer ${tokenFac}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Notification deleted successfully');
    
    const fetchRes = await request(app).get('/api/notifications/my').set('Authorization', `Bearer ${tokenFac}`);
    expect(fetchRes.body.length).toEqual(0);
  });
});
