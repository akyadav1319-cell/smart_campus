// HOMEBOUND — FRONTEND DEMO

const STORAGE_KEY = "homebound_journeys_v1";
const JOINED_KEY = "homebound_joined_v1";

function futureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
}

const sampleJourneys = [
    {
        id: 1,
        destination: "Delhi",
        mode: "Train",
        date: futureDate(2),
        time: "17:30",
        departure: "Patiala Railway Station",
        seats: 3,
        organiser: "Aarav Sharma",
        hostel: "Hostel H",
        contact: "9876543210",
        notes: "Planning to take the evening train. Looking for fellow Delhi travellers.",
        created: 1
    },
    {
        id: 2,
        destination: "Chandigarh",
        mode: "Shared Cab",
        date: futureDate(1),
        time: "10:00",
        departure: "Thapar Main Gate",
        seats: 2,
        organiser: "Mehak Arora",
        hostel: "Hostel B",
        contact: "9876543211",
        notes: "Splitting cab fare. Leaving after breakfast.",
        created: 2
    },
    {
        id: 3,
        destination: "Jaipur",
        mode: "Bus",
        date: futureDate(4),
        time: "21:00",
        departure: "Patiala Bus Stand",
        seats: 4,
        organiser: "Rohan Mehta",
        hostel: "Hostel A",
        contact: "9876543212",
        notes: "Night bus journey. Anyone travelling towards Jaipur?",
        created: 3
    },
    {
        id: 4,
        destination: "Lucknow",
        mode: "Train",
        date: futureDate(5),
        time: "14:15",
        departure: "Patiala Railway Station",
        seats: 1,
        organiser: "Ishita Verma",
        hostel: "Hostel G",
        contact: "9876543213",
        notes: "Looking for one more person to coordinate the journey with.",
        created: 4
    },
    {
        id: 5,
        destination: "Amritsar",
        mode: "Shared Cab",
        date: futureDate(3),
        time: "08:30",
        departure: "Thapar Main Gate",
        seats: 3,
        organiser: "Kabir Singh",
        hostel: "Hostel C",
        contact: "9876543214",
        notes: "Morning departure. Can pick up fellow travellers on the way.",
        created: 5
    },
    {
        id: 6,
        destination: "Mumbai",
        mode: "Flight",
        date: futureDate(8),
        time: "06:00",
        departure: "Chandigarh Airport",
        seats: 2,
        organiser: "Ananya Rao",
        hostel: "Hostel F",
        contact: "9876543215",
        notes: "Heading to Chandigarh airport early morning. Happy to coordinate transport.",
        created: 6
    }
];

let journeys = loadJourneys();
let joinedJourneys = JSON.parse(localStorage.getItem(JOINED_KEY)) || [];
let activeJourneyId = null;

function loadJourneys() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleJourneys));
    return [...sampleJourneys];
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journeys));
    localStorage.setItem(JOINED_KEY, JSON.stringify(joinedJourneys));
}

function isUpcoming(journey) {
    const travelDate = new Date(`${journey.date}T${journey.time}`);
    return travelDate >= new Date();
}

function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function formatDay(dateString) {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        weekday: "short"
    });
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderStats() {
    const upcoming = journeys.filter(isUpcoming);

    const totalSeats = upcoming.reduce((sum, journey) => {
        return sum + Number(journey.seats);
    }, 0);

    const cities = new Set(
        upcoming.map(journey => journey.destination.toLowerCase())
    );

    document.getElementById("totalJourneys").textContent = upcoming.length;
    document.getElementById("totalSeats").textContent = totalSeats;
    document.getElementById("totalCities").textContent = cities.size;
}

function renderJourneys() {
    const search = document.getElementById("searchInput").value
        .trim().toLowerCase();

    const mode = document.getElementById("modeFilter").value;
    const dateFilter = document.getElementById("dateFilter").value;
    const sort = document.getElementById("sortFilter").value;

    let filtered = journeys.filter(journey => {
        const matchesSearch =
            journey.destination.toLowerCase().includes(search) ||
            journey.departure.toLowerCase().includes(search) ||
            journey.organiser.toLowerCase().includes(search);

        const matchesMode = mode === "all" || journey.mode === mode;

        let matchesDate = true;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const journeyDate = new Date(journey.date + "T00:00:00");
        const daysAway = Math.ceil(
            (journeyDate - today) / (1000 * 60 * 60 * 24)
        );

        if (dateFilter === "today") {
            matchesDate = daysAway === 0;
        } else if (dateFilter === "week") {
            matchesDate = daysAway >= 0 && daysAway <= 7;
        } else if (dateFilter === "month") {
            matchesDate = daysAway >= 0 && daysAway <= 30;
        }

        return matchesSearch && matchesMode && matchesDate && isUpcoming(journey);
    });

    if (sort === "soonest") {
        filtered.sort((a, b) =>
            new Date(`${a.date}T${a.time}`) -
            new Date(`${b.date}T${b.time}`)
        );
    } else if (sort === "latest") {
        filtered.sort((a, b) =>
            new Date(`${b.date}T${b.time}`) -
            new Date(`${a.date}T${a.time}`)
        );
    } else if (sort === "seats") {
        filtered.sort((a, b) => b.seats - a.seats);
    }

    const grid = document.getElementById("journeyGrid");
    const empty = document.getElementById("emptyState");

    document.getElementById("resultsCount").textContent =
        `Showing ${filtered.length} ${filtered.length === 1 ? "journey" : "journeys"}`;

    grid.innerHTML = filtered.map(journey => `
        <article class="journey-card" onclick="openDetails(${journey.id})">
            <div class="card-top">
                <span class="mode-tag">${escapeHTML(journey.mode)}</span>
                <span class="seat-tag">
                    ${journey.seats > 0
                        ? `${journey.seats} seats available`
                        : "Fully booked"}
                </span>
            </div>

            <h3 class="card-destination">${escapeHTML(journey.destination)}</h3>
            <p class="card-departure">From ${escapeHTML(journey.departure)}</p>

            <div class="card-route">
                <span>THAPAR</span>
                <div></div>
                <span>${escapeHTML(journey.destination.toUpperCase())}</span>
            </div>

            <div class="card-meta">
                <div>
                    <small>DATE</small>
                    <strong>${formatDate(journey.date)}</strong>
                </div>
                <div>
                    <small>DEPARTURE</small>
                    <strong>${escapeHTML(journey.time)}</strong>
                </div>
            </div>

            <div class="card-footer">
                <span class="organiser">By ${escapeHTML(journey.organiser)}</span>
                <span class="view-link">View details →</span>
            </div>
        </article>
    `).join("");

    empty.classList.toggle("hidden", filtered.length !== 0);
    grid.classList.toggle("hidden", filtered.length === 0);

    renderStats();
}

function openPostModal() {
    const modal = document.getElementById("postModal");
    const dateInput = document.getElementById("travelDate");

    dateInput.min = futureDate(0);
    modal.classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

document.getElementById("journeyForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const date = document.getElementById("travelDate").value;
    const time = document.getElementById("travelTime").value;

    const travelDate = new Date(`${date}T${time}`);

    if (travelDate <= new Date()) {
        showToast("Please choose a future departure date and time.");
        return;
    }

    const journey = {
        id: Date.now(),
        destination: document.getElementById("destination").value.trim(),
        mode: document.getElementById("mode").value,
        date,
        time,
        departure: document.getElementById("departure").value.trim(),
        seats: Number(document.getElementById("seats").value),
        organiser: document.getElementById("organiser").value.trim(),
        hostel: document.getElementById("hostel").value.trim() || "Not specified",
        contact: document.getElementById("contact").value.trim(),
        notes: document.getElementById("notes").value.trim(),
        created: Date.now()
    };

    journeys.unshift(journey);
    saveData();

    this.reset();
    closeModal("postModal");
    renderJourneys();

    showToast("Your journey has been published! ✦");
});

function openDetails(id) {
    const journey = journeys.find(item => item.id === id);

    if (!journey) return;

    activeJourneyId = id;

    const isOwner = journey.created > 6;
    const isJoined = joinedJourneys.includes(id);

    let actionButtons = "";

    if (isOwner) {
        actionButtons = `
            <button class="primary-btn" onclick="deleteJourney(${id})">
                Cancel journey
            </button>
        `;
    } else if (isJoined) {
        actionButtons = `
            <button class="secondary-btn" onclick="leaveJourney(${id})">
                Leave journey
            </button>
            <a class="primary-btn" href="tel:${escapeHTML(journey.contact)}">
                Contact organiser
            </a>
        `;
    } else if (journey.seats > 0) {
        actionButtons = `
            <button class="primary-btn" onclick="joinJourney(${id})">
                Join journey →
            </button>
            <a class="secondary-btn" href="tel:${escapeHTML(journey.contact)}">
                Contact organiser
            </a>
        `;
    } else {
        actionButtons = `
            <button class="secondary-btn" disabled>Fully booked</button>
            <a class="secondary-btn" href="tel:${escapeHTML(journey.contact)}">
                Contact organiser
            </a>
        `;
    }

    document.getElementById("detailsContent").innerHTML = `
        <span class="eyebrow">${escapeHTML(journey.mode)} · TRAVEL DETAILS</span>
        <h2>${escapeHTML(journey.destination)}</h2>

        <div class="detail-route">
            <small>YOUR DESTINATION</small>
            <h2>${escapeHTML(journey.destination)}</h2>
            <p>Departing from ${escapeHTML(journey.departure)}</p>
        </div>

        <div class="detail-row">
            <span>Travel date</span>
            <strong>${formatDay(journey.date)}, ${formatDate(journey.date)}</strong>
        </div>

        <div class="detail-row">
            <span>Departure time</span>
            <strong>${escapeHTML(journey.time)}</strong>
        </div>

        <div class="detail-row">
            <span>Transport</span>
            <strong>${escapeHTML(journey.mode)}</strong>
        </div>

        <div class="detail-row">
            <span>Available seats</span>
            <strong>${journey.seats}</strong>
        </div>

        <div class="detail-row">
            <span>Organiser</span>
            <strong>${escapeHTML(journey.organiser)}</strong>
        </div>

        <div class="detail-row">
            <span>Hostel</span>
            <strong>${escapeHTML(journey.hostel)}</strong>
        </div>

        <div class="detail-notes">
            <strong>Additional details</strong><br>
            ${escapeHTML(journey.notes || "No additional details provided.")}
        </div>

        <div class="detail-actions">
            ${actionButtons}
        </div>
    `;

    document.getElementById("detailsModal").classList.remove("hidden");
}

function joinJourney(id) {
    const journey = journeys.find(item => item.id === id);

    if (!journey || journey.seats <= 0) {
        showToast("Sorry, this journey is fully booked.");
        return;
    }

    if (joinedJourneys.includes(id)) {
        showToast("You're already part of this journey.");
        return;
    }

    journey.seats--;
    joinedJourneys.push(id);

    saveData();
    closeModal("detailsModal");
    renderJourneys();

    showToast("You've joined the journey! ✦");
}

function leaveJourney(id) {
    const journey = journeys.find(item => item.id === id);

    if (!journey || !joinedJourneys.includes(id)) return;

    journey.seats++;
    joinedJourneys = joinedJourneys.filter(item => item !== id);

    saveData();
    closeModal("detailsModal");
    renderJourneys();

    showToast("You've left the journey.");
}

function deleteJourney(id) {
    const journey = journeys.find(item => item.id === id);

    if (!journey || journey.created <= 6) return;

    const confirmed = confirm("Are you sure you want to cancel this journey?");

    if (!confirmed) return;

    journeys = journeys.filter(item => item.id !== id);
    joinedJourneys = joinedJourneys.filter(item => item !== id);

    saveData();
    closeModal("detailsModal");
    renderJourneys();

    showToast("Journey cancelled.");
}

// FILTER EVENTS

document.getElementById("searchInput").addEventListener("input", renderJourneys);
document.getElementById("modeFilter").addEventListener("change", renderJourneys);
document.getElementById("dateFilter").addEventListener("change", renderJourneys);
document.getElementById("sortFilter").addEventListener("change", renderJourneys);

// CLOSE MODALS WHEN CLICKING OUTSIDE

document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", function(event) {
        if (event.target === overlay) {
            overlay.classList.add("hidden");
        }
    });
});

// INITIAL LOAD

renderJourneys();