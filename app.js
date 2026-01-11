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
async function loadPolygonAlerts() {
  if (!userLocation) return;

  const alertsDiv = document.getElementById("alerts");
  alertsDiv.innerHTML = "<p>Checking alerts for your area…</p>";

  try {
    const res = await fetch("https://api.weather.gov/alerts/active?area=OK");
    const data = await res.json();

    const matching = data.features.filter(alert => {
      const geom = alert.geometry;
      if (!geom || geom.type !== "Polygon") return false;

      const polygon = geom.coordinates[0].map(([lon, lat]) => [lat, lon]);
      return isPointInPolygon(
        [userLocation.lat, userLocation.lon],
        polygon
      );
    });

    if (matching.length === 0) {
      alertsDiv.innerHTML =
        "<p>No active alerts for your location.</p>";
      return;
    }

    alertsDiv.innerHTML = "<h2>Alerts For Your Area</h2>";

    matching.forEach(a => {
      const el = document.createElement("div");
      el.style.border = "2px solid #cc0000";
      el.style.padding = "12px";
      el.style.margin = "12px 0";

      el.innerHTML = `
        <strong>${a.properties.event}</strong><br>
        <small>${a.properties.areaDesc}</small>
      `;
      alertsDiv.appendChild(el);
    });

  } catch (e) {
    alertsDiv.innerHTML =
      "<p>Error checking alerts.</p>";
    console.error(e);
  }
}


