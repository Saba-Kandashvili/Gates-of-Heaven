$(function () {
  // replace the placehodlers with actual headers
  $("#header-placeholder").load("partials/header.html", function() {
    checkUserSession();

    const profileButton = $('#profile-menu-button');
    const dropdown = $('#profile-dropdown');

    profileButton.on('click', function(event) {
      event.stopPropagation();
      dropdown.toggleClass('active');
    });

    // close drowpdown if clicked elsewhere
    $(document).on('click', function() {
      if (dropdown.hasClass('active')) {
        dropdown.removeClass('active');
      }
    });
  });

  $("#footer-placeholder").load("partials/footer.html");

  displayFormErrors(); 

  
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  if (status) {
      const statusDiv = $('#upload-status');
      let message = '';
      let messageClass = '';
      switch (status) {
          case 'success':
              message = 'The Word™ has been updated successfully.';
              messageClass = 'status-success';
              break;
          case 'invalid_type':
              message = 'Error: Only .txt files are permitted by The Architect.';
              messageClass = 'status-error';
              break;
          case 'upload_error':
          case 'move_failed':
          case 'no_file':
              message = 'Error: The sacred text could not be processed. Please try again.';
              messageClass = 'status-error';
              break;
      }
      if (message && statusDiv.length) {
          statusDiv.text(message).addClass(messageClass).show();
          setTimeout(() => { statusDiv.fadeOut(); }, 5000);
      }
  }

  const currentPage = window.location.pathname.split("/").pop();

  if (currentPage === 'index.html' || currentPage === 'about.html' || currentPage === 'login.html' || currentPage === 'join.html' || currentPage === 'scripture.html' || currentPage === '') {
    $('body').css('visibility', 'visible');
  }

  // require login
  if (currentPage === 'profile.html' || currentPage === 'pray.html') {
    requireLogin();
  }

  if (document.getElementById('map')) {
    initializeMap();
  }

  if (document.getElementById("prayers-list")) {
    loadPrayers();
  }

  if (document.getElementById("scripture-content")) {
    fetch("backend/get_scripture.php")
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
  // show/hide login and that kind of stuff
  $.get("backend/check_session.php", function(session) {
    if (session.loggedIn) {
      
      $('#nav-auth-logged-out').hide();
      $('#nav-auth-logged-in').show();
      $('#upload-scripture-section').show();
    } else {
      $('#nav-auth-logged-out').show();
      $('#nav-auth-logged-in').hide();
    }
  });
}

function requireLogin() {
  // must be logged in to use some pages like the pray page
  $.get("backend/check_session.php", function(session) {
    if (session.loggedIn) {
      $('body').css('visibility', 'visible');
    } else {
      window.location.href = 'login.html';
    }
  });
}

function initializeMap() {
    const map = L.map('map').setView([41.7166, 44.7831], 12); // tbilisi centre point so the map starts centered on tbilisi
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
      list.innerHTML = ''; 

      if (data.length === 0) {
        list.innerHTML = `
          <li class="mica-window prayer-item">
            <p>You have not yet submitted any prayers. Go to the <a href="pray.html">Pray</a> page to send your first message to the Cloud™.</p>
          </li>`;
        return;
      }

      data.forEach(prayer => {
        const li = document.createElement("li");
        li.className = 'mica-window prayer-item';

        const messageDiv = document.createElement('div');
        messageDiv.innerText = prayer.message;
        const sanitizedMessage = messageDiv.innerHTML;

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


function displayFormErrors() {
  const errorDiv = $('#form-error');
  if (errorDiv.length) { 
    $.get("backend/get_error.php", function(errorMessage) {
      if (errorMessage.trim() !== '') {
        errorDiv.text(errorMessage).show();
      }
    });
  }
}