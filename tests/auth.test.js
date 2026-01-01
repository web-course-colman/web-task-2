const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../src/models/User");

const testUser = {
  username: "authTestuser",
  email: "authTest@example.com",
  password: "password123",
};

let app;

beforeAll(async () => {
  // Set test database URI
  process.env.MONGO_URI = "mongodb://localhost:27017/web-task-2-test-auth";
  // Require app, which will connect to test DB
  app = require("../src/app");
});

afterEach(async () => {
  // Clear database after each test
  await User.deleteMany({});
});

afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
});

describe("Auth API", () => {
  it("should register a new user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(testUser)
      .expect(201);

    expect(response.body.message).toBe("User registered successfully");
  });

  it("should login user", async () => {
    await User.create({
      username: testUser.username,
      email: testUser.email,
      password: await require("bcryptjs").hash(testUser.password, 10),
    });

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  it("should logout user", async () => {
    await User.create({
      username: testUser.username,
      email: testUser.email,
      password: await require("bcryptjs").hash(testUser.password, 10),
      refreshTokens: ["refreshToken123"],
    });

    const response = await request(app)
      .post("/auth/logout")
      .send({
        refreshToken: "refreshToken123",
      })
      .expect(200);

    expect(response.body.message).toBe("Logged out successfully");
  });
});
