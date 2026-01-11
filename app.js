document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("enableAlerts");
  const status = document.getElementById("status");

  if (!button) {
    console.error("Enable Alerts button not found");
    return;
  }

  button.addEventListener("click", async () => {
    console.log("Enable Alerts clicked");

    if (!("geolocation" in navigator)) {
      status.textContent = "Geolocation not supported on this device.";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async () => {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          status.textContent = "Notifications are blocked.";
          return;
        }

        status.textContent = "Weather alerts enabled for your location.";
      },
      () => {
        status.textContent = "Location permission denied.";
      }
    );
  });
});
