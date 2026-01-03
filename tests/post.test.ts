import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import Post from "../src/models/Post";
import User from "../src/models/User";

const testUser = {
  username: "postTestuser",
  email: "postTest@example.com",
  password: "password123",
};

let app: express.Application;
let accessToken: string;

beforeAll(async () => {
  // Set test database URI
  process.env.MONGO_URI = "mongodb://localhost:27017/web-task-2-test-post";
  // Dynamically import app after setting env
  const appModule = await import("../src/app");
  app = appModule.createApp();
});

const getToken = async () => {
  if (!accessToken) {
    // Register and login to get token
    await request(app).post("/auth/register").send(testUser);

    const loginRes = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    accessToken = loginRes.body.accessToken;
  }
  return accessToken;
};

afterEach(async () => {
  // Clear database after each test
  await Post.deleteMany({});
  await User.deleteMany({});
  accessToken = "";
});

afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
});

describe("Posts API", () => {
  it("should create a new post", async () => {
    const token = await getToken();
    const response = await request(app)
      .post("/post")
      .set("Authorization", `Bearer ${token}`)
      .send({
        message: "Test message",
      })
      .expect(201);

    expect(response.body.message).toBe("Test message");
    // Sender should be the test user's ID
    const user = await User.findOne({ email: testUser.email });
    expect(response.body.sender).toBe(user!._id.toString());
  });

  it("should get all posts", async () => {
    const token = await getToken();
    const user = await User.findOne({ email: testUser.email });
    await Post.create({ message: "Test message", sender: user!._id });

    const response = await request(app)
      .get("/post")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].message).toBe("Test message");
  });

  it("should get post by id", async () => {
    const token = await getToken();
    const user = await User.findOne({ email: testUser.email });
    const post = await Post.create({
      message: "Test message",
      sender: user!._id,
    });

    const response = await request(app)
      .get(`/post/${post._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toBe("Test message");
  });

  it("should get posts by sender", async () => {
    const token = await getToken();
    const user1 = await User.create({ username: "u1", email: "e1@t.com", password: "p" });
    const user2 = await User.create({ username: "u2", email: "e2@t.com", password: "p" });

    await Post.create({ message: "M1", sender: user1._id });
    await Post.create({ message: "M2", sender: user1._id });
    await Post.create({ message: "M3", sender: user2._id });

    const response = await request(app)
      .get(`/post?sender=${user1._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBe(2);
  });

  it("should update post", async () => {
    const token = await getToken();
    const user = await User.findOne({ email: testUser.email });
    const post = await Post.create({
      message: "Old message",
      sender: user!._id,
    });

    const response = await request(app)
      .put(`/post/${post._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        message: "Updated message",
      })
      .expect(200);

    expect(response.body.message).toBe("Updated message");
  });

  it("should fail to update post of another user", async () => {
    const token = await getToken();
    const otherUser = await User.create({ username: "other", email: "other@t.com", password: "p" });
    const post = await Post.create({
      message: "Other user post",
      sender: otherUser._id,
    });

    await request(app)
      .put(`/post/${post._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        message: "Attempted update",
      })
      .expect(403);
  });
});
