import express from "express";
import { register, login, logout, refreshToken } from "../controllers/auth";

const router = express.Router();

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", register);

// @route   POST /auth/login
// @desc    Login user
// @access  Public
router.post("/login", login);

// @route   POST /auth/logout
// @desc    Logout user
// @access  Public
router.post("/logout", logout);

// @route   POST /auth/refresh
// @desc    Refresh access token
// @access  Public
router.post("/refresh", refreshToken);

export default router;
