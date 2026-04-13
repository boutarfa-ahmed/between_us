import { pushApi } from "../services/api.js";

const VAPID_KEY_STORAGE = "between_us_vapid_key";

export async function askPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") return true;
  
  if (Notification.permission === "denied") {
    console.log("Notifications blocked by user");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export async function subscribeToPush() {
  const hasPermission = await askPermission();
  if (!hasPermission) return null;

  try {
    const { publicKey } = await pushApi.getVapidKey();
    localStorage.setItem(VAPID_KEY_STORAGE, publicKey);

    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const subJson = subscription.toJSON();
    console.log("Subscription created:", subJson);

    const subscriptionData = {
      endpoint: subJson.endpoint,
      keys: {
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
      },
    };

    await pushApi.subscribe(subscriptionData);
    console.log("Push subscription successful");
    return subscription;
  } catch (err) {
    console.error("Push subscription failed:", err);
    return null;
  }
}

export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      await pushApi.unsubscribe(subscription.endpoint);
    }
  } catch (err) {
    console.error("Unsubscribe failed:", err);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}