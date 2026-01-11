let userLocation = null;

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("enableAlerts");
  const status = document.getElementById("status");

  button.addEventListener("click", () => {
    status.textContent = "Getting your location…";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          status.textContent = "Alerts enabled for your area ✔️";
          loadPolygonAlerts();
        } else {
          status.textContent = "Notifications blocked.";
        }
      },
      () => {
        status.textContent = "Location permission denied.";
      }
    );
  });
});
