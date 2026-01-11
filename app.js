let userLocation = null;
let alertsEnabled = false;
let alertTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("enableAlerts");
  const status = document.getElementById("status");

  // Restore saved state
  alertsEnabled = localStorage.getItem("alertsEnabled") === "true";

  if (alertsEnabled) {
    status.textContent = "Weather alerts are enabled ✔️";
    initAlerts();
  }

  button.addEventListener("click", () => {
    enableAlerts();
  });
});

/* ================================
   ENABLE ALERTS (ONE TIME)
   ================================ */
function enableAlerts() {
  const status = document.getElementById("status");

  status.textContent = "Enabling weather alerts…";

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

      // Save enabled state
      alertsEnabled = true;
      localStorage.setItem("alertsEnabled", "true");

      status.textContent = "Weather alerts enabled ✔️";

      initAlerts();
    },
    () => {
      status.textContent = "Location permission denied.";
    }
  );
}

/* ================================
   START AUTOMATIC CHECKING
   ================================ */
function initAlerts() {
  // Check immediately
  loadAlertsForUser();

  // Clear any existing timers
  if (alertTimer) clearInterval(alertTimer);

 // Aggressive refresh: every 60 seconds
alertTimer = setInterval(loadAlertsForUser, 60 * 1000);


/* ================================
   POINT IN POLYGON
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
   LOAD ALERTS FOR USER LOCATION
   ================================ */
async function loadAlertsForUser() {
  if (!alertsEnabled || !userLocation) return;

  const alertsDiv = document.getElementById("alerts");
  alertsDiv.innerHTML = "<p>Checking alerts for your location…</p>";

  try {
    const res = await fetch("https://api.weather.gov/alerts/active?area=OK");
    const data = await res.json();

    let matched = [];

    data.features.forEach(alert => {
      const geom = alert.geometry;
      if (!geom) return;

      const checkPolygon = poly =>
        pointInPolygon(userLocation.lat, userLocation.lon, poly);

      if (geom.type === "Polygon") {
        const poly = geom.coordinates[0].map(
          ([lon, lat]) => [lat, lon]
        );
        if (checkPolygon(poly)) matched.push(alert);
      }

      if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach(polygonSet => {
          const poly = polygonSet[0].map(
            ([lon, lat]) => [lat, lon]
          );
          if (checkPolygon(poly)) matched.push(alert);
        });
      }
    });

    if (matched.length === 0) {
      alertsDiv.innerHTML =
        "<p>No active watches or warnings for your location.</p>";
      return;
    }

    alertsDiv.innerHTML = "<h2>Alerts For Your Area</h2>";

    matched.forEach(a => {
      const p = a.properties;

      const el = document.createElement("div");
      el.style.border = "2px solid #cc0000";
      el.style.padding = "12px";
      el.style.margin = "12px 0";
      el.style.borderRadius = "8px";

      el.innerHTML = `
        <strong>${p.event}</strong><br>
        <small>${p.areaDesc}<

