$(function () {
  // Load header and footer placeholders
  $("#header-placeholder").load("partials/header.html", function() {
    // This code runs *after* the header has been loaded
    checkUserSession();
  });
  $("#footer-placeholder").load("partials/footer.html");

  // --- Page Specific Logic ---
  const currentPage = window.location.pathname.split("/").pop();

  // For pages that are PUBLIC
  if (currentPage === 'index.html' || currentPage === 'about.html' || currentPage === 'login.html' || currentPage === 'join.html' || currentPage === 'scripture.html' || currentPage === '') {
    // For public pages, we can show the body immediately.
    // The checkUserSession will still run to update the nav.
    $('body').css('visibility', 'visible');
  }

  // For pages that require a user to be logged in
  if (currentPage === 'profile.html' || currentPage === 'pray.html') {
    requireLogin();
  }

  // Leaflet Map for About page
  if (document.getElementById('map')) {
    initializeMap();
  }

  // Prayer list for Profile page
  if (document.getElementById("prayers-list")) {
    loadPrayers();
  }

  // Scriptures for scripture.html page
  if (document.getElementById("scripture-content")) {
    //  ***** THE FIX IS ON THE NEXT LINE *****
    fetch("backend/get_scripture.php") // Changed "get_scriptures.php" to "get_scripture.php"
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(text => {
        document.getElementById("scripture-content").textContent = text;
      })
      .catch(error => {
        console.error('Error fetching scriptures:', error);
        document.getElementById("scripture-content").textContent = 'Failed to load the sacred texts. (Check console for details)';
      });
  }
});

function checkUserSession() {
  // This function just updates the nav bar
  $.get("backend/check_session.php", function(session) {
    if (session.loggedIn) {
      $('#nav-join').text('Profile').attr('href', 'profile.html');
      $('#nav-login').html('Logout').attr('href', 'backend/logout.php');
    }
  });
}

function requireLogin() {
  // This function enforces the login and redirects if necessary
  $.get("backend/check_session.php", function(session) {
    if (session.loggedIn) {
      // If user is logged in, make the page visible
      $('body').css('visibility', 'visible');
    } else {
      // If not logged in, redirect to the login page.
      // The body of pray.html will never become visible.
      window.location.href = 'login.html';
    }
  });
}

function initializeMap() {
    const map = L.map('map').setView([41.7166, 44.7831], 12); // Tbilisi center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const temples = [
      { lat: 41.7016, lng: 44.8015, name: "Rustaveli Temple of Clippy" },
      { lat: 41.7245, lng: 44.7396, name: "Holy Shrine of Vaja-Pshavela" },
      { lat: 41.7754, lng: 44.7967, name: "Akhmeteli Alt+F4 Monastery" },
      { lat: 41.6922, lng: 44.8732, name: "Varketili Volume Up Chapel" },
      { lat: 41.6830, lng: 44.7006, name: "Tskneti .EXE Cathedral" },
    ];

    temples.forEach(loc => {
      L.marker([loc.lat, loc.lng])
        .addTo(map)
        .bindPopup(`<b>${loc.name}</b><br/>Praise be to Gates.`);
    });
}

function loadPrayers() {
  fetch("backend/get_prayers.php")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("prayers-list");
      if (!list) return;
      list.innerHTML = ''; // Clear existing list

      if (data.length === 0) {
        list.innerHTML = '<li>You have not yet submitted any prayers.</li>';
        return;
      }

      data.forEach(prayer => {
        const li = document.createElement("li");
        // Using innerText for user-generated content is safer against XSS
        const messageNode = document.createElement('p');
        messageNode.innerText = prayer.message;

        li.innerHTML = `
          <strong>${prayer.reason}</strong>
          <p>${messageNode.innerHTML}</p>
          <em>(${new Date(prayer.created).toLocaleString()})</em>
          ${prayer.file_name ? `
            <div class="offering-tools">
              <a href="uploads/${prayer.file_name}" target="_blank">📄 View Offering</a>

              <form action="backend/delete_offering.php" method="POST" class="delete-form" onsubmit="return confirm('Are you sure you want to delete this offering?');">
                <input type="hidden" name="prayer_id" value="${prayer.id}">
                <button type="submit">🗑️ Delete</button>
              </form>

              <form action="backend/replace_offering.php" method="POST" enctype="multipart/form-data" class="replace-form">
                <input type="hidden" name="prayer_id" value="${prayer.id}">
                <label>
                  <input type="file" name="new_offering" accept=".doc,.docx,.bmp,.ppt,.pptx,.xls,.xlsx,.txt" required>
                </label>
                <button type="submit">🔃 Replace</button>
              </form>
            </div>
          ` : `
            <div class="offering-tools">
                <em>No offering was made with this prayer.</em>
            </div>
          `}
        `;
        list.appendChild(li);
      });
    });
}