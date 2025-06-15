import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "../utils/email";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = user.id;
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        fullName: user.fullName, 
        isAdmin: user.isAdmin 
      } 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await storage.createUser({ ...userData, password: hashedPassword });

    // Set session
    req.session.userId = user.id;
    
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        fullName: user.fullName 
      } 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json({ 
    user: { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      fullName: user.fullName, 
      isAdmin: user.isAdmin 
    } 
  });
});

// Password reset request
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: "If an account exists with this email, you will receive a password reset link." });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token
    await storage.updateUserResetToken(user.id, resetToken, resetTokenExpiry);

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: "If an account exists with this email, you will receive a password reset link." });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    res.status(500).json({ message: "Error processing request" });
  }
});

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = z.object({
      token: z.string(),
      password: z.string().min(6, "Password must be at least 6 characters"),
    }).parse(req.body);

    const user = await storage.getUserByResetToken(token);
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await storage.updateUserPassword(user.id, hashedPassword);
    await storage.clearUserResetToken(user.id);

    res.json({ message: "Password has been reset successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    res.status(500).json({ message: "Error resetting password" });
  }
});

export default router; 