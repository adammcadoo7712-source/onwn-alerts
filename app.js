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
function isPointInPolygon(point, polygon) {
  let inside = false;
  const [x, y] = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect =
      ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

