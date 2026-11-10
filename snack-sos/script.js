// ======================================
// SNACKSOS - HOSTEL COMMUNITY PLATFORM
// ======================================

// SAMPLE LISTINGS

const sampleItems = [
    {
        id: 1,
        name: "Maggi Noodles",
        category: "Instant Food",
        emoji: "🍜",
        quantity: "3 packets",
        price: 10,
        seller: "Aarav",
        hostel: "Hostel H",
        phone: "9876543210",
        status: "Available",
        owner: "sample"
    },
    {
        id: 2,
        name: "Chocolate Cookies",
        category: "Snacks",
        emoji: "🍪",
        quantity: "1 packet",
        price: 20,
        seller: "Riya",
        hostel: "Hostel B",
        phone: "9876543211",
        status: "Available",
        owner: "sample"
    },
    {
        id: 3,
        name: "Cold Coffee",
        category: "Beverages",
        emoji: "🥤",
        quantity: "2 bottles",
        price: 30,
        seller: "Karan",
        hostel: "Hostel A",
        phone: "9876543212",
        status: "Available",
        owner: "sample"
    },
    {
        id: 4,
        name: "Bread",
        category: "Groceries",
        emoji: "🍞",
        quantity: "1 packet",
        price: 25,
        seller: "Mehak",
        hostel: "Hostel C",
        phone: "9876543213",
        status: "Available",
        owner: "sample"
    },
    {
        id: 5,
        name: "Shampoo Sachets",
        category: "Essentials",
        emoji: "🧴",
        quantity: "5 sachets",
        price: 0,
        seller: "Simran",
        hostel: "Hostel D",
        phone: "9876543214",
        status: "Available",
        owner: "sample"
    },
    {
        id: 6,
        name: "Potato Chips",
        category: "Snacks",
        emoji: "🍟",
        quantity: "2 packets",
        price: 15,
        seller: "Dev",
        hostel: "Hostel H",
        phone: "9876543215",
        status: "Available",
        owner: "sample"
    },
    {
        id: 7,
        name: "Instant Coffee",
        category: "Beverages",
        emoji: "☕",
        quantity: "4 sachets",
        price: 10,
        seller: "Ishita",
        hostel: "Hostel B",
        phone: "9876543216",
        status: "Available",
        owner: "sample"
    },
    {
        id: 8,
        name: "Oats",
        category: "Groceries",
        emoji: "🥣",
        quantity: "1 packet",
        price: 35,
        seller: "Naman",
        hostel: "Hostel C",
        phone: "9876543217",
        status: "Available",
        owner: "sample"
    },
    {
        id: 9,
        name: "Instant Pasta",
        category: "Instant Food",
        emoji: "🍝",
        quantity: "2 packets",
        price: 20,
        seller: "Ananya",
        hostel: "Hostel A",
        phone: "9876543218",
        status: "Available",
        owner: "sample"
    }
];

const sampleRequests = [
    {
        id: 101,
        item: "Anyone has Maggi? Urgent midnight craving 😭",
        category: "Instant Food",
        name: "Rahul",
        hostel: "Hostel H"
    },
    {
        id: 102,
        item: "Need a packet of chips or biscuits!",
        category: "Snacks",
        name: "Sneha",
        hostel: "Hostel B"
    },
    {
        id: 103,
        item: "Does anyone have extra shampoo?",
        category: "Essentials",
        name: "Aditi",
        hostel: "Hostel C"
    }
];


// LOCAL STORAGE

let items = JSON.parse(localStorage.getItem("snackItems"));

if (!Array.isArray(items)) {
    items = sampleItems;
    saveItems();
}

let requests = JSON.parse(localStorage.getItem("snackRequests"));

if (!Array.isArray(requests)) {
    requests = sampleRequests;
    saveRequests();
}

let selectedCategory = "All";
let searchTerm = "";

function saveItems() {
    localStorage.setItem("snackItems", JSON.stringify(items));
}

function saveRequests() {
    localStorage.setItem("snackRequests", JSON.stringify(requests));
}


// CATEGORY EMOJIS

const categoryEmojis = {
    "Instant Food": "🍜",
    "Snacks": "🍪",
    "Beverages": "🥤",
    "Groceries": "🛒",
    "Essentials": "🧴"
};


// TOAST NOTIFICATIONS

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);

}


// MODAL CONTROLS

function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeModal(id) {

    document.getElementById(id).classList.add("hidden");

    if (!document.querySelector(".modal-overlay:not(.hidden)")) {
        document.body.style.overflow = "";
    }

}

document.querySelectorAll("[data-close]").forEach(button => {

    button.addEventListener("click", () => {
        closeModal(button.dataset.close);
    });

});

document.querySelectorAll(".modal-overlay").forEach(overlay => {

    overlay.addEventListener("click", event => {

        if (event.target === overlay) {
            closeModal(overlay.id);
        }

    });

});

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        document.querySelectorAll(".modal-overlay").forEach(modal => {
            closeModal(modal.id);
        });

    }

});


// OPEN ITEM FORM

function openItemForm() {
    openModal("itemModal");
}

document.getElementById("navPost")
    .addEventListener("click", openItemForm);

document.getElementById("heroPost")
    .addEventListener("click", openItemForm);

document.getElementById("browsePost")
    .addEventListener("click", openItemForm);

document.getElementById("emptyPost")
    .addEventListener("click", openItemForm);


// RENDER LISTINGS

const listingGrid = document.getElementById("listingGrid");

function renderItems(data) {

    listingGrid.innerHTML = "";

    document.getElementById("listingCount").textContent =
        `${data.length} ${data.length === 1 ? "item" : "items"}`;

    document.getElementById("availableCount").textContent =
        items.filter(item => item.status === "Available").length;

    if (data.length === 0) {

        document.getElementById("emptyState").classList.remove("hidden");

        return;

    }

    document.getElementById("emptyState").classList.add("hidden");

    data.forEach(item => {

        const card = document.createElement("article");

        card.className = "listing-card";

        const categoryClass = item.category.toLowerCase()
            .replaceAll(" ", "-");

        const priceText = item.price === 0
            ? "FREE"
            : `₹${item.price}`;

        card.innerHTML = `

            <div class="card-art ${categoryClass}">
                <span>${categoryEmojis[item.category] || "📦"}</span>

                ${item.price === 0
                    ? '<span class="free-tag">FREE ♥</span>'
                    : ''}
            </div>

            <div class="card-body">

                <span class="card-category">${item.category}</span>

                <h3></h3>

                <p class="card-quantity"></p>

                <div class="card-meta">
                    <span>👤 ${escapeHTML(item.seller)}</span>
                    <span>🏠 ${escapeHTML(item.hostel)}</span>
                </div>

                <div class="card-footer">

                    <span class="card-price">
                        ${priceText}
                        <small>/ item</small>
                    </span>

                    <button class="view-btn" data-id="${item.id}">
                        View item ↗
                    </button>

                </div>

            </div>

        `;

        card.querySelector("h3").textContent = item.name;
        card.querySelector(".card-quantity").textContent = item.quantity;

        listingGrid.appendChild(card);

    });

}


// BASIC HTML ESCAPING FOR USER INPUT

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

}


// SEARCH AND FILTER

function filterItems() {

    const filtered = items.filter(item => {

        const matchesCategory =
            selectedCategory === "All" ||
            item.category === selectedCategory;

        const content = `
            ${item.name}
            ${item.category}
            ${item.hostel}
            ${item.seller}
        `.toLowerCase();

        const matchesSearch = content.includes(searchTerm);

        return matchesCategory &&
               matchesSearch &&
               item.status === "Available";

    });

    renderItems(filtered);

}


// SEARCH INPUT

document.getElementById("searchInput")
    .addEventListener("input", event => {

        searchTerm = event.target.value.trim().toLowerCase();

        filterItems();

    });

document.getElementById("searchButton")
    .addEventListener("click", filterItems);


// CATEGORY FILTERS

document.querySelectorAll(".filter-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        filterItems();

    });

});


// POST A NEW ITEM

document.getElementById("itemForm")
    .addEventListener("submit", event => {

        event.preventDefault();

        const phone = document.getElementById("sellerPhone").value.trim();

        if (!/^[0-9]{10}$/.test(phone)) {
            showToast("Enter a valid 10-digit phone number.");
            return;
        }

        const newItem = {

            id: Date.now(),

            name: document.getElementById("itemName").value.trim(),

            category: document.getElementById("itemCategory").value,

            emoji: "📦",

            quantity: document.getElementById("itemQuantity").value.trim(),

            price: Number(document.getElementById("itemPrice").value),

            seller: document.getElementById("sellerName").value.trim(),

            hostel: document.getElementById("sellerHostel").value.trim(),

            phone: phone,

            status: "Available",

            owner: "user"

        };

        items.unshift(newItem);

        saveItems();

        event.target.reset();

        closeModal("itemModal");

        selectedCategory = "All";
        searchTerm = "";

        document.getElementById("searchInput").value = "";

        document.querySelectorAll(".filter-btn").forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.category === "All"
            );

        });

        filterItems();

        showToast("Your item is now listed! 🎉");

    });


// ITEM DETAILS

listingGrid.addEventListener("click", event => {

    const button = event.target.closest(".view-btn");

    if (!button) return;

    const id = Number(button.dataset.id);

    const item = items.find(product => product.id === id);

    if (!item) return;

    const priceText = item.price === 0
        ? "Free"
        : `₹${item.price}`;

    const details = document.getElementById("detailsContent");

    details.innerHTML = `

        <span class="modal-emoji">
            ${categoryEmojis[item.category] || "📦"}
        </span>

        <h2></h2>

        <p class="modal-subtitle">${item.category}</p>

        <div class="detail-info">
            <strong>Quantity</strong>
            ${escapeHTML(item.quantity)}
        </div>

        <div class="detail-info">
            <strong>Price</strong>
            ${priceText}
        </div>

        <div class="detail-info">
            <strong>Listed by</strong>
            ${escapeHTML(item.seller)}
        </div>

        <div class="detail-info">
            <strong>Hostel / Block</strong>
            ${escapeHTML(item.hostel)}
        </div>

        <div class="detail-info">
            <strong>Availability</strong>
            ${item.status}
        </div>

        <a class="contact-btn" href="tel:${item.phone}">
            ☎ Contact ${escapeHTML(item.seller)}
        </a>

        <button class="remove-btn hidden" id="removeItem">
            Remove my listing
        </button>

    `;

    details.querySelector("h2").textContent = item.name;

    if (item.owner === "user") {

        const removeButton = document.getElementById("removeItem");

        removeButton.classList.remove("hidden");

        removeButton.addEventListener("click", () => {

            items = items.filter(product => product.id !== id);

            saveItems();

            closeModal("detailsModal");

            filterItems();

            showToast("Your listing has been removed.");

        });

    }

    openModal("detailsModal");

});


// CLAIM AN ITEM IS HANDLED BY THE SELLER DIRECTLY.
// THIS PROTOTYPE DOES NOT PROCESS PAYMENTS OR RESERVATIONS.


// OPEN REQUEST FORM

document.getElementById("requestOpen")
    .addEventListener("click", () => {
        openModal("requestModal");
    });


// POST A REQUEST

document.getElementById("requestForm")
    .addEventListener("submit", event => {

        event.preventDefault();

        const newRequest = {

            id: Date.now(),

            item: document.getElementById("requestItem").value.trim(),

            category: document.getElementById("requestCategory").value,

            name: document.getElementById("requestName").value.trim(),

            hostel: document.getElementById("requestHostel").value.trim()

        };

        requests.unshift(newRequest);

        saveRequests();

        event.target.reset();

        closeModal("requestModal");

        renderRequests();

        showToast("Your SOS has been posted! 📣");

    });


// RENDER REQUESTS

function renderRequests() {

    const container = document.getElementById("requestGrid");

    container.innerHTML = "";

    document.getElementById("requestCount").textContent =
        requests.length;

    if (requests.length === 0) {

        container.innerHTML =
            "<p>No requests yet. Be the first to ask!</p>";

        return;

    }

    requests.forEach(request => {

        const card = document.createElement("div");

        card.className = "request-card";

        card.innerHTML = `

            <div class="request-category">
                ${request.category}
            </div>

            <h4></h4>

            <p>
                👤 ${escapeHTML(request.name)}<br>
                🏠 ${escapeHTML(request.hostel)}
            </p>

        `;

        card.querySelector("h4").textContent = request.item;

        container.appendChild(card);

    });

}


// INITIALISE WEBSITE

filterItems();

renderRequests();