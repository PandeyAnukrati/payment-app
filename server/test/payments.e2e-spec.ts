import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { UsersService } from "../src/users/users.service";
import { PaymentsService } from "../src/payments/payments.service";
import { UserRole } from "../src/users/schemas/user.schema";
import {
  PaymentStatus,
  PaymentMethod,
  PaymentDocument,
} from "../src/payments/schemas/payment.schema";

describe("PaymentsController (e2e)", () => {
  let app: INestApplication;
  let usersService: UsersService;
  let paymentsService: PaymentsService;
  let adminToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get<UsersService>(UsersService);
    paymentsService = moduleFixture.get<PaymentsService>(PaymentsService);
    await app.init();

    // Create test users
    await usersService.create({
      username: "testadmin",
      password: "password123",
      email: "admin@test.com",
      role: UserRole.ADMIN,
    });

    await usersService.create({
      username: "testviewer",
      password: "password123",
      email: "viewer@test.com",
      role: UserRole.VIEWER,
    });

    // Get auth tokens
    const adminLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "testadmin", password: "password123" });
    adminToken = adminLogin.body.access_token;

    const viewerLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "testviewer", password: "password123" });
    viewerToken = viewerLogin.body.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  describe("/payments (POST)", () => {
    const validPayment = {
      amount: 100.5,
      receiver: "John Doe",
      status: PaymentStatus.SUCCESS,
      method: PaymentMethod.CREDIT_CARD,
      description: "Test payment",
      currency: "USD",
    };

    it("should create a payment with admin token", async () => {
      const response = await request(app.getHttpServer())
        .post("/payments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validPayment)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.amount).toBe(validPayment.amount);
      expect(response.body.receiver).toBe(validPayment.receiver);
      expect(response.body.status).toBe(validPayment.status);
      expect(response.body.method).toBe(validPayment.method);
      expect(response.body.currency).toBe(validPayment.currency);
    });

    it("should create a payment with viewer token", async () => {
      const response = await request(app.getHttpServer())
        .post("/payments")
        .set("Authorization", `Bearer ${viewerToken}`)
        .send(validPayment)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.amount).toBe(validPayment.amount);
    });

    it("should fail without authentication", async () => {
      await request(app.getHttpServer())
        .post("/payments")
        .send(validPayment)
        .expect(401);
    });

    it("should fail with invalid token", async () => {
      await request(app.getHttpServer())
        .post("/payments")
        .set("Authorization", "Bearer invalid-token")
        .send(validPayment)
        .expect(401);
    });

    it("should fail with missing required fields", async () => {
      await request(app.getHttpServer())
        .post("/payments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 100,
          // missing receiver
        })
        .expect(400);
    });

    it("should fail with invalid amount", async () => {
      await request(app.getHttpServer())
        .post("/payments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validPayment,
          amount: -50, // Negative amount
        })
        .expect(400);
    });

    it("should fail with invalid status", async () => {
      await request(app.getHttpServer())
        .post("/payments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validPayment,
          status: "invalid_status",
        })
        .expect(400);
    });

    it("should fail with invalid method", async () => {
      await request(app.getHttpServer())
        .post("/payments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validPayment,
          method: "invalid_method",
        })
        .expect(400);
    });
  });

  describe("/payments (GET)", () => {
    beforeEach(async () => {
      // Create test payments
      await paymentsService.create({
        amount: 100,
        receiver: "John Doe",
        status: PaymentStatus.SUCCESS,
        method: PaymentMethod.CREDIT_CARD,
        currency: "USD",
      });

      await paymentsService.create({
        amount: 200,
        receiver: "Jane Smith",
        status: PaymentStatus.FAILED,
        method: PaymentMethod.PAYPAL,
        currency: "USD",
      });

      await paymentsService.create({
        amount: 300,
        receiver: "Bob Johnson",
        status: PaymentStatus.PENDING,
        method: PaymentMethod.BANK_TRANSFER,
        currency: "EUR",
      });
    });

    it("should get all payments with admin token", async () => {
      const response = await request(app.getHttpServer())
        .get("/payments")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("payments");
      expect(response.body).toHaveProperty("totalPages");
      expect(response.body).toHaveProperty("currentPage");
      expect(response.body).toHaveProperty("totalCount");
      expect(response.body.payments).toHaveLength(3);
    });

    it("should get all payments with viewer token", async () => {
      const response = await request(app.getHttpServer())
        .get("/payments")
        .set("Authorization", `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.payments).toHaveLength(3);
    });

    it("should fail without authentication", async () => {
      await request(app.getHttpServer()).get("/payments").expect(401);
    });

    it("should filter payments by status", async () => {
      const response = await request(app.getHttpServer())
        .get("/payments?status=success")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.payments).toHaveLength(1);
      expect(response.body.payments[0].status).toBe(PaymentStatus.SUCCESS);
    });

    it("should filter payments by method", async () => {
      const response = await request(app.getHttpServer())
        .get("/payments?method=paypal")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.payments).toHaveLength(1);
      expect(response.body.payments[0].method).toBe(PaymentMethod.PAYPAL);
    });

    it("should paginate payments", async () => {
      const response = await request(app.getHttpServer())
        .get("/payments?page=1&limit=2")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.payments).toHaveLength(2);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalPages).toBe(2);
    });

    it("should search payments by receiver", async () => {
      const response = await request(app.getHttpServer())
        .get("/payments?receiver=John")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.payments).toHaveLength(1);
      expect(response.body.payments[0].receiver).toContain("John");
    });
  });

  describe("/payments/stats (GET)", () => {
    beforeEach(async () => {
      // Create test payments for stats
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await paymentsService.create({
        amount: 100,
        receiver: "Test User 1",
        status: PaymentStatus.SUCCESS,
        method: PaymentMethod.CREDIT_CARD,
        currency: "USD",
      });

      await paymentsService.create({
        amount: 200,
        receiver: "Test User 2",
        status: PaymentStatus.SUCCESS,
        method: PaymentMethod.PAYPAL,
        currency: "USD",
      });

      await paymentsService.create({
        amount: 50,
        receiver: "Test User 3",
        status: PaymentStatus.FAILED,
        method: PaymentMethod.BANK_TRANSFER,
        currency: "USD",
      });
    });

    it("should get payment statistics with admin token", async () => {
      const response = await request(app.getHttpServer())
        .get("/payments/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("totalPaymentsToday");
      expect(response.body).toHaveProperty("totalPaymentsWeek");
      expect(response.body).toHaveProperty("totalRevenueToday");
      expect(response.body).toHaveProperty("totalRevenueWeek");
      expect(response.body).toHaveProperty("failedTransactions");
      expect(response.body).toHaveProperty("revenueChart");

      expect(typeof response.body.totalPaymentsToday).toBe("number");
      expect(typeof response.body.totalRevenueToday).toBe("number");
      expect(Array.isArray(response.body.revenueChart)).toBe(true);
    });

    it("should get payment statistics with viewer token", async () => {
      const response = await request(app.getHttpServer())
        .get("/payments/stats")
        .set("Authorization", `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("totalPaymentsToday");
      expect(response.body).toHaveProperty("revenueChart");
    });

    it("should fail without authentication", async () => {
      await request(app.getHttpServer()).get("/payments/stats").expect(401);
    });
  });

  describe("/payments/:id (GET)", () => {
    let paymentId: string;

    beforeEach(async () => {
      const payment = await paymentsService.create({
        amount: 150,
        receiver: "Test User",
        status: PaymentStatus.SUCCESS,
        method: PaymentMethod.CREDIT_CARD,
        currency: "USD",
        description: "Test payment for details",
      });
      paymentId = (payment as PaymentDocument)._id.toString();
    });

    it("should get payment by id with admin token", async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body._id).toBe(paymentId);
      expect(response.body.amount).toBe(150);
      expect(response.body.receiver).toBe("Test User");
      expect(response.body.description).toBe("Test payment for details");
    });

    it("should get payment by id with viewer token", async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .set("Authorization", `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body._id).toBe(paymentId);
    });

    it("should fail without authentication", async () => {
      await request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .expect(401);
    });

    it("should return 404 for non-existent payment", async () => {
      const fakeId = "507f1f77bcf86cd799439011"; // Valid ObjectId format
      await request(app.getHttpServer())
        .get(`/payments/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });

    it("should return 400 for invalid payment id format", async () => {
      await request(app.getHttpServer())
        .get("/payments/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);
    });
  });
});
