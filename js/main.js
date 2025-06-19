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

// Load prayers into profile.html
if (document.getElementById("prayers-list")) {
  fetch("backend/get_prayers.php")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("prayers-list");

      data.forEach(prayer => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${prayer.reason}</strong>: ${prayer.message}
          <em> (${prayer.created})</em>
          ${prayer.file_name ? `
            <div class="offering-tools">
              <a href="uploads/${prayer.file_name}" target="_blank">🗎 View Offering</a>

              <form action="backend/delete_offering.php" method="POST" class="delete-form">
                <input type="hidden" name="prayer_id" value="${prayer.id}">
                <button type="submit">🗑️ Delete</button>
              </form>

              <form action="backend/replace_offering.php" method="POST" enctype="multipart/form-data" class="replace-form">
                <input type="hidden" name="prayer_id" value="${prayer.id}">
                <label>
                  <input type="file" name="new_offering" accept=".doc,.docx,.bmp,.ppt,.pptx,.xls,.xlsx,.txt" required>
                </label>
                <button type="submit">↻ Replace</button>
              </form>
            </div>
          ` : ''}
        `;
        list.appendChild(li);
      });
    });
}

