import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import User from "../src/models/User";

const testUser = {
    username: "userTestAdmin",
    email: "adminTest@example.com",
    password: "password123",
};

let app: express.Application;
let accessToken: string;
let userId: string;

beforeAll(async () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/web-task-2-test-user";
    const appModule = await import("../src/app");
    app = appModule.createApp();
});

const getToken = async () => {
    if (!accessToken) {
        const regRes = await request(app).post("/auth/register").send(testUser);
        userId = regRes.body.user.id;

        const loginRes = await request(app).post("/auth/login").send({
            email: testUser.email,
            password: testUser.password,
        });

        accessToken = loginRes.body.accessToken;
    }
    return accessToken;
};

afterEach(async () => {
    await User.deleteMany({});
    accessToken = "";
    jest.restoreAllMocks();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("User API", () => {
    it("should reject requests without access token (middleware 401)", async () => {
        await request(app).get("/user").expect(401);
    });

    it("should reject requests with invalid access token (middleware 403)", async () => {
        await request(app)
            .get("/user")
            .set("Authorization", "Bearer invalid.token.value")
            .expect(403);
    });

    it("should get all users", async () => {
        const token = await getToken();
        const response = await request(app)
            .get("/user")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
    });

    it("should return 500 when getAllUsers throws", async () => {
        const token = await getToken();
        jest.spyOn(User, "find").mockRejectedValueOnce(new Error("boom"));
        await request(app)
            .get("/user")
            .set("Authorization", `Bearer ${token}`)
            .expect(500);
    });

    it("should get user by id", async () => {
        const token = await getToken();
        const response = await request(app)
            .get(`/user/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body.username).toBe(testUser.username);
    });

    it("should return 404 when user id not found", async () => {
        const token = await getToken();
        const missingId = new mongoose.Types.ObjectId().toString();
        await request(app)
            .get(`/user/${missingId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("should return 500 when user id is invalid", async () => {
        const token = await getToken();
        await request(app)
            .get(`/user/not-an-objectid`)
            .set("Authorization", `Bearer ${token}`)
            .expect(500);
    });

    it("should update user profile", async () => {
        const token = await getToken();
        const response = await request(app)
            .put(`/user/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                bio: "I am a test user",
            })
            .expect(200);

        expect(response.body.bio).toBe("I am a test user");
    });

    it("should update username and email", async () => {
        const token = await getToken();
        const response = await request(app)
            .put(`/user/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ username: "updatedName", email: "updated@example.com" })
            .expect(200);

        expect(response.body.username).toBe("updatedName");
        expect(response.body.email).toBe("updated@example.com");
    });

    it("should return 404 when updating a missing user", async () => {
        const token = await getToken();
        const missingId = new mongoose.Types.ObjectId().toString();
        await request(app)
            .put(`/user/${missingId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ bio: "x" })
            .expect(404);
    });

    it("should return 500 when updating with invalid id", async () => {
        const token = await getToken();
        await request(app)
            .put(`/user/not-an-objectid`)
            .set("Authorization", `Bearer ${token}`)
            .send({ bio: "x" })
            .expect(500);
    });

    it("should delete user", async () => {
        const token = await getToken();
        await request(app)
            .delete(`/user/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        const check = await User.findById(userId);
        expect(check).toBeNull();
    });

    it("should return 404 when deleting a missing user", async () => {
        const token = await getToken();
        const missingId = new mongoose.Types.ObjectId().toString();
        await request(app)
            .delete(`/user/${missingId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("should return 500 when deleting with invalid id", async () => {
        const token = await getToken();
        await request(app)
            .delete(`/user/not-an-objectid`)
            .set("Authorization", `Bearer ${token}`)
            .expect(500);
    });

    it("should return API Running on root route", async () => {
        const token = await getToken();
        const res = await request(app)
            .get("/")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(res.text).toBe("API Running");
    });
});
