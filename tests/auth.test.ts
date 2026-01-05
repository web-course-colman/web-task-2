import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import User from "../src/models/User";
import jwt from "jsonwebtoken";

const testUser = {
  username: "authTestuser",
  email: "authTest@example.com",
  password: "password123",
};

let app: express.Application;

beforeAll(async () => {
  // Set test database URI
  process.env.MONGO_URI = "mongodb://localhost:27017/web-task-2-test-auth";
  // Dynamically import app after setting env
  const appModule = await import("../src/app");
  app = appModule.createApp();
});

afterEach(async () => {
  // Clear database after each test
  await User.deleteMany({});
  jest.restoreAllMocks();
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

  it("should fail register when missing fields", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "u" })
      .expect(400);
  });

  it("should fail register when user already exists", async () => {
    await request(app).post("/auth/register").send(testUser).expect(201);
    await request(app).post("/auth/register").send(testUser).expect(400);
  });

  it("should return 500 on register server error", async () => {
    jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error("boom"));
    await request(app).post("/auth/register").send(testUser).expect(500);
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

  it("should fail login when missing fields", async () => {
    await request(app)
      .post("/auth/login")
      .send({ email: testUser.email })
      .expect(400);
  });

  it("should fail login when user not found", async () => {
    await request(app)
      .post("/auth/login")
      .send({ email: "missing@example.com", password: "x" })
      .expect(400);
  });

  it("should fail login when password is wrong", async () => {
    await User.create({
      username: testUser.username,
      email: testUser.email,
      password: await require("bcryptjs").hash("different", 10),
    });

    await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect(400);
  });

  it("should return 500 on login server error", async () => {
    jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error("boom"));
    await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect(500);
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

  it("should fail logout when missing refresh token", async () => {
    await request(app).post("/auth/logout").send({}).expect(400);
  });

  it("should fail logout when refresh token invalid", async () => {
    await request(app)
      .post("/auth/logout")
      .send({ refreshToken: "does-not-exist" })
      .expect(400);
  });

  it("should return 500 on logout server error", async () => {
    jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error("boom"));
    await request(app)
      .post("/auth/logout")
      .send({ refreshToken: "x" })
      .expect(500);
  });

  it("should fail refresh when missing refresh token", async () => {
    await request(app).post("/auth/refresh").send({}).expect(400);
  });

  it("should fail refresh when user not found", async () => {
    const refreshToken = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString() },
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
      { expiresIn: "7d" }
    );

    await request(app)
      .post("/auth/refresh")
      .send({ refreshToken })
      .expect(403);
  });

  it("should fail refresh when token verification fails", async () => {
    const user = await User.create({
      username: "rtUser",
      email: "rt@example.com",
      password: await require("bcryptjs").hash("p", 10),
      refreshTokens: [],
    });

    // Store a token that will fail verification (signed with the wrong secret)
    const badRefreshToken = jwt.sign(
      { id: user._id.toString() },
      "wrong-secret",
      { expiresIn: "7d" }
    );
    user.refreshTokens.push(badRefreshToken);
    await user.save();

    await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: badRefreshToken })
      .expect(403);
  });

  it("should refresh access token", async () => {
    const user = await User.create({
      username: "rtUser2",
      email: "rt2@example.com",
      password: await require("bcryptjs").hash("p", 10),
      refreshTokens: [],
    });

    const goodRefreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
      { expiresIn: "7d" }
    );
    user.refreshTokens.push(goodRefreshToken);
    await user.save();

    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: goodRefreshToken })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
  });

  it("should return 500 on refresh server error", async () => {
    jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error("boom"));
    await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "x" })
      .expect(500);
  });
});
