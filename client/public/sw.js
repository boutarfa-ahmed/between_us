self.addEventListener("push", (event) => {
  const data = event.data?.json() || { title: "Between Us ♥", body: "New update!" };
  
  const options = {
    body: data.body,
    icon: "/vite.svg",
    badge: "♥",
    vibrate: [200, 100, 200],
    tag: "between-us-notification",
    renotify: true,
    data: { url: self.location.origin },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/")
  );
});