import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import Comment from "../src/models/Comments";
import Post from "../src/models/Post";
import User from "../src/models/User";

const testUser = {
    username: "commentTestuser",
    email: "commentTest@example.com",
    password: "password123",
};

let app: express.Application;
let accessToken: string;
let testPostId: string;

beforeAll(async () => {
    // Set test database URI
    process.env.MONGO_URI = "mongodb://localhost:27017/web-task-2-test-comments";
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

// Helper to create a post for comments
const createTestPost = async () => {
    if (!testPostId) {
        const post = await Post.create({
            message: "Test Post for Comments",
            sender: "Test Sender",
        });
        testPostId = post._id.toString();
    }
    return testPostId;
};

afterEach(async () => {
    // Clear database after each test
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
    accessToken = ""; // Reset token
    testPostId = ""; // Reset post ID
});

afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
});

describe("Comments API", () => {
    it("should create a new comment", async () => {
        const token = await getToken();
        const postId = await createTestPost();
        const response = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({
                postId,
                message: "Test comment",
                sender: "Commenter",
            })
            .expect(201);

        expect(response.body.message).toBe("Test comment");
        expect(response.body.sender).toBe("Commenter");
        expect(response.body.postId).toBe(postId);
    });

    it("should get comments for a post", async () => {
        const token = await getToken();
        const postId = await createTestPost();
        await Comment.create({
            postId,
            message: "Comment 1",
            sender: "Sender 1",
        });
        await Comment.create({
            postId,
            message: "Comment 2",
            sender: "Sender 2",
        });

        const response = await request(app)
            .get(`/comments?postId=${postId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body.length).toBe(2);
    });

    it("should get comment by id", async () => {
        const token = await getToken();
        const postId = await createTestPost();
        const comment = await Comment.create({
            postId,
            message: "Comment to find",
            sender: "Sender",
        });

        const response = await request(app)
            .get(`/comments/${comment._id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body.message).toBe("Comment to find");
    });

    it("should update comment", async () => {
        const token = await getToken();
        const postId = await createTestPost();
        const comment = await Comment.create({
            postId,
            message: "Old Message",
            sender: "Old Sender",
        });

        const response = await request(app)
            .put(`/comments/${comment._id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                postId,
                message: "Updated Message",
                sender: "Updated Sender",
            })
            .expect(200);

        expect(response.body.message).toBe("Updated Message");
        expect(response.body.sender).toBe("Updated Sender");
    });

    it("should delete comment", async () => {
        const token = await getToken();
        const postId = await createTestPost();
        const comment = await Comment.create({
            postId,
            message: "Delete Me",
            sender: "Sender",
        });

        await request(app)
            .delete(`/comments/${comment._id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        const check = await Comment.findById(comment._id);
        expect(check).toBeNull();
    });
});
