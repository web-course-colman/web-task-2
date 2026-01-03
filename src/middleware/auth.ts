import jwt from "jsonwebtoken";
import express from "express";

const authenticateToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: "Access token required" });
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err: jwt.VerifyErrors | null, user: any) => {
      if (err) {
        res.status(403).json({ message: "Invalid or expired token" });
        return;
      }
      (req as any).user = user;
      next();
    }
  );
};

export { authenticateToken };
