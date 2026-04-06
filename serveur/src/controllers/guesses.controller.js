import prisma from "../lib/prisma.js";

const POINTS = { EASY: 30, MEDIUM: 50, HARD: 80 };

export async function submitGuess(req, res) {
  try {
    const { id: memoryId } = req.params;
    const { guessText } = req.body;
    const user = req.user;

    const memory = await prisma.memory.findUnique({ where: { id: memoryId } });

    if (!memory || memory.coupleId !== user.coupleId) {
      return res.status(404).json({ message: "Memory not found" });
    }

    if (memory.uploadedById === user.id) {
      return res.status(400).json({ message: "You can't guess your own memory" });
    }

    const existingGuess = await prisma.guess.findUnique({ where: { memoryId } });
    if (existingGuess) {
      return res.status(400).json({ message: "Already guessed" });
    }

    const guess = await prisma.guess.create({
      data: {
        guessText,
        pointsEarned: 0,
        status: "PENDING",
        memoryId,
        userId: user.id,
      },
      include: { user: { select: { nickname: true } } },
    });

    return res.status(201).json({
      guess,
      message: "Guess submitted! Waiting for partner's response ♥",
    });

  } catch (err) {
    console.error("Submit guess error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getGuess(req, res) {
  try {
    const { id: memoryId } = req.params;
    const user = req.user;

    const memory = await prisma.memory.findUnique({ where: { id: memoryId } });
    if (!memory || memory.coupleId !== user.coupleId) {
      return res.status(404).json({ message: "Memory not found" });
    }

    const guess = await prisma.guess.findUnique({
      where: { memoryId },
      include: { user: { select: { nickname: true } } },
    });

    if (!guess) {
      return res.json({ guess: null, message: "Not guessed yet" });
    }

    return res.json({ guess });

  } catch (err) {
    console.error("Get guess error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function decideGuess(req, res) {
  try {
    const { id: memoryId } = req.params;
    const { decision } = req.body;
    const user = req.user;

    const memory = await prisma.memory.findUnique({ where: { id: memoryId } });

    if (!memory || memory.coupleId !== user.coupleId) {
      return res.status(404).json({ message: "Memory not found" });
    }

    if (memory.uploadedById !== user.id) {
      return res.status(403).json({ message: "Only the memory owner can accept/reject" });
    }

    const guess = await prisma.guess.findUnique({ where: { memoryId } });
    if (!guess) {
      return res.status(404).json({ message: "No guess to decide on" });
    }

    if (guess.status !== "PENDING") {
      return res.status(400).json({ message: "Guess already decided" });
    }

    const isAccepted = decision === "ACCEPT";
    const pointsEarned = isAccepted ? (POINTS[memory.difficulty] || 50) : 0;

    if (isAccepted) {
      await prisma.$transaction([
        prisma.guess.update({
          where: { id: guess.id },
          data: { status: "ACCEPTED", pointsEarned },
        }),
        prisma.memory.update({
          where: { id: memoryId },
          data: { isGuessed: true },
        }),
        prisma.user.update({
          where: { id: guess.userId },
          data: { totalPoints: { increment: pointsEarned } },
        }),
      ]);

      await updateStreak(guess.userId);

      return res.json({
        message: `Guess accepted! +${pointsEarned} points awarded ✨`,
        pointsEarned,
        accepted: true,
      });
    } else {
      await prisma.guess.update({
        where: { id: guess.id },
        data: { status: "REJECTED", pointsEarned: 0 },
      });

      return res.json({
        message: "Guess rejected. Try again! 💪",
        accepted: false,
      });
    }

  } catch (err) {
    console.error("Decide guess error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateStreak(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const now = new Date();
  const lastActive = new Date(user.lastActiveAt || 0);

  const diffDays = Math.floor(
    (now.setHours(0,0,0,0) - lastActive.setHours(0,0,0,0))
    / (1000 * 60 * 60 * 24)
  );

  let newStreak;
  if (diffDays === 0) {
    newStreak = user.streakDays;
  } else if (diffDays === 1) {
    newStreak = user.streakDays + 1;
  } else {
    newStreak = 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      streakDays: newStreak,
      lastActiveAt: new Date(),
    },
  });
}