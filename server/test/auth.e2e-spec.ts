import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { UsersService } from "../src/users/users.service";
import { UserRole } from "../src/users/schemas/user.schema";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let usersService: UsersService;

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
  });

  afterEach(async () => {
    await app.close();
  });

  describe("/auth/login (POST)", () => {
    it("should login with valid credentials", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          username: "testadmin",
          password: "password123",
        })
        .expect(201);

      expect(response.body).toHaveProperty("access_token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.username).toBe("testadmin");
      expect(response.body.user.role).toBe(UserRole.ADMIN);
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should fail with invalid username", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          username: "nonexistent",
          password: "password123",
        })
        .expect(401);
    });

    it("should fail with invalid password", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          username: "testadmin",
          password: "wrongpassword",
        })
        .expect(401);
    });

    it("should fail with missing credentials", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({})
        .expect(400);
    });

    it("should fail with empty username", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          username: "",
          password: "password123",
        })
        .expect(400);
    });

    it("should fail with empty password", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          username: "testadmin",
          password: "",
        })
        .expect(400);
    });
  });

  describe("/auth/register (POST)", () => {
    it("should register a new user", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          username: "newuser",
          password: "password123",
          email: "newuser@test.com",
        })
        .expect(201);

      expect(response.body).toHaveProperty("access_token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.username).toBe("newuser");
      expect(response.body.user.role).toBe(UserRole.VIEWER); // Default role
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should fail with duplicate username", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          username: "testadmin", // Already exists
          password: "password123",
          email: "duplicate@test.com",
        })
        .expect(400);
    });

    it("should fail with duplicate email", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          username: "newuser2",
          password: "password123",
          email: "admin@test.com", // Already exists
        })
        .expect(400);
    });

    it("should fail with invalid email format", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          username: "newuser3",
          password: "password123",
          email: "invalid-email",
        })
        .expect(400);
    });

    it("should fail with short password", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          username: "newuser4",
          password: "123", // Too short
          email: "user4@test.com",
        })
        .expect(400);
    });
  });
});
