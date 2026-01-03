import { Request, Response } from "express";
import User from "../models/User";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}, "-password -refreshTokens");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id, "-password -refreshTokens");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

const updateUser = async (req: Request, res: Response) => {
    try {
        const { username, email, bio } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (bio !== undefined) user.bio = bio;

        const savedUser = await user.save();
        res.json({
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            bio: savedUser.bio
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export { getAllUsers, getUserById, updateUser, deleteUser };
