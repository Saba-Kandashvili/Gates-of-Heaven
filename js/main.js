$(function () {
  // Load header and footer placeholders
  $("#header-placeholder").load("partials/header.html", function() {
    // This code runs *after* the header has been loaded
    checkUserSession();

    // NEW: Dropdown Menu Logic
    const profileButton = $('#profile-menu-button');
    const dropdown = $('#profile-dropdown');

    profileButton.on('click', function(event) {
      event.stopPropagation(); // Prevents the click from closing the menu immediately
      dropdown.toggleClass('active');
    });

    // Close dropdown if clicking outside of it
    $(document).on('click', function() {
      if (dropdown.hasClass('active')) {
        dropdown.removeClass('active');
      }
    });
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
  // This function now shows/hides the correct auth blocks in the header
  $.get("backend/check_session.php", function(session) {
    if (session.loggedIn) {
      // User is logged in: show profile area, hide login/join
      $('#nav-auth-logged-out').hide();
      $('#nav-auth-logged-in').show();
    } else {
      // User is logged out: show login/join, hide profile area
      $('#nav-auth-logged-out').show();
      $('#nav-auth-logged-in').hide();
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
        // Create a mica window for the "no prayers" message for consistency
        list.innerHTML = `
          <li class="mica-window prayer-item">
            <p>You have not yet submitted any prayers. Go to the <a href="pray.html">Pray</a> page to send your first message to the Cloud™.</p>
          </li>`;
        return;
      }

      data.forEach(prayer => {
        const li = document.createElement("li");
        // Each list item is now a self-contained "Mica" window
        li.className = 'mica-window prayer-item';

        // Sanitize the user-provided message to prevent XSS
        const messageDiv = document.createElement('div');
        messageDiv.innerText = prayer.message;
        const sanitizedMessage = messageDiv.innerHTML;

        // Conditional HTML for the offering bar
        const offeringHTML = prayer.file_name ? `
          <div class="offering-bar">
            <div class="offering-info">
              <span class="file-icon">📄</span>
              <span class="file-name" title="${prayer.file_name}">${prayer.file_name}</span>
            </div>
            <div class="offering-actions">
              <!-- Replace Form: The label acts as the button -->
              <form action="backend/replace_offering.php" method="POST" enctype="multipart/form-data" class="replace-form" title="Replace Offering">
                <input type="hidden" name="prayer_id" value="${prayer.id}">
                <label class="btn-action">
                  🔄
                  <input type="file" name="new_offering" onchange="this.form.submit()" accept=".doc,.docx,.bmp,.ppt,.pptx,.xls,.xlsx,.txt" required>
                </label>
              </form>
              <!-- Delete Form -->
              <form action="backend/delete_offering.php" method="POST" class="delete-form" onsubmit="return confirm('Are you sure you want to delete this offering?');" title="Delete Offering">
                <input type="hidden" name="prayer_id" value="${prayer.id}">
                <button type="submit" class="btn-action">🗑️</button>
              </form>
            </div>
          </div>
        ` : `
          <div class="offering-bar no-offering">
            <em>No offering was made with this prayer.</em>
          </div>
        `;

        li.innerHTML = `
          <h3>${prayer.reason}</h3>
          <div class="prayer-message">${sanitizedMessage}</div>
          ${offeringHTML}
          <div class="prayer-meta">
            Prayed on: ${new Date(prayer.created).toLocaleString()}
          </div>
        `;

        list.appendChild(li);
      });
    });
}