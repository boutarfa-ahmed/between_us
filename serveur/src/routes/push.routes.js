import express from "express";
import webpush from "web-push";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { z } from "zod";

const router = express.Router();
const prisma = new PrismaClient();

webpush.setVapidDetails(
  "mailto:betweenus@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

router.post("/subscribe", authenticate, async (req, res) => {
  try {
    const { endpoint, keys } = subscribeSchema.parse(req.body);
    
    await prisma.pushSubscription.create({
      data: {
        userId: req.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    res.json({ message: "Subscribed to notifications" });
  } catch (err) {
    console.error("Subscribe error:", err.message);
    res.status(400).json({ message: "Failed to subscribe" });
  }
});

router.delete("/unsubscribe", authenticate, async (req, res) => {
  try {
    const { endpoint } = req.body;
    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });
    res.json({ message: "Unsubscribed" });
  } catch (err) {
    console.error("Unsubscribe error:", err.message);
    res.status(400).json({ message: "Failed to unsubscribe" });
  }
});

router.get("/vapid-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

export async function sendNotification(userId, title, body, icon = "♥") {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    console.log(`No push subscriptions for user ${userId}`);
    return;
  }

  console.log(`Sending notification to ${subscriptions.length} subscription(s): ${title}`);

  const payload = JSON.stringify({ title, body, icon, badge: "♥" });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      console.log(`Notification sent to ${sub.endpoint.slice(0, 50)}...`);
    } catch (err) {
      console.error(`Push failed for ${sub.endpoint.slice(0, 50)}...:`, err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
        console.log(`Deleted stale subscription`);
      }
    }
  }
}

export default router;