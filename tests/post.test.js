const request = require("supertest");
const mongoose = require("mongoose");
const Post = require("../src/models/Post");
const User = require("../src/models/User");

const testUser = {
  username: "postTestuser",
  email: "postTest@example.com",
  password: "password123",
};

let app;
let accessToken;

beforeAll(async () => {
  // Set test database URI
  process.env.MONGO_URI = "mongodb://localhost:27017/web-task-2-test-post";
  // Require app, which will connect to test DB
  app = require("../src/app");
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
        sender: "Test sender",
      })
      .expect(201);

    expect(response.body.message).toBe("Test message");
    expect(response.body.sender).toBe("Test sender");
  });

  it("should get all posts", async () => {
    const token = await getToken();
    await Post.create({ message: "Test message", sender: "Test sender" });

    const response = await request(app)
      .get("/post")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].message).toBe("Test message");
  });

  it("should get post by id", async () => {
    const token = await getToken();
    const post = await Post.create({
      message: "Test message",
      sender: "Test sender",
    });

    const response = await request(app)
      .get(`/post/${post._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toBe("Test message");
  });

  it("should get posts by sender", async () => {
    const token = await getToken();
    await Post.create({ message: "Test message 1", sender: "Sender1" });
    await Post.create({ message: "Test message 2", sender: "Sender1" });
    await Post.create({ message: "Test message 3", sender: "Sender2" });

    const response = await request(app)
      .get("/post?sender=Sender1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBe(2);
  });

  it("should update post", async () => {
    const token = await getToken();
    const post = await Post.create({
      message: "Old message",
      sender: "Old sender",
    });

    const response = await request(app)
      .put(`/post/${post._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        message: "Updated message",
        sender: "Updated sender",
      })
      .expect(200);

    expect(response.body.message).toBe("Updated message");
    expect(response.body.sender).toBe("Updated sender");
  });
});
