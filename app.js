function enableAlerts() {
  const status = document.getElementById("status");

  if (!("geolocation" in navigator)) {
    status.innerText = "Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        status.innerText = "Notifications blocked.";
        return;
      }

      status.innerText =
        "Alerts enabled for your location: " +
        lat.toFixed(2) +
        ", " +
        lon.toFixed(2);
    },
    () => {
      status.innerText = "Location permission denied.";
    }
  );
}
