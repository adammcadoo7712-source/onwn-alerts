/********************************************************
 * FIREBASE CONFIG + INIT (MUST BE AT TOP)
 ********************************************************/

const firebaseConfig = {
  apiKey: "AIzaSyBbZvjahyUjZ1g6Vk3q95J9sehhyDvzALE",
  authDomain: "onwn-weather-alerts.firebaseapp.com",
  projectId: "onwn-weather-alerts",
  storageBucket: "onwn-weather-alerts.firebasestorage.app",
  messagingSenderId: "114204669848",
  appId: "1:114204669848:web:950f8d25a25b65da419ded"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

/********************************************************
 * GLOBAL STATE
 ********************************************************/

let userLocation = null;
let alertsEnabled = false;
let alertTimer = null;

/********************************************************
 * APP STARTUP
 ********************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("enableAlerts");
  const status = document.getElementById("status");
  const alertsDiv = document.getElementById("alerts");

  alertsEnabled = localStorage.getItem("alertsEnabled") === "true";

  if (alertsEnabled) {
    status.textContent = "Weather alerts are enabled ✔️";
    initAlerts();
  } else {
    alertsDiv.innerHTML = "<p>Enable alerts to monitor your location.</p>";
  }

  button.addEventListener("click", enableAlerts);
});

/********************************************************
 * ENABLE ALERTS (ONE TIME)
 ********************************************************/

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

      alertsEnabled = true;
      localStorage.setItem("alertsEnabled", "true");

      status.textContent = "Weather alerts enabled ✔️";

      // REGISTER PUSH
      registerServiceWorkerAndGetToken();

      // START CHECKING
      initAlerts();
    },
    () => {
      status.textContent = "Location permission denied.";
    }
  );
}

/********************************************************
