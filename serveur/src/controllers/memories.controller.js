import prisma from "../lib/prisma.js";
import { deleteImage } from "../lib/cloudinary.js";

const POINTS = { EASY: 30, MEDIUM: 50, HARD: 80 };
const VALID_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

export async function createMemory(req, res) {
  try {
    const { difficulty, secretMessage, songUrl } = req.body;
    const user = req.user;

    if (!user.coupleId) {
      return res.status(403).json({ message: "You are not in a couple yet" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const diff = (difficulty || "MEDIUM").toUpperCase();
    if (!VALID_DIFFICULTIES.includes(diff)) {
      return res.status(400).json({ message: "Invalid difficulty level" });
    }

    const memory = await prisma.memory.create({
      data: {
        imageUrl: req.file.path,
        imagePublicId: req.file.filename,
        difficulty: diff,
        secretMessage: secretMessage ? String(secretMessage).slice(0, 500) : null,
        songUrl: songUrl ? String(songUrl).slice(0, 500) : null,
        coupleId: user.coupleId,
        uploadedById: user.id,
      },
      include: { uploadedBy: { select: { nickname: true } } },
    });

    return res.status(201).json({ memory });

  } catch (err) {
    console.error("Create memory error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMemories(req, res) {
  try {
    const user = req.user;
    const { year } = req.query;

    if (!user.coupleId) {
      return res.status(403).json({ message: "You are not in a couple yet" });
    }

    let dateFilter = {};
    if (year) {
      const y = parseInt(year, 10);
      if (!isNaN(y) && y >= 2000 && y <= 2100) {
        dateFilter = {
          createdAt: {
            gte: new Date(`${y}-01-01T00:00:00.000Z`),
            lte: new Date(`${y}-12-31T23:59:59.999Z`),
          },
        };
      }
    }

    const memories = await prisma.memory.findMany({
      where: {
        coupleId: user.coupleId,
        ...dateFilter,
      },
      include: {
        uploadedBy: { select: { id: true, nickname: true } },
        guess: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ memories });

  } catch (err) {
    console.error("Get memories error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMemory(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id || typeof id !== "string" || id.length > 100) {
      return res.status(400).json({ message: "Invalid memory ID" });
    }

    const memory = await prisma.memory.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, nickname: true } },
        guess: true,
      },
    });

    if (!memory || memory.coupleId !== user.coupleId) {
      return res.status(404).json({ message: "Memory not found" });
    }

    return res.json({ memory });

  } catch (err) {
    console.error("Get memory error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteMemory(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id || typeof id !== "string" || id.length > 100) {
      return res.status(400).json({ message: "Invalid memory ID" });
    }

    const memory = await prisma.memory.findUnique({ where: { id } });

    if (!memory || memory.coupleId !== user.coupleId) {
      return res.status(404).json({ message: "Memory not found" });
    }

    if (memory.uploadedById !== user.id) {
      return res.status(403).json({ message: "Not authorized to delete this memory" });
    }

    try {
      await deleteImage(memory.imagePublicId);
    } catch (imgErr) {
      console.error("Image deletion warning:", imgErr.message);
    }

    await prisma.memory.delete({ where: { id } });

    return res.json({ message: "Memory deleted" });

  } catch (err) {
    console.error("Delete memory error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}
