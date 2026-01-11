importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBbZvjahyUjZ1g6Vk3q95J9sehhyDvzALE",
  authDomain: "onwn-weather-alerts.firebaseapp.com",
  projectId: "onwn-weather-alerts",
  storageBucket: "onwn-weather-alerts.firebasestorage.app",
  messagingSenderId: "114204669848",
  appId: "1:114204669848:web:950f8d25a25b65da419ded"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/onwn-alerts/onwn-logo.png"
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
