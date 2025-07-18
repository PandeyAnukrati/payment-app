import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { UsersService } from "../src/users/users.service";
import { UserRole, UserDocument } from "../src/users/schemas/user.schema";

describe("UsersController (e2e)", () => {
  let app: INestApplication;
  let usersService: UsersService;
  let adminToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get<UsersService>(UsersService);
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

  describe("/users (POST)", () => {
    const validUser = {
      username: "newuser",
      password: "password123",
      email: "newuser@test.com",
      role: UserRole.VIEWER,
    };

    it("should create a user with admin token", async () => {
      const response = await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validUser)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.username).toBe(validUser.username);
      expect(response.body.email).toBe(validUser.email);
      expect(response.body.role).toBe(validUser.role);
      expect(response.body).not.toHaveProperty("password");
    });

    it("should fail with viewer token (insufficient permissions)", async () => {
      await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", `Bearer ${viewerToken}`)
        .send(validUser)
        .expect(403);
    });

    it("should fail without authentication", async () => {
      await request(app.getHttpServer())
        .post("/users")
        .send(validUser)
        .expect(401);
    });

    it("should fail with duplicate username", async () => {
      await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validUser,
          username: "testadmin", // Already exists
        })
        .expect(400);
    });

    it("should fail with duplicate email", async () => {
      await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validUser,
          email: "admin@test.com", // Already exists
        })
        .expect(400);
    });

    it("should fail with invalid email format", async () => {
      await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validUser,
          email: "invalid-email",
        })
        .expect(400);
    });

    it("should fail with short password", async () => {
      await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validUser,
          password: "123", // Too short
        })
        .expect(400);
    });

    it("should fail with invalid role", async () => {
      await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validUser,
          role: "invalid_role",
        })
        .expect(400);
    });
  });

  describe("/users (GET)", () => {
    beforeEach(async () => {
      // Create additional test users
      await usersService.create({
        username: "user1",
        password: "password123",
        email: "user1@test.com",
        role: UserRole.VIEWER,
      });

      await usersService.create({
        username: "user2",
        password: "password123",
        email: "user2@test.com",
        role: UserRole.ADMIN,
      });
    });

    it("should get all users with admin token", async () => {
      const response = await request(app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(4); // 2 initial + 2 additional

      // Check that passwords are not included
      response.body.forEach((user: any) => {
        expect(user).not.toHaveProperty("password");
        expect(user).toHaveProperty("username");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("role");
      });
    });

    it("should fail with viewer token (insufficient permissions)", async () => {
      await request(app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${viewerToken}`)
        .expect(403);
    });

    it("should fail without authentication", async () => {
      await request(app.getHttpServer()).get("/users").expect(401);
    });
  });

  describe("/users/:id (GET)", () => {
    let userId: string;

    beforeEach(async () => {
      const user = await usersService.create({
        username: "testuser",
        password: "password123",
        email: "testuser@test.com",
        role: UserRole.VIEWER,
      });
      userId = (user as UserDocument)._id.toString();
    });

    it("should get user by id with admin token", async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body._id).toBe(userId);
      expect(response.body.username).toBe("testuser");
      expect(response.body.email).toBe("testuser@test.com");
      expect(response.body.role).toBe(UserRole.VIEWER);
      expect(response.body).not.toHaveProperty("password");
    });

    it("should fail with viewer token (insufficient permissions)", async () => {
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set("Authorization", `Bearer ${viewerToken}`)
        .expect(403);
    });

    it("should fail without authentication", async () => {
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(401);
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = "507f1f77bcf86cd799439011"; // Valid ObjectId format
      await request(app.getHttpServer())
        .get(`/users/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });

    it("should return 400 for invalid user id format", async () => {
      await request(app.getHttpServer())
        .get("/users/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe("Role-based access control", () => {
    it("should allow admin to access admin-only endpoints", async () => {
      await request(app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
    });

    it("should deny viewer access to admin-only endpoints", async () => {
      await request(app.getHttpServer())
        .get("/users")
        .set("Authorization", `Bearer ${viewerToken}`)
        .expect(403);
    });

    it("should allow both admin and viewer to access payment endpoints", async () => {
      // Admin access
      await request(app.getHttpServer())
        .get("/payments")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      // Viewer access
      await request(app.getHttpServer())
        .get("/payments")
        .set("Authorization", `Bearer ${viewerToken}`)
        .expect(200);
    });
  });
});
