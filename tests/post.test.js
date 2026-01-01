const request = require("supertest");
const mongoose = require("mongoose");
const Post = require("../src/models/Post");

let app;

beforeAll(async () => {
  // Set test database URI
  process.env.MONGO_URI = "mongodb://localhost:27017/web-task-2-test";
  // Require app, which will connect to test DB
  app = require("../src/app");
});

afterEach(async () => {
  // Clear database after each test
  await Post.deleteMany({});
});

afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
});

describe("Posts API", () => {
  it("should create a new post", async () => {
    const response = await request(app)
      .post("/post")
      .send({
        message: "Test message",
        sender: "Test sender",
      })
      .expect(201);

    expect(response.body.message).toBe("Test message");
    expect(response.body.sender).toBe("Test sender");
  });

  it("should get all posts", async () => {
    await Post.create({ message: "Test message", sender: "Test sender" });

    const response = await request(app).get("/post").expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].message).toBe("Test message");
  });

  it("should get post by id", async () => {
    const post = await Post.create({
      message: "Test message",
      sender: "Test sender",
    });

    const response = await request(app).get(`/post/${post._id}`).expect(200);

    expect(response.body.message).toBe("Test message");
  });

  it("should get posts by sender", async () => {
    await Post.create({ message: "Test message 1", sender: "Sender1" });
    await Post.create({ message: "Test message 2", sender: "Sender1" });
    await Post.create({ message: "Test message 3", sender: "Sender2" });

    const response = await request(app).get("/post?sender=Sender1").expect(200);

    expect(response.body.length).toBe(2);
  });

  it("should update post", async () => {
    const post = await Post.create({
      message: "Old message",
      sender: "Old sender",
    });

    const response = await request(app)
      .put(`/post/${post._id}`)
      .send({
        message: "Updated message",
        sender: "Updated sender",
      })
      .expect(200);

    expect(response.body.message).toBe("Updated message");
    expect(response.body.sender).toBe("Updated sender");
  });
});
