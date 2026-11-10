// CAMPUS COMPASS - CAMPUS DIRECTORY

const places = [
    {
        id: 1,
        name: "Campus Canteen",
        category: "Food",
        icon: "🍔",
        location: "Main Academic Block",
        hours: "8:00 AM – 8:00 PM",
        phone: "9876543210",
        status: "Open",
        description: "A convenient place to grab meals, snacks and refreshments between classes."
    },
    {
        id: 2,
        name: "Juice Corner",
        category: "Food",
        icon: "🥤",
        location: "Near Student Centre",
        hours: "10:00 AM – 7:00 PM",
        phone: "9876543211",
        status: "Open",
        description: "Fresh juices, shakes and quick refreshments."
    },
    {
        id: 3,
        name: "Campus Stationery",
        category: "Shopping",
        icon: "📚",
        location: "Near Library",
        hours: "9:00 AM – 6:00 PM",
        phone: "9876543212",
        status: "Open",
        description: "Notebooks, pens, stationery, folders and other academic essentials."
    },
    {
        id: 4,
        name: "Photocopy Centre",
        category: "Services",
        icon: "🖨️",
        location: "Near Academic Block",
        hours: "9:00 AM – 8:00 PM",
        phone: "9876543213",
        status: "Open",
        description: "Printing, photocopying, scanning and document services."
    },
    {
        id: 5,
        name: "Campus Medical Centre",
        category: "Medical",
        icon: "🏥",
        location: "Near Main Academic Area",
        hours: "9:00 AM – 5:00 PM",
        phone: "9876543214",
        status: "Open",
        description: "Campus medical assistance and first-aid services."
    },
    {
        id: 6,
        name: "Main Gate Security",
        category: "Security",
        icon: "🛡️",
        location: "Main Entrance",
        hours: "24 Hours",
        phone: "9876543215",
        status: "Open",
        description: "Contact for campus entry assistance and security-related concerns."
    },
    {
        id: 7,
        name: "Sports Complex",
        category: "Campus",
        icon: "🏀",
        location: "Sports Ground",
        hours: "6:00 AM – 9:00 PM",
        phone: "9876543216",
        status: "Open",
        description: "Sports facilities and equipment access for students."
    },
    {
        id: 8,
        name: "University Library",
        category: "Campus",
        icon: "📖",
        location: "Central Library Building",
        hours: "8:00 AM – 10:00 PM",
        phone: "9876543217",
        status: "Open",
        description: "Study spaces, books, reading rooms and academic resources."
    },
    {
        id: 9,
        name: "Laundry Service",
        category: "Services",
        icon: "🧺",
        location: "Hostel Area",
        hours: "9:00 AM – 6:00 PM",
        phone: "9876543218",
        status: "Closed",
        description: "Laundry and clothing-care services for hostel residents."
    },
    {
        id: 10,
        name: "Hostel Reception",
        category: "Campus",
        icon: "🏠",
        location: "Hostel Reception Block",
        hours: "24 Hours",
        phone: "9876543219",
        status: "Open",
        description: "Contact for hostel-related assistance and general enquiries."
    },
    {
        id: 11,
        name: "University Transport Office",
        category: "Services",
        icon: "🚌",
        location: "Administrative Block",
        hours: "9:00 AM – 5:00 PM",
        phone: "9876543220",
        status: "Closed",
        description: "Transport schedules and campus transportation enquiries."
    },
    {
        id: 12,
        name: "Administrative Office",
        category: "Campus",
        icon: "🏢",
        location: "Administrative Block",
        hours: "9:00 AM – 5:00 PM",
        phone: "9876543221",
        status: "Open",
        description: "General administrative assistance and university enquiries."
    }
];

const grid = document.getElementById("directoryGrid");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const categoryButtons = document.querySelectorAll(".category-btn");
const emptyState = document.getElementById("emptyState");

let selectedCategory = "All";
let searchTerm = "";

// DISPLAY ALL PLACES

function displayPlaces(data) {

    grid.innerHTML = "";

    document.getElementById("resultCount").textContent =
        `${data.length} ${data.length === 1 ? "place" : "places"}`;

    if (data.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    data.forEach(place => {

        const card = document.createElement("div");
        card.className = "place-card";

        card.innerHTML = `
            <div class="card-top">
                <div class="place-icon">${place.icon}</div>

                <span class="status ${place.status.toLowerCase()}">
                    ● ${place.status}
                </span>
            </div>

            <h3>${place.name}</h3>

            <div class="place-category">${place.category}</div>

            <div class="place-location">
                📍 ${place.location}
            </div>

            <hr class="card-divider">

            <div class="card-bottom">
                <span class="place-hours">🕒 ${place.hours}</span>

                <button class="details-btn" data-id="${place.id}">
                    View details ↗
                </button>
            </div>
        `;

        grid.appendChild(card);
    });

}

// SEARCH AND FILTER

function filterPlaces() {

    const filtered = places.filter(place => {

        const matchesCategory =
            selectedCategory === "All" ||
            place.category === selectedCategory;

        const searchContent = `
            ${place.name}
            ${place.category}
            ${place.location}
            ${place.description}
        `.toLowerCase();

        const matchesSearch = searchContent.includes(searchTerm);

        return matchesCategory && matchesSearch;

    });

    displayPlaces(filtered);
}

// SEARCH BUTTON

searchButton.addEventListener("click", () => {

    searchTerm = searchInput.value.trim().toLowerCase();

    filterPlaces();

    document.getElementById("explore").scrollIntoView({
        behavior: "smooth"
    });

});

// SEARCH AS USER TYPES

searchInput.addEventListener("input", () => {

    searchTerm = searchInput.value.trim().toLowerCase();

    filterPlaces();

});

// CATEGORY BUTTONS

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        filterPlaces();

    });

});

// MODAL ELEMENTS

const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

// SHOW PLACE DETAILS

grid.addEventListener("click", event => {

    const button = event.target.closest(".details-btn");

    if (!button) return;

    const id = Number(button.dataset.id);

    const place = places.find(item => item.id === id);

    if (!place) return;

    modalContent.innerHTML = `

        <div class="modal-emoji">${place.icon}</div>

        <h2>${place.name}</h2>

        <div class="modal-category">
            ${place.category}
        </div>

        <div class="modal-info">
            <strong>📍 Location</strong>
            ${place.location}
        </div>

        <div class="modal-info">
            <strong>🕒 Operating Hours</strong>
            ${place.hours}
        </div>

        <div class="modal-info">
            <strong>Availability</strong>
            ${place.status}
        </div>

        <div class="modal-info">
            <strong>About</strong>
            ${place.description}
        </div>

        <div class="modal-info">
            <strong>Contact</strong>
            ${place.phone}
        </div>

        <a href="tel:${place.phone}" class="modal-call">
            ☎ Call Now
        </a>

    `;

    modalOverlay.classList.remove("hidden");

});

// CLOSE MODAL

modalClose.addEventListener("click", () => {
    modalOverlay.classList.add("hidden");
});

modalOverlay.addEventListener("click", event => {

    if (event.target === modalOverlay) {
        modalOverlay.classList.add("hidden");
    }

});

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        modalOverlay.classList.add("hidden");
    }

});

// RESET FILTERS

document.getElementById("resetSearch").addEventListener("click", () => {

    searchInput.value = "";
    searchTerm = "";
    selectedCategory = "All";

    categoryButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.category === "All"
        );
    });

    filterPlaces();

});

// INITIALISE WEBSITE

document.getElementById("totalPlaces").textContent = places.length;

document.getElementById("openPlaces").textContent =
    places.filter(place => place.status === "Open").length;

displayPlaces(places);