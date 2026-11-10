// ---------------------------------------
// LibrarySeat Guardian
// ---------------------------------------

const starterReservations = [
  {
    id: 101,
    name: "Aarav Sharma",
    roll: "102401",
    floor: "First Floor",
    seat: "A-12",
    belongings: "Books, notebook, water bottle",
    duration: 45,
    start: Date.now() - 10 * 60000,
    end: Date.now() + 35 * 60000,
    status: "active",
    userCreated: false
  },
  {
    id: 102,
    name: "Meera Kapoor",
    roll: "102402",
    floor: "Second Floor",
    seat: "B-08",
    belongings: "Laptop bag, notebook",
    duration: 45,
    start: Date.now() - 42 * 60000,
    end: Date.now() + 3 * 60000,
    status: "active",
    userCreated: false
  },
  {
    id: 103,
    name: "Rohan Verma",
    roll: "102403",
    floor: "Ground Floor",
    seat: "G-15",
    belongings: "Books and headphones",
    duration: 60,
    start: Date.now() - 75 * 60000,
    end: Date.now() - 15 * 60000,
    status: "active",
    userCreated: false
  }
];

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

let reservations = loadData("lg_reservations", starterReservations);
let activities = loadData("lg_activities", [
  {
    id: 1,
    message: "Sample reservation registered at First Floor, Seat A-12.",
    time: Date.now() - 10 * 60000
  },
  {
    id: 2,
    message: "Sample reservation registered at Second Floor, Seat B-08.",
    time: Date.now() - 42 * 60000
  }
]);

let currentView = "dashboard";
let pendingReleaseId = null;
let notifiedIds = loadData("lg_notified", []);

function saveData() {
  localStorage.setItem("lg_reservations", JSON.stringify(reservations));
  localStorage.setItem("lg_activities", JSON.stringify(activities));
  localStorage.setItem("lg_notified", JSON.stringify(notifiedIds));
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function addActivity(message) {
  activities.unshift({
    id: Date.now() + Math.random(),
    message,
    time: Date.now()
  });

  activities = activities.slice(0, 100);
  saveData();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatTime(milliseconds) {
  if (milliseconds <= 0) return "00:00";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ---------------------------------------
// Status calculations
// ---------------------------------------

function getStatus(reservation) {
  if (reservation.status === "released") return "released";

  const remaining = reservation.end - Date.now();

  if (remaining <= 0) return "overdue";
  if (remaining <= 5 * 60000) return "due";

  return "active";
}

function getStatusLabel(status) {
  const labels = {
    active: "Active",
    due: "Reminder due",
    overdue: "Overdue",
    released: "Released"
  };

  return labels[status] || status;
}

function getStatusClass(status) {
  return `status status-${status}`;
}

function getRemainingText(reservation) {
  const status = getStatus(reservation);

  if (status === "released") return "Seat released";
  if (status === "overdue") {
    return `Overdue by ${formatTime(Date.now() - reservation.end)}`;
  }

  return `${formatTime(reservation.end - Date.now())} remaining`;
}

// ---------------------------------------
// Clock
// ---------------------------------------

function updateClock() {
  const now = new Date();

  document.getElementById("clock").textContent =
    now.toLocaleTimeString("en-IN", { hour12: false });

  document.getElementById("clockDate").textContent =
    now.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
}

// ---------------------------------------
// Dashboard stats
// ---------------------------------------

function updateStats() {
  const total = reservations.length;
  const active = reservations.filter(r => getStatus(r) === "active").length;
  const due = reservations.filter(r => getStatus(r) === "due").length;
  const overdue = reservations.filter(r => getStatus(r) === "overdue").length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("activeCount").textContent = active;
  document.getElementById("dueCount").textContent = due;
  document.getElementById("overdueCount").textContent = overdue;
}

// ---------------------------------------
// Reservation cards
// ---------------------------------------

function reservationCard(reservation, showActions = true) {
  const status = getStatus(reservation);

  return `
    <article class="reservation-item">
      <div class="seat-icon">▦</div>

      <div class="reservation-main">
        <strong>${escapeHTML(reservation.floor)} · Seat ${escapeHTML(reservation.seat)}</strong>
        <small>${escapeHTML(reservation.name)} · ${escapeHTML(reservation.roll)}</small>
        <small>${escapeHTML(reservation.belongings)}</small>
      </div>

      <div class="reservation-side">
        <span class="${getStatusClass(status)}">${getStatusLabel(status)}</span>
        <span class="time-left">${getRemainingText(reservation)}</span>
      </div>

      ${showActions ? `
        <div class="item-actions">
          <button class="small-btn" data-details="${reservation.id}">Details</button>
          ${status !== "released" ? `
            <button class="small-btn danger" data-release="${reservation.id}">Release</button>
          ` : ""}
        </div>
      ` : ""}
    </article>
  `;
}

function showEmpty(message) {
  return `
    <div class="empty-state">
      <span>▦</span>
      <strong>${escapeHTML(message)}</strong>
      <p>There is nothing to show here right now.</p>
    </div>
  `;
}

function bindReservationButtons(container) {
  container.querySelectorAll("[data-details]").forEach(button => {
    button.addEventListener("click", () => {
      showDetails(Number(button.dataset.details));
    });
  });

  container.querySelectorAll("[data-release]").forEach(button => {
    button.addEventListener("click", () => {
      askRelease(Number(button.dataset.release));
    });
  });
}

// ---------------------------------------
// Dashboard
// ---------------------------------------

function renderDashboard() {
  const recent = [...reservations]
    .sort((a, b) => b.start - a.start)
    .slice(0, 3);

  const recentContainer = document.getElementById("recentReservations");

  recentContainer.innerHTML = recent.length
    ? recent.map(r => reservationCard(r)).join("")
    : showEmpty("No reservations yet");

  bindReservationButtons(recentContainer);

  renderActivities("recentActivity", 3);
}

// ---------------------------------------
// My reservations
// ---------------------------------------

function renderReservations() {
  const container = document.getElementById("allReservations");
  const query = document.getElementById("reservationSearch").value.toLowerCase();
  const filter = document.getElementById("reservationFilter").value;

  const filtered = reservations.filter(r => {
    const matchesSearch =
      `${r.seat} ${r.floor} ${r.name} ${r.roll}`.toLowerCase().includes(query);

    const matchesStatus = filter === "all" || getStatus(r) === filter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => b.start - a.start);

  container.innerHTML = filtered.length
    ? filtered.map(r => reservationCard(r)).join("")
    : showEmpty("No matching reservations");

  bindReservationButtons(container);
}

// ---------------------------------------
// Librarian panel
// ---------------------------------------

function renderLibrarian() {
  const container = document.getElementById("librarianReservations");
  const query = document.getElementById("librarianSearch").value.toLowerCase();
  const filter = document.getElementById("librarianFilter").value;

  const filtered = reservations.filter(r => {
    const matchesSearch =
      `${r.name} ${r.roll} ${r.seat} ${r.floor} ${r.belongings}`
        .toLowerCase().includes(query);

    const matchesStatus = filter === "all" || getStatus(r) === filter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => b.start - a.start);

  container.innerHTML = filtered.length
    ? filtered.map(r => `
      <article class="reservation-item">
        <div class="seat-icon">▤</div>

        <div class="reservation-main">
          <strong>${escapeHTML(r.name)} · Seat ${escapeHTML(r.seat)}</strong>
          <small>${escapeHTML(r.roll)} · ${escapeHTML(r.floor)}</small>
          <small>Belongings: ${escapeHTML(r.belongings)}</small>
        </div>

        <div class="reservation-side">
          <span class="${getStatusClass(getStatus(r))}">
            ${getStatusLabel(getStatus(r))}
          </span>
          <span class="time-left">${getRemainingText(r)}</span>
        </div>

        <div class="item-actions">
          <button class="small-btn" data-details="${r.id}">Details</button>
          ${r.status !== "released" ? `
            <button class="small-btn danger" data-collected="${r.id}">
              Collected
            </button>
          ` : ""}
        </div>
      </article>
    `).join("")
    : showEmpty("No matching registrations");

  bindReservationButtons(container);

  container.querySelectorAll("[data-collected]").forEach(button => {
    button.addEventListener("click", () => {
      markCollected(Number(button.dataset.collected));
    });
  });
}

// ---------------------------------------
// Activity log
// ---------------------------------------

function renderActivities(containerId, limit = Infinity) {
  const container = document.getElementById(containerId);
  const list = activities.slice(0, limit);

  container.innerHTML = list.length
    ? list.map(item => `
      <div class="activity-item">
        <span class="activity-dot"></span>
        <div>
          <p>${escapeHTML(item.message)}</p>
          <small>${formatDate(item.time)}</small>
        </div>
      </div>
    `).join("")
    : showEmpty("No activity recorded yet");
}

function renderActivityPage() {
  renderActivities("allActivity");
}

// ---------------------------------------
// Details modal
// ---------------------------------------

function showDetails(id) {
  const r = reservations.find(item => item.id === id);
  if (!r) return;

  const status = getStatus(r);

  document.getElementById("detailsTitle").textContent =
    `Seat ${r.seat}`;

  document.getElementById("detailsContent").innerHTML = `
    <div class="detail-status">
      <span class="${getStatusClass(status)}">${getStatusLabel(status)}</span>
    </div>

    <div class="detail-info"><span>Student name</span><strong>${escapeHTML(r.name)}</strong></div>
    <div class="detail-info"><span>Roll number</span><strong>${escapeHTML(r.roll)}</strong></div>
    <div class="detail-info"><span>Library floor</span><strong>${escapeHTML(r.floor)}</strong></div>
    <div class="detail-info"><span>Seat number</span><strong>${escapeHTML(r.seat)}</strong></div>
    <div class="detail-info"><span>Belongings</span><strong>${escapeHTML(r.belongings)}</strong></div>
    <div class="detail-info"><span>Reminder duration</span><strong>${r.duration} minutes</strong></div>
    <div class="detail-info"><span>Registered at</span><strong>${formatDate(r.start)}</strong></div>
    <div class="detail-info"><span>Reminder ends</span><strong>${formatDate(r.end)}</strong></div>
    <div class="detail-info"><span>Time status</span><strong>${getRemainingText(r)}</strong></div>
  `;

  openModal("detailsModal");
}

// ---------------------------------------
// Register seat
// ---------------------------------------

function registerSeat(event) {
  event.preventDefault();

  const form = new FormData(event.target);

  const name = form.get("name").trim();
  const roll = form.get("roll").trim();
  const floor = form.get("floor");
  const seat = form.get("seat").trim().toUpperCase();
  const belongings = form.get("belongings").trim();
  const duration = Number(form.get("duration"));

  if (!name || !roll || !floor || !seat || !belongings) {
    showToast("Please complete all fields.");
    return;
  }

  const alreadyOccupied = reservations.some(r =>
    r.floor === floor &&
    r.seat.toLowerCase() === seat.toLowerCase() &&
    getStatus(r) !== "released"
  );

  if (alreadyOccupied) {
    showToast("This seat is already registered!");
    return;
  }

  const now = Date.now();

  const reservation = {
    id: Date.now(),
    name,
    roll,
    floor,
    seat,
    belongings,
    duration,
    start: now,
    end: now + duration * 60000,
    status: "active",
    userCreated: true
  };

  reservations.unshift(reservation);

  addActivity(`${name} registered ${floor}, Seat ${seat}.`);

  saveData();

  event.target.reset();
  showToast("Seat registered successfully! ✨");

  switchView("reservations");
}

// ---------------------------------------
// Release reservation
// ---------------------------------------

function askRelease(id) {
  pendingReleaseId = id;
  openModal("confirmModal");
}

function releaseSeat(id, byLibrarian = false) {
  const reservation = reservations.find(r => r.id === id);

  if (!reservation || reservation.status === "released") return;

  reservation.status = "released";
  reservation.releasedAt = Date.now();

  const action = byLibrarian
    ? "marked belongings as collected for"
    : "released";

  addActivity(`${byLibrarian ? "Librarian" : reservation.name} ${action} Seat ${reservation.seat}.`);

  saveData();
  renderAll();

  showToast(byLibrarian
    ? "Belongings marked as collected."
    : "Seat released successfully.");
}

function markCollected(id) {
  releaseSeat(id, true);
}

document.getElementById("confirmRelease").addEventListener("click", () => {
  if (pendingReleaseId !== null) {
    releaseSeat(pendingReleaseId);
  }

  pendingReleaseId = null;
  closeModal("confirmModal");
});

// ---------------------------------------
// Navigation
// ---------------------------------------

const viewDetails = {
  dashboard: {
    title: 'Your space. <span>Your focus.</span>',
    subtitle: "Keep track of your seat, belongings and study time.",
    section: "Seat overview",
    eyebrow: "YOUR LIBRARY SPACE"
  },

  reservations: {
    title: 'Your reservations. <span>One place.</span>',
    subtitle: "Track your registered seats and remaining time.",
    section: "My reservations",
    eyebrow: "YOUR REGISTERED SEATS"
  },

  register: {
    title: 'Claim your <span>study space.</span>',
    subtitle: "Register a seat and keep track of your belongings.",
    section: "Register a seat",
    eyebrow: "NEW RESERVATION"
  },

  librarian: {
    title: 'Library <span>management.</span>',
    subtitle: "Monitor registrations and manage collected belongings.",
    section: "Librarian panel",
    eyebrow: "STAFF MANAGEMENT"
  },

  activity: {
    title: 'Everything <span>in one timeline.</span>',
    subtitle: "Review recent registrations, reminders and releases.",
    section: "Activity history",
    eyebrow: "SYSTEM ACTIVITY"
  }
};

function switchView(view) {
  currentView = view;

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  const details = viewDetails[view];

  document.getElementById("pageTitle").innerHTML = details.title;
  document.getElementById("pageSubtitle").textContent = details.subtitle;
  document.getElementById("sectionTitle").textContent = details.section;
  document.getElementById("sectionEyebrow").textContent = details.eyebrow;

  document.getElementById("breadcrumbName").textContent =
    view === "dashboard" ? "Overview" :
    view === "reservations" ? "My Reservations" :
    view === "register" ? "Register a Seat" :
    view === "librarian" ? "Librarian Panel" :
    "Activity Log";

  const views = [
    "dashboard",
    "reservations",
    "register",
    "librarian",
    "activity"
  ];

  views.forEach(name => {
    document.getElementById(`${name}View`).classList.toggle(
      "hidden",
      name !== view
    );
  });

  const action = document.getElementById("mainAction");

  action.textContent = view === "register"
    ? "Registration form"
    : "＋ Register seat";

  action.style.visibility = view === "register" ? "hidden" : "visible";

  action.onclick = () => switchView("register");

  renderAll();
}

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => switchView(button.dataset.go));
});

// ---------------------------------------
// Buttons and forms
// ---------------------------------------

document.getElementById("sidebarRegister").addEventListener("click", () => {
  switchView("register");
});

document.getElementById("headerRegister").addEventListener("click", () => {
  switchView("register");
});

document.getElementById("bannerRegister").addEventListener("click", () => {
  switchView("register");
});

document.getElementById("registerForm").addEventListener("submit", registerSeat);

document.getElementById("reservationSearch").addEventListener("input", renderReservations);
document.getElementById("reservationFilter").addEventListener("change", renderReservations);

document.getElementById("librarianSearch").addEventListener("input", renderLibrarian);
document.getElementById("librarianFilter").addEventListener("change", renderLibrarian);

// ---------------------------------------
// Modals
// ---------------------------------------

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });
});

document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      overlay.classList.add("hidden");
    }
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-overlay").forEach(modal => {
      modal.classList.add("hidden");
    });
  }
});

// ---------------------------------------
// Reminder alerts and countdowns
// ---------------------------------------

function checkReminders() {
  reservations.forEach(r => {
    const status = getStatus(r);

    if (status === "due" && !notifiedIds.includes(`${r.id}-due`)) {
      notifiedIds.push(`${r.id}-due`);
      addActivity(`Reminder due for ${r.name}, Seat ${r.seat}.`);
      showToast(`Reminder: Seat ${r.seat} time is almost up!`);
    }

    if (status === "overdue" && !notifiedIds.includes(`${r.id}-overdue`)) {
      notifiedIds.push(`${r.id}-overdue`);
      addActivity(`Reservation overdue for ${r.name}, Seat ${r.seat}.`);
      showToast(`Seat ${r.seat} is now overdue!`);
    }
  });

  saveData();
}

function renderAll() {
  updateStats();

  if (currentView === "dashboard") renderDashboard();
  if (currentView === "reservations") renderReservations();
  if (currentView === "librarian") renderLibrarian();
  if (currentView === "activity") renderActivityPage();
}

function tick() {
  updateClock();
  checkReminders();
  renderAll();
}

// ---------------------------------------
// Initialisation
// ---------------------------------------

updateClock();
renderAll();
switchView("dashboard");

// Update timers and statuses every second.
setInterval(tick, 1000);