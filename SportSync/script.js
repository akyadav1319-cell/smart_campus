// SPORTSYNC — CAMPUS SPORTS EQUIPMENT SYSTEM

const INVENTORY_KEY = "sportsync_inventory_v1";
const CHECKOUT_KEY = "sportsync_checkouts_v1";

const initialInventory = [
    { id: 1, name: "Football", category: "Football", icon: "⚽", total: 10, available: 7, description: "Standard match football." },
    { id: 2, name: "Basketball", category: "Basketball", icon: "🏀", total: 8, available: 5, description: "Indoor and outdoor basketball." },
    { id: 3, name: "Badminton Racket", category: "Badminton", icon: "🏸", total: 12, available: 9, description: "Lightweight badminton racket." },
    { id: 4, name: "Shuttlecock Set", category: "Badminton", icon: "🪶", total: 15, available: 4, description: "Pack of practice shuttlecocks." },
    { id: 5, name: "Cricket Bat", category: "Cricket", icon: "🏏", total: 6, available: 3, description: "Standard cricket practice bat." },
    { id: 6, name: "Tennis Racket", category: "Other", icon: "🎾", total: 5, available: 5, description: "Tennis racket for recreational play." },
    { id: 7, name: "Volleyball", category: "Other", icon: "🏐", total: 7, available: 2, description: "Standard volleyball." },
    { id: 8, name: "Cricket Kit", category: "Cricket", icon: "🥎", total: 4, available: 0, description: "Complete practice cricket kit." },
    { id: 9, name: "Football Cones", category: "Football", icon: "🔺", total: 20, available: 18, description: "Training cones for drills." }
];

let inventory = loadInventory();
let checkouts = loadCheckouts();
let activeCategory = "All";
let selectedEquipmentId = null;

function loadInventory() {
    const saved = localStorage.getItem(INVENTORY_KEY);

    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            localStorage.removeItem(INVENTORY_KEY);
        }
    }

    localStorage.setItem(INVENTORY_KEY, JSON.stringify(initialInventory));
    return [...initialInventory];
}

function loadCheckouts() {
    const saved = localStorage.getItem(CHECKOUT_KEY);

    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            localStorage.removeItem(CHECKOUT_KEY);
        }
    }

    return [];
}

function saveData() {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify(checkouts));
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

function getStatus(item) {
    if (item.available === 0) return "unavailable";
    if (item.available <= 2) return "limited";
    return "available";
}

function getCheckoutStatus(item) {
    if (item.status === "returned") return "returned";

    const due = new Date(item.dueDate + "T23:59:59");

    return due < new Date() ? "overdue" : "active";
}

function formatDate(dateString) {
    return new Date(dateString + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function dateAfter(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
}

function toast(message) {
    const element = document.getElementById("toast");

    element.textContent = message;
    element.classList.add("show");

    setTimeout(() => element.classList.remove("show"), 2500);
}

function updateStats() {
    const total = inventory.reduce((sum, item) => sum + item.total, 0);
    const available = inventory.reduce((sum, item) => sum + item.available, 0);
    const borrowed = total - available;

    document.getElementById("totalEquipment").textContent = total;
    document.getElementById("availableEquipment").textContent = available;
    document.getElementById("borrowedEquipment").textContent = borrowed;

    document.getElementById("categoryCount").textContent =
        new Set(inventory.map(item => item.category)).size;

    document.getElementById("checkoutNavCount").textContent =
        checkouts.filter(item => item.status === "active").length;
}

function renderInventory() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const availability = document.getElementById("availabilityFilter").value;

    let filtered = inventory.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search);

        const matchesCategory =
            activeCategory === "All" || item.category === activeCategory;

        const status = getStatus(item);

        let matchesAvailability = true;

        if (availability !== "all") {
            matchesAvailability = status === availability;
        }

        return matchesSearch && matchesCategory && matchesAvailability;
    });

    document.getElementById("inventoryCount").textContent =
        `${filtered.length} ITEMS`;

    const container = document.getElementById("equipmentGridContainer");
    const empty = document.getElementById("emptyState");

    container.innerHTML = filtered.map(item => {
        const status = getStatus(item);

        return `
            <article class="equipment-card">
                <div class="equipment-art ${item.category.toLowerCase()}">
                    <span>${escapeHTML(item.icon)}</span>
                    <span class="stock-pill ${status}">
                        ${status === "available" ? "AVAILABLE" :
                          status === "limited" ? "LIMITED STOCK" : "OUT OF STOCK"}
                    </span>
                </div>

                <div class="equipment-info">
                    <span class="equipment-category">${escapeHTML(item.category.toUpperCase())}</span>
                    <h3>${escapeHTML(item.name)}</h3>
                    <p>${escapeHTML(item.description)}</p>

                    <div class="equipment-bottom">
                        <span class="stock-text">${item.available} / ${item.total} available</span>
                        <button class="checkout-btn"
                            ${item.available === 0 ? "disabled" : ""}
                            onclick="openCheckout(${item.id})">
                            ${item.available === 0 ? "Unavailable" : "Check out →"}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    empty.classList.toggle("hidden", filtered.length !== 0);
    container.classList.toggle("hidden", filtered.length === 0);

    updateStats();
}

function openCheckout(id) {
    const item = inventory.find(equipment => equipment.id === id);

    if (!item || item.available <= 0) {
        toast("This equipment is currently unavailable.");
        return;
    }

    selectedEquipmentId = id;

    document.getElementById("selectedEquipment").textContent =
        `${item.icon} ${item.name} — ${item.available} available`;

    document.getElementById("checkoutModal").classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

document.getElementById("checkoutForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const item = inventory.find(equipment => equipment.id === selectedEquipmentId);

    if (!item || item.available <= 0) {
        toast("Sorry, this equipment is no longer available.");
        closeModal("checkoutModal");
        renderInventory();
        return;
    }

    const duration = Number(document.getElementById("duration").value);
    const checkout = {
        id: Date.now(),
        equipmentId: item.id,
        equipmentName: item.name,
        equipmentIcon: item.icon,
        studentName: document.getElementById("studentName").value.trim(),
        rollNumber: document.getElementById("rollNumber").value.trim(),
        hostel: document.getElementById("studentHostel").value.trim() || "Not specified",
        checkoutDate: dateAfter(0),
        dueDate: dateAfter(duration),
        status: "active"
    };

    item.available--;
    checkouts.unshift(checkout);

    saveData();
    this.reset();
    closeModal("checkoutModal");

    renderInventory();
    renderCheckouts();
    renderStaff();

    toast("Equipment checked out successfully! ⚡");
});

function renderCheckouts() {
    const active = checkouts.filter(item =>
        item.status === "active" && getCheckoutStatus(item) === "active"
    );

    const returned = checkouts.filter(item => item.status === "returned");

    const overdue = checkouts.filter(item =>
        item.status === "active" && getCheckoutStatus(item) === "overdue"
    );

    document.getElementById("myActiveCount").textContent = active.length;
    document.getElementById("myReturnedCount").textContent = returned.length;
    document.getElementById("myOverdueCount").textContent = overdue.length;

    const container = document.getElementById("myCheckoutList");

    if (checkouts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>🏸</div>
                <h3>No checkouts yet.</h3>
                <p>Head to Equipment and find something to play with!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = checkouts.map(item => {
        const status = getCheckoutStatus(item);

        return `
            <article class="checkout-item">
                <div class="checkout-item-info">
                    <div class="checkout-item-icon">${escapeHTML(item.equipmentIcon)}</div>
                    <div>
                        <h3>${escapeHTML(item.equipmentName)}</h3>
                        <p>Checked out: ${formatDate(item.checkoutDate)}</p>
                        <p>Due: ${formatDate(item.dueDate)}</p>
                        <span class="status-label ${status}">${status.toUpperCase()}</span>
                    </div>
                </div>

                ${status !== "returned"
                    ? `<button class="return-btn" onclick="returnEquipment(${item.id})">Return item ↗</button>`
                    : `<span class="status-label returned">RETURNED ✓</span>`}
            </article>
        `;
    }).join("");
}

function returnEquipment(id) {
    const checkout = checkouts.find(item => item.id === id);

    if (!checkout || checkout.status === "returned") return;

    const item = inventory.find(equipment => equipment.id === checkout.equipmentId);

    if (item) {
        item.available = Math.min(item.total, item.available + 1);
    }

    checkout.status = "returned";
    checkout.returnDate = dateAfter(0);

    saveData();

    renderInventory();
    renderCheckouts();
    renderStaff();

    toast("Equipment returned successfully! ✓");
}

function openAddModal() {
    document.getElementById("addModal").classList.remove("hidden");
}

document.getElementById("addForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("newName").value.trim();
    const category = document.getElementById("newCategory").value;
    const icon = document.getElementById("newIcon").value.trim() || "🎽";
    const stock = Number(document.getElementById("newStock").value);

    if (!name || stock < 1) return;

    inventory.push({
        id: Date.now(),
        name,
        category,
        icon,
        total: stock,
        available: stock,
        description: "Newly added sports equipment."
    });

    saveData();
    this.reset();
    closeModal("addModal");

    renderInventory();
    renderStaff();

    toast("New equipment added to inventory!");
}

);

function renderStaff() {
    const active = checkouts.filter(item => item.status === "active");
    const returned = checkouts.filter(item => item.status === "returned");
    const overdue = active.filter(item => getCheckoutStatus(item) === "overdue");

    document.getElementById("staffTotal").textContent = checkouts.length;
    document.getElementById("staffActive").textContent = active.length - overdue.length;
    document.getElementById("staffOverdue").textContent = overdue.length;
    document.getElementById("staffReturned").textContent = returned.length;

    document.getElementById("inventoryTable").innerHTML = inventory.map(item => {
        const status = getStatus(item);

        return `
            <tr>
                <td><strong>${escapeHTML(item.icon)} ${escapeHTML(item.name)}</strong></td>
                <td>${escapeHTML(item.category)}</td>
                <td>${item.total}</td>
                <td>${item.available}</td>
                <td><span class="status-label ${status === "unavailable" ? "overdue" : "active"}">
                    ${status.toUpperCase()}
                </span></td>
                <td>
                    <button class="table-action" onclick="adjustStock(${item.id}, 1)">+ Stock</button>
                    <button class="table-action" onclick="adjustStock(${item.id}, -1)">− Stock</button>
                </td>
            </tr>
        `;
    }).join("");

    document.getElementById("staffCheckoutTable").innerHTML =
        checkouts.length ? checkouts.map(item => {
            const status = getCheckoutStatus(item);

            return `
                <tr>
                    <td><strong>${escapeHTML(item.studentName)}</strong><br>${escapeHTML(item.rollNumber)}</td>
                    <td>${escapeHTML(item.equipmentIcon)} ${escapeHTML(item.equipmentName)}</td>
                    <td>${formatDate(item.checkoutDate)}</td>
                    <td>${formatDate(item.dueDate)}</td>
                    <td><span class="status-label ${status}">${status.toUpperCase()}</span></td>
                    <td>
                        ${item.status === "active"
                            ? `<button class="table-action" onclick="returnEquipment(${item.id})">Mark returned</button>`
                            : `<span class="status-label returned">DONE</span>`}
                    </td>
                </tr>
            `;
        }).join("") :
        `<tr><td colspan="6">No checkout records yet.</td></tr>`;
}

function adjustStock(id, change) {
    const item = inventory.find(equipment => equipment.id === id);

    if (!item) return;

    if (change > 0) {
        item.total++;
        item.available++;
    } else {
        if (item.total <= 0 || item.available <= 0) {
            toast("Cannot remove stock currently borrowed.");
            return;
        }

        item.total--;
        item.available--;
    }

    saveData();
    renderInventory();
    renderStaff();

    toast("Inventory updated.");
}

// NAVIGATION

function showSection(section) {
    const sections = ["inventory", "checkouts", "staff"];

    sections.forEach(name => {
        document.getElementById(name + "Section")
            .classList.toggle("hidden", name !== section);
    });

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle("active", button.dataset.section === section);
    });

    document.getElementById("breadcrumb").textContent = section.toUpperCase();

    if (section === "checkouts") renderCheckouts();
    if (section === "staff") renderStaff();
}

document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        showSection(button.dataset.section);
    });
});

// FILTERS

document.getElementById("searchInput").addEventListener("input", renderInventory);

document.getElementById("availabilityFilter").addEventListener("change", renderInventory);

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");
        activeCategory = button.dataset.category;

        renderInventory();
    });
});

// CLOSE MODALS BY CLICKING OUTSIDE

document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            overlay.classList.add("hidden");
        }
    });
});

// INITIAL LOAD

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

renderInventory();
renderCheckouts();
renderStaff();