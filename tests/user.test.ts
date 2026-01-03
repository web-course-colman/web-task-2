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
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("User API", () => {
    it("should get all users", async () => {
        const token = await getToken();
        const response = await request(app)
            .get("/user")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
    });

    it("should get user by id", async () => {
        const token = await getToken();
        const response = await request(app)
            .get(`/user/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body.username).toBe(testUser.username);
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

    it("should delete user", async () => {
        const token = await getToken();
        await request(app)
            .delete(`/user/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        const check = await User.findById(userId);
        expect(check).toBeNull();
    });
});
