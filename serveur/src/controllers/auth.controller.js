import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
  );
}

function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

export async function register(req, res) {
  try {
    const { email, password, nickname, inviteCode } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    let couple = await prisma.couple.findUnique({ where: { inviteCode } });
    if (!couple) {
      couple = await prisma.couple.create({ data: { inviteCode } });
    } else {
      const membersCount = await prisma.user.count({ where: { coupleId: couple.id } });
      if (membersCount >= 2) {
        return res.status(400).json({ message: "This space is already full ♥" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, nickname, coupleId: couple.id },
    });

    const token = generateToken(user.id);
    return res.status(201).json({ token, user: safeUser(user) });

  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { couple: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials ♥" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials ♥" });
    }

    const token = generateToken(user.id);
    return res.json({ token, user: safeUser(user) });

  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMe(req, res) {
  try {
    return res.json({ user: safeUser(req.user) });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}
