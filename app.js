let userLocation = null;

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("enableAlerts");
  const status = document.getElementById("status");
  const alertsDiv = document.getElementById("alerts");

  alertsDiv.innerHTML = "<p>Enable alerts to check your area.</p>";

  button.addEventListener("click", () => {
    status.textContent = "Getting your location…";

    if (!navigator.geolocation) {
      status.textContent = "Geolocation not supported.";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          status.textContent = "Notifications blocked.";
          return;
        }

        status.textContent = "Checking alerts for your location…";
        loadAlertsForUser();
      },
      () => {
        status.textContent = "Location permission denied.";
      }
    );
  });
});

/* ================================
   POINT IN POLYGON (Ray Casting)
   ================================ */
function pointInPolygon(lat, lon, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect =
      ((yi > lat) !== (yj > lat)) &&
      (lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/* ================================
   LOAD & FILTER NWS ALERTS
   ================================ */
async function loadAlertsForUser() {
  const alertsDiv = document.getElementById("alerts");
  alertsDiv.innerHTML = "";

  try {
    const res = await fetch(
      "https://api.weather.gov/alerts/active?area=OK"
    );
    const data = await res.json();

    if (!data.features || data.features.length === 0) {
      alertsDiv.innerHTML =
        "<p>No active alerts in Oklahoma.</p>";
      return;
    }

    let matchedAlerts = [];

    data.features.forEach(alert => {
      const geom = alert.geometry;
      if (!geom) return;

      if (geom.type === "Polygon") {
        const poly = geom.coordinates[0].map(
          ([lon, lat]) => [lat, lon]
        );

        if (pointInPolygon(userLocation.lat, userLocation.lon, poly)) {
          matchedAlerts.push(alert);
        }
      }

      if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach(polygonSet => {
          const poly = polygonSet[0].map(
            ([lon, lat]) => [lat, lon]
          );

          if (pointInPolygon(userLocation.lat, userLocation.lon, poly)) {
            matchedAlerts.push(alert);
          }
        });
      }
    });

    if (matchedAlerts.length === 0) {
      alertsDiv.innerHTML =
        "<p>No active watches or warnings for your location.</p>";
      return;
    }

    alertsDiv.innerHTML = "<h2>Alerts For Your Area</h2>";

    matchedAlerts.forEach(alert => {
      const p = alert.properties;

      const el = document.createElement("div");
      el.style.border = "2px solid #cc0000";
      el.style.margin = "12px 0";
      el.style.padding = "12px";
      el.style.borderRadius = "8px";

      el.innerHTML = `
        <strong>${p.event}</strong><br>
        <small>${p.areaDesc}</small><br>
        <small>Expires: ${new Date(p.ends).toLocaleString()}</small>
      `;

      alertsDiv.appendChild(el);
    });

  } catch (err) {
    console.error(err);
    alertsDiv.innerHTML =
      "<p>Error checking alerts.</p>";
  }
}

