import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('/auth/login (POST) - should login successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          authToken = res.body.access_token;
        });
    });

    it('/auth/login (POST) - should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'invalid',
          password: 'invalid',
        })
        .expect(401);
    });

    it('/auth/profile (GET) - should get user profile', async () => {
      // First login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        });

      const token = loginResponse.body.access_token;

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('username');
          expect(res.body).toHaveProperty('role');
        });
    });
  });

  describe('Payments', () => {
    let token: string;

    beforeEach(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        });
      token = loginResponse.body.access_token;
    });

    it('/payments (GET) - should get payments list', () => {
      return request(app.getHttpServer())
        .get('/payments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('payments');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('totalPages');
        });
    });

    it('/payments (POST) - should create a new payment', () => {
      return request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100.50,
          receiver: 'Test User',
          status: 'success',
          method: 'credit_card',
          description: 'Test payment',
          currency: 'USD',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('transactionId');
          expect(res.body.amount).toBe(100.50);
          expect(res.body.receiver).toBe('Test User');
        });
    });

    it('/payments/stats (GET) - should get payment statistics', () => {
      return request(app.getHttpServer())
        .get('/payments/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalPaymentsToday');
          expect(res.body).toHaveProperty('totalPaymentsWeek');
          expect(res.body).toHaveProperty('totalRevenueToday');
          expect(res.body).toHaveProperty('totalRevenueWeek');
          expect(res.body).toHaveProperty('failedTransactions');
          expect(res.body).toHaveProperty('revenueChart');
        });
    });
  });

  describe('Users', () => {
    let adminToken: string;

    beforeEach(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        });
      adminToken = loginResponse.body.access_token;
    });

    it('/users (GET) - should get users list (admin only)', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/users (POST) - should create a new user (admin only)', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'testuser',
          password: 'testpass123',
          email: 'test@example.com',
          role: 'viewer',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.username).toBe('testuser');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.role).toBe('viewer');
          expect(res.body).not.toHaveProperty('password');
        });
    });
  });
});