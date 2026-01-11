document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("enableAlerts");
  const status = document.getElementById("status");
  const alertsDiv = document.getElementById("alerts");

  // Enable alerts button (existing behavior)
  button.addEventListener("click", async () => {
    status.textContent = "Requesting permissions…";

    navigator.geolocation.getCurrentPosition(
      async () => {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          status.textContent = "Weather alerts enabled ✔️";
        } else {
          status.textContent = "Notifications blocked.";
        }
      },
      () => {
        status.textContent = "Location permission denied.";
      }
    );
  });

  // Fetch active NWS alerts
  fetchActiveAlerts();
});

async function fetchActiveAlerts() {
  const alertsDiv = document.getElementById("alerts");

  try {
    const response = await fetch(
      "https://api.weather.gov/alerts/active"
    );

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      alertsDiv.innerHTML = "<p>No active alerts.</p>";
      return;
    }

    alertsDiv.innerHTML = "<h2>Active Alerts</h2>";

    data.features.slice(0, 5).forEach(alert => {
      const props = alert.properties;

      const alertEl = document.createElement("div");
      alertEl.style.border = "1px solid #cc0000";
      alertEl.style.margin = "12px 0";
      alertEl.style.padding = "12px";

      alertEl.innerHTML = `
        <strong>${props.event}</strong><br>
        <small>${props.areaDesc}</small>
      `;

      alertsDiv.appendChild(alertEl);
    });

  } catch (err) {
    alertsDiv.innerHTML = "<p>Error loading alerts.</p>";
    console.error(err);
  }
}

