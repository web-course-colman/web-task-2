const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    res
      .status(201)
      .json({
        message: "User registered successfully",
        user: {
          id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email,
        },
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
      { expiresIn: "7d" }
    );

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );
    await user.save();

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
      (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign(
          { id: user._id, username: user.username },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "15m" }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
