import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
  nickname: z
    .string()
    .min(2, "Nickname must be at least 2 characters")
    .max(30, "Nickname too long")
    .regex(/^[a-zA-Z0-9_\s]+$/, "Nickname can only contain letters, numbers and underscores"),
  inviteCode: z
    .string()
    .min(4, "Invite code too short")
    .max(50, "Invite code too long")
    .regex(/^[A-Za-z0-9-_]+$/, "Invalid invite code format"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const guessSchema = z.object({
  guessText: z
    .string()
    .min(1, "Guess text is required")
    .max(1000, "Guess too long")
    .trim(),
});

export const guessDecisionSchema = z.object({
  decision: z.enum(["ACCEPT", "REJECT"]),
});

export const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, "Nickname must be at least 2 characters")
    .max(30, "Nickname too long")
    .regex(/^[a-zA-Z0-9_\s]+$/, "Nickname can only contain letters, numbers and underscores"),
});

export function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.errors.map(e => e.message);
        return res.status(400).json({ message: errors[0], errors });
      }
      req.body = result.data;
      next();
    } catch (err) {
      return res.status(500).json({ message: "Validation error" });
    }
  };
}