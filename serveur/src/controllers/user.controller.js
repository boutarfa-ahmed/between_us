import prisma from "../lib/prisma.js";

export async function getProfile(req, res) {
  try {
    const user = req.user;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyGuesses = await prisma.guess.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: weekAgo },
      },
      select: { pointsEarned: true },
    });

    const weeklyPoints = weeklyGuesses.reduce(
      (sum, g) => sum + g.pointsEarned, 0
    );

    const memoriesCount = user.coupleId
      ? await prisma.memory.count({ where: { coupleId: user.coupleId } })
      : 0;

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        totalPoints: user.totalPoints,
        streakDays: user.streakDays,
        weeklyPoints,
        memoriesCount,
        coupleId: user.coupleId,
      },
    });

  } catch (err) {
    console.error("Get profile error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPartner(req, res) {
  try {
    const user = req.user;

    if (!user.coupleId) {
      return res.status(404).json({ message: "You are not in a couple yet" });
    }

    const partner = await prisma.user.findFirst({
      where: {
        coupleId: user.coupleId,
        id: { not: user.id },
      },
      select: {
        id: true,
        nickname: true,
        totalPoints: true,
        streakDays: true,
      },
    });

    if (!partner) {
      return res.json({ partner: null, message: "Partner hasn't joined yet" });
    }

    return res.json({ partner });

  } catch (err) {
    console.error("Get partner error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateNickname(req, res) {
  try {
    const { nickname } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { nickname },
      select: { id: true, nickname: true },
    });

    return res.json({ user: updated });

  } catch (err) {
    console.error("Update nickname error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}
