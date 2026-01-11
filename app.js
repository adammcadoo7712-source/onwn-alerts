/********************
 * FIREBASE INIT
 ********************/
firebase.initializeApp({
  apiKey: "AIzaSyBbZvjahyUjZ1g6Vk3q95J9sehhyDvzALE",
  authDomain: "onwn-weather-alerts.firebaseapp.com",
  projectId: "onwn-weather-alerts",
  storageBucket: "onwn-weather-alerts.firebasestorage.app",
  messagingSenderId: "114204669848",
  appId: "1:114204669848:web:950f8d25a25b65da419ded"
});

const messaging = firebase.messaging();

let userLocation = null;

/********************
 * STARTUP
 ********************/
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("enableAlerts").onclick = enableAlerts;
});

/********************
 * ENABLE ALERTS
 ********************/
async function enableAlerts() {
  const status = document.getElementById("status");

  if (Notification.permission !== "granted") {
    await Notification.requestPermission();
  }

  navigator.geolocation.getCurrentPosition(async pos => {
    userLocation = {
      lat: pos.coords.latitude,
      lon: pos.coords.longitude
    };

    const reg = await navigator.serviceWorker.register(
      "/onwn-alerts/firebase-messaging-sw.js"
    );

    const token = await messaging.getToken({
      vapidKey: "BOwbt-S34F3TT2FAMqzuKsbrLmkGRODR0Xieowkl32ejwi-guV7H5hui6BN9rH9P_sNrzpNUCk9dcCo_XbWuzko",
      serviceWorkerRegistration: reg
    });

    console.log("FCM TOKEN:", token);
    status.textContent = "Push alerts enabled ✔️";

    loadAlerts();
  });
}

/********************
 * POLYGON ALERTS
 ********************/
async function loadAlerts() {
  const alertsDiv = document.getElementById("alerts");
  alertsDiv.innerHTML = "<p>Checking alerts…</p>";

  const res = await fetch("https://api.weather.gov/alerts/active?area=OK");
  const data = await res.json();

  data.features.forEach(a => {
    const el = document.createElement("div");
    el.innerHTML = `<strong>${a.properties.event}</strong><br>${a.properties.areaDesc}`;
    alertsDiv.appendChild(el);
  });
}
