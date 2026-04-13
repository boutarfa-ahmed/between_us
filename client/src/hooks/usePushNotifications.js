import { useEffect } from "react";

export function usePushNotifications() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => console.log("Service worker registered:", reg.scope))
        .catch((err) => {
          console.error("Service worker registration failed:", err);
        });
    } else {
      console.log("Service workers not supported");
    }
  }, []);
}