$(function () {
  $("body").prepend('<div id="header-placeholder"></div>');
  $("body").append('<div id="footer-placeholder"></div>');

  $("#header-placeholder").load("partials/header.html");
  $("#footer-placeholder").load("partials/footer.html");
});

document.addEventListener("DOMContentLoaded", function () {
  const map = L.map('map').setView([41.7166, 44.7831], 12); // Tbilisi center

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const temples = [
    {
      lat: 41.7016,
      lng: 44.8015,
      name: "Rustaveli Temple of Clippy",
    },
    {
      lat: 41.7245,
      lng: 44.7396,
      name: "Holy Shrine of Vaja-Pshavela",
    },
    {
      lat: 41.7754,
      lng: 44.7967,
      name: "Akhmeteli Alt+F4 Monastery",
    },
    {
      lat: 41.6922,
      lng: 44.8732,
      name: "Varketili Volume Up Chapel",
    },
    {
      lat: 41.6830,
      lng: 44.7006,
      name: "Tskneti .EXE Cathedral",
    },
  ];

  temples.forEach(loc => {
    L.marker([loc.lat, loc.lng])
      .addTo(map)
      .bindPopup(`<b>${loc.name}</b><br/>Praise be to Gates.`);
  });
});
