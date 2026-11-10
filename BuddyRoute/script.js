// BUDDYROUTE — Frontend-only campus outing coordination demo

const sampleTrips = [
  {
    id: 1,
    destination: "Urban Estate Market",
    type: "Shopping",
    mode: "Auto / E-rickshaw",
    date: getFutureDate(1),
    time: "17:30",
    seats: 3,
    meetPoint: "Thapar Main Gate",
    organiser: "Aarav",
    location: "Hostel J",
    phone: "9876543210",
    description: "Going to pick up some hostel essentials. Anyone interested?",
    created: 1
  },
  {
    id: 2,
    destination: "Omaxe Mall",
    type: "Food",
    mode: "Cab",
    date: getFutureDate(2),
    time: "18:00",
    seats: 2,
    meetPoint: "University Gate",
    organiser: "Mehak",
    location: "Hostel H",
    phone: "9876543211",
    description: "Weekend food outing! Looking for a couple of people to join.",
    created: 2
  },
  {
    id: 3,
    destination: "Patiala Railway Station",
    type: "Travel",
    mode: "Auto / E-rickshaw",
    date: getFutureDate(3),
    time: "08:00",
    seats: 2,
    meetPoint: "Main Gate",
    organiser: "Rishabh",
    location: "Hostel C",
    phone: "9876543212",
    description: "Heading to the station in the morning. Shared ride planned.",
    created: 3
  },
  {
    id: 4,
    destination: "Local Pharmacy",
    type: "Errands",
    mode: "Walking",
    date: getFutureDate(1),
    time: "16:00",
    seats: 1,
    meetPoint: "Hostel A Entrance",
    organiser: "Simran",
    location: "Hostel A",
    phone: "9876543213",
    description: "Quick pharmacy run. Anyone needs anything?",
    created: 4
  },
  {
    id: 5,
    destination: "Adalat Bazaar",
    type: "Shopping",
    mode: "Auto / E-rickshaw",
    date: getFutureDate(4),
    time: "15:30",
    seats: 3,
    meetPoint: "University Gate",
    organiser: "Kabir",
    location: "Hostel B",
    phone: "9876543214",
    description: "Exploring the local market and doing some shopping.",
    created: 5
  },
  {
    id: 6,
    destination: "Coffee and Snacks",
    type: "Food",
    mode: "Walking",
    date: getFutureDate(2),
    time: "17:00",
    seats: 2,
    meetPoint: "Library Entrance",
    organiser: "Ishita",
    location: "Hostel G",
    phone: "9876543215",
    description: "Need a break from assignments. Let's grab something!",
    created: 6
  }
];

const typeEmoji = {
  Shopping: "🛍️",
  Food: "🍕",
  Travel: "🚆",
  Errands: "📦",
  Other: "✨"
};

// Helpers

function getFutureDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [...fallback];
  } catch {
    return [...fallback];
  }
}

let trips = loadData("buddyRoute_trips", sampleTrips);
let joinedTrips = loadData("buddyRoute_joined", []);

let activeType = "All";
let searchTerm = "";
let sortMode = "soonest";
let activeTab = "created";

function saveData() {
  localStorage.setItem("buddyRoute_trips", JSON.stringify(trips));
  localStorage.setItem("buddyRoute_joined", JSON.stringify(joinedTrips));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();

  date.setHours(Number(hours), Number(minutes));

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function isUpcoming(trip) {
  const tripDateTime = new Date(`${trip.date}T${trip.time}:00`);
  return tripDateTime.getTime() >= Date.now();
}

// RENDER TRIPS

function renderTrips() {
  const grid = document.getElementById("tripGrid");
  const emptyState = document.getElementById("emptyState");

  let filtered = trips.filter(trip => {
    const matchesType =
      activeType === "All" || trip.type === activeType;

    const searchText =
      `${trip.destination} ${trip.type} ${trip.organiser} ${trip.location} ${trip.meetPoint}`.toLowerCase();

    return matchesType &&
      searchText.includes(searchTerm) &&
      isUpcoming(trip);
  });

  if (sortMode === "newest") {
    filtered.sort((a, b) => b.created - a.created);
  } else {
    filtered.sort((a, b) => {
      return new Date(`${a.date}T${a.time}`) -
        new Date(`${b.date}T${b.time}`);
    });
  }

  const totalOpenSeats = trips
    .filter(isUpcoming)
    .reduce((sum, trip) => sum + Number(trip.seats), 0);

  document.getElementById("tripStat").textContent =
    trips.filter(isUpcoming).length;

  document.getElementById("seatStat").textContent = totalOpenSeats;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  grid.innerHTML = filtered.map(trip => {
    const isJoined = joinedTrips.includes(trip.id);

    return `
      <article class="trip-card">

        <div class="trip-card-top">
          <span class="trip-type-tag">
            ${typeEmoji[trip.type] || "✨"} ${escapeHTML(trip.type)}
          </span>

          <span class="seats-tag">
            ${Number(trip.seats)} seat${Number(trip.seats) === 1 ? "" : "s"} open
          </span>
        </div>

        <h3 class="trip-destination">
          ${escapeHTML(trip.destination)}
        </h3>

        <div class="trip-details">
          <span>📅 <b>${formatDate(trip.date)}</b></span>
          <span>🕒 <b>${formatTime(trip.time)}</b></span>
          <span>🚗 <b>${escapeHTML(trip.mode)}</b></span>
          <span>📍 <b>${escapeHTML(trip.meetPoint)}</b></span>
        </div>

        <div class="trip-organiser">

          <div class="organiser-avatar">
            ${escapeHTML(trip.organiser.charAt(0).toUpperCase())}
          </div>

          <div class="organiser-info">
            <strong>${escapeHTML(trip.organiser)}</strong>
            <small>${escapeHTML(trip.location)}</small>
          </div>

          <button
            class="trip-view-btn"
            onclick="openTripDetails(${Number(trip.id)})"
          >
            ${isJoined ? "Joined ✓" : "View trip →"}
          </button>

        </div>
      </article>
    `;
  }).join("");
}

// CREATE TRIP

document.getElementById("tripForm").addEventListener("submit", event => {
  event.preventDefault();

  const destination =
    document.getElementById("destination").value.trim();

  const type =
    document.getElementById("tripType").value;

  const mode =
    document.getElementById("travelMode").value;

  const date =
    document.getElementById("tripDate").value;

  const time =
    document.getElementById("tripTime").value;

  const seats =
    Number(document.getElementById("tripSeats").value);

  const meetPoint =
    document.getElementById("meetPoint").value.trim();

  const organiser =
    document.getElementById("organiserName").value.trim();

  const location =
    document.getElementById("organiserLocation").value.trim();

  const phone =
    document.getElementById("organiserPhone").value.trim();

  const description =
    document.getElementById("tripDescription").value.trim();

  if (!/^[0-9]{10}$/.test(phone)) {
    showToast("Please enter a valid 10-digit phone number.");
    return;
  }

  if (!Number.isInteger(seats) || seats < 1 || seats > 20) {
    showToast("Please enter between 1 and 20 seats.");
    return;
  }

  const tripDateTime = new Date(`${date}T${time}:00`);

  if (Number.isNaN(tripDateTime.getTime()) || tripDateTime <= new Date()) {
    showToast("Please select a future date and time.");
    return;
  }

  const newTrip = {
    id: Date.now(),
    destination,
    type,
    mode,
    date,
    time,
    seats,
    meetPoint,
    organiser,
    location,
    phone,
    description,
    created: Date.now()
  };

  trips.unshift(newTrip);

  saveData();
  renderTrips();
  renderMyTrips();

  event.target.reset();

  closeModal("tripModal");

  showToast("Your outing is now on BuddyRoute! 🎉");

  document.getElementById("explore").scrollIntoView({
    behavior: "smooth"
  });
});

// TRIP DETAILS

function openTripDetails(id) {
  const trip = trips.find(item => Number(item.id) === Number(id));

  if (!trip) {
    showToast("This trip is no longer available.");
    return;
  }

  const alreadyJoined = joinedTrips.includes(trip.id);

  const isOwner = trip.created > 6;

  const isFull = Number(trip.seats) <= 0;

  document.getElementById("detailsContent").innerHTML = `
    <span class="eyebrow">TRIP DETAILS</span>

    <div class="details-hero">
      ${typeEmoji[trip.type] || "🧭"}
    </div>

    <span class="trip-type-tag">
      ${escapeHTML(trip.type)}
    </span>

    <h2>${escapeHTML(trip.destination)}</h2>

    <p class="details-description">
      ${escapeHTML(trip.description || "No additional details provided. Contact the organiser for more information.")}
    </p>

    <div class="details-info">
      <div>
        <span>DATE</span>
        <strong>${formatDate(trip.date)}</strong>
      </div>

      <div>
        <span>TIME</span>
        <strong>${formatTime(trip.time)}</strong>
      </div>

      <div>
        <span>MEET-UP POINT</span>
        <strong>${escapeHTML(trip.meetPoint)}</strong>
      </div>

      <div>
        <span>TRAVEL MODE</span>
        <strong>${escapeHTML(trip.mode)}</strong>
      </div>

      <div>
        <span>ORGANISER</span>
        <strong>${escapeHTML(trip.organiser)}</strong>
      </div>

      <div>
        <span>OPEN SEATS</span>
        <strong>${Number(trip.seats)}</strong>
      </div>
    </div>

    <div class="details-actions">

      ${
        isOwner
          ? `<button class="btn btn-outline" onclick="removeTrip(${Number(trip.id)})">Cancel my trip</button>`
          : alreadyJoined
            ? `<button class="btn btn-outline" onclick="leaveTrip(${Number(trip.id)})">Leave trip</button>`
            : isFull
              ? `<button class="btn btn-outline" disabled>Trip is full</button>`
              : `<button class="btn btn-primary" onclick="joinTrip(${Number(trip.id)})">Request to join →</button>`
      }

      <a class="btn btn-outline"
         href="tel:${encodeURIComponent(trip.phone)}">
         📞 Contact organiser
      </a>

    </div>
  `;

  openModal("detailsModal");
}

// JOIN TRIP

function joinTrip(id) {
  const trip = trips.find(item => Number(item.id) === Number(id));

  if (!trip || !isUpcoming(trip)) {
    showToast("This trip is no longer available.");
    return;
  }

  if (joinedTrips.includes(id)) {
    showToast("You've already joined this trip.");
    return;
  }

  if (Number(trip.seats) <= 0) {
    showToast("Sorry, this trip is full.");
    return;
  }

  joinedTrips.push(id);
  trip.seats = Number(trip.seats) - 1;

  saveData();
  renderTrips();
  renderMyTrips();

  closeModal("detailsModal");

  showToast("You've joined the trip! 🎉");
}

// LEAVE TRIP

function leaveTrip(id) {
  const trip = trips.find(item => Number(item.id) === Number(id));

  if (!trip || !joinedTrips.includes(id)) return;

  joinedTrips = joinedTrips.filter(item => item !== id);
  trip.seats = Number(trip.seats) + 1;

  saveData();
  renderTrips();
  renderMyTrips();

  closeModal("detailsModal");

  showToast("You've left this trip.");
}

// REMOVE CREATED TRIP

function removeTrip(id) {
  const confirmed = confirm("Are you sure you want to cancel this trip?");

  if (!confirmed) return;

  trips = trips.filter(item => Number(item.id) !== Number(id));
  joinedTrips = joinedTrips.filter(item => Number(item) !== Number(id));

  saveData();
  renderTrips();
  renderMyTrips();

  closeModal("detailsModal");

  showToast("Your trip has been cancelled.");
}

// MY TRIPS

function renderMyTrips() {
  const list = document.getElementById("myTripsList");

  const selectedTrips = activeTab === "created"
    ? trips.filter(trip => trip.created > 6)
    : trips.filter(trip => joinedTrips.includes(trip.id));

  if (selectedTrips.length === 0) {
    list.innerHTML = `
      <div class="my-empty">
        ${
          activeTab === "created"
            ? "You haven't planned any trips yet. Start by creating one!"
            : "You haven't joined any trips yet. Explore the board!"
        }
      </div>
    `;
    return;
  }

  list.innerHTML = selectedTrips.map(trip => `
    <article class="my-trip-card">
      <h3>${typeEmoji[trip.type] || "🧭"} ${escapeHTML(trip.destination)}</h3>

      <p>📅 ${formatDate(trip.date)} · ${formatTime(trip.time)}</p>
      <p>📍 ${escapeHTML(trip.meetPoint)}</p>
      <p>👤 ${escapeHTML(trip.organiser)}</p>

      ${
        activeTab === "created"
          ? `<button onclick="removeTrip(${Number(trip.id)})">Cancel trip</button>`
          : `<button onclick="leaveTrip(${Number(trip.id)})">Leave trip</button>`
      }
    </article>
  `).join("");
}

document.querySelectorAll(".my-tab").forEach(button => {
  button.addEventListener("click", () => {
    activeTab = button.dataset.tab;

    document.querySelectorAll(".my-tab").forEach(tab => {
      tab.classList.remove("active");
    });

    button.classList.add("active");

    renderMyTrips();
  });
});

// SEARCH

document.getElementById("searchInput").addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderTrips();
});

// CATEGORY FILTERS

document.querySelectorAll(".filter-chip").forEach(button => {
  button.addEventListener("click", () => {
    activeType = button.dataset.type;

    document.querySelectorAll(".filter-chip").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    renderTrips();
  });
});

// SORT

document.getElementById("sortSelect").addEventListener("change", event => {
  sortMode = event.target.value;
  renderTrips();
});

// RESET FILTERS

document.getElementById("resetFilters").addEventListener("click", () => {
  activeType = "All";
  searchTerm = "";
  sortMode = "soonest";

  document.getElementById("searchInput").value = "";
  document.getElementById("sortSelect").value = "soonest";

  document.querySelectorAll(".filter-chip").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.type === "All"
    );
  });

  renderTrips();
});

// MODALS

function openModal(id) {
  document.getElementById(id).classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");

  if (!document.querySelector(".modal-backdrop.show")) {
    document.body.style.overflow = "";
  }
}

document.getElementById("createTripBtn").addEventListener("click", () => {
  openModal("tripModal");
});

document.getElementById("heroCreateBtn").addEventListener("click", () => {
  openModal("tripModal");
});

document.getElementById("exploreCreateBtn").addEventListener("click", () => {
  openModal("tripModal");
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });
});

document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) {
      closeModal(backdrop.id);
    }
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-backdrop.show").forEach(modal => {
      closeModal(modal.id);
    });
  }
});

// SET MINIMUM DATE TO TODAY

const dateInput = document.getElementById("tripDate");

const today = new Date();
const todayString = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

dateInput.min = todayString;

// INITIAL RENDER

renderTrips();
renderMyTrips();