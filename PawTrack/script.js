// PAWTRACK — CAMPUS ANIMAL WELFARE PORTAL

const ANIMAL_KEY = "pawtrack_animals_v1";
const REPORT_KEY = "pawtrack_reports_v1";
const VOLUNTEER_KEY = "pawtrack_volunteers_v1";

const sampleAnimals = [
    {
        id: 1,
        name: "Bruno",
        type: "Dog",
        icon: "🐕",
        location: "Near the main gate",
        description: "Friendly brown campus dog. Often spotted around the entrance and enjoys company.",
        status: "Regularly spotted",
        created: 1
    },
    {
        id: 2,
        name: "Mittens",
        type: "Cat",
        icon: "🐈",
        location: "Near the library",
        description: "A quiet grey cat that is often seen resting around the library garden.",
        status: "Regularly spotted",
        created: 2
    },
    {
        id: 3,
        name: "Peaches",
        type: "Dog",
        icon: "🐶",
        location: "Academic block",
        description: "A cheerful campus dog. Has a light brown coat and is frequently spotted around the academic area.",
        status: "Regularly spotted",
        created: 3
    },
    {
        id: 4,
        name: "Sky",
        type: "Bird",
        icon: "🦚",
        location: "Campus gardens",
        description: "A peacock occasionally spotted around the green spaces on campus.",
        status: "Regularly spotted",
        created: 4
    },
    {
        id: 5,
        name: "Shadow",
        type: "Cat",
        icon: "🐈‍⬛",
        location: "Hostel area",
        description: "A black cat that is sometimes seen near the hostel surroundings.",
        status: "Not recently spotted",
        created: 5
    },
    {
        id: 6,
        name: "Coco",
        type: "Dog",
        icon: "🐕‍🦺",
        location: "Sports complex",
        description: "A campus dog usually spotted near the sports complex.",
        status: "Needs attention",
        created: 6
    }
];

const sampleReports = [
    {
        id: 101,
        type: "Sighting",
        animal: "Peacock",
        animalName: "Sky",
        location: "Campus gardens",
        description: "A peacock was spotted near the garden pathway this morning.",
        reporter: "Campus Student",
        contact: "",
        status: "Resolved",
        created: 1
    },
    {
        id: 102,
        type: "Injured",
        animal: "Dog",
        animalName: "Unknown",
        location: "Near the academic block",
        description: "A dog was seen limping. Please ask an appropriate animal welfare volunteer to check.",
        reporter: "Campus Student",
        contact: "",
        status: "Volunteer Assigned",
        created: 2
    },
    {
        id: 103,
        type: "Missing",
        animal: "Cat",
        animalName: "Mittens",
        location: "Near the library",
        description: "Mittens has not been spotted around the library recently. Sharing this for awareness.",
        reporter: "Campus Student",
        contact: "",
        status: "Pending",
        created: 3
    }
];

let animals = loadData(ANIMAL_KEY, sampleAnimals);
let reports = loadData(REPORT_KEY, sampleReports);
let volunteers = loadData(VOLUNTEER_KEY, []);

let activeAnimalFilter = "All";
let activeReportFilter = "All";

function loadData(key, fallback) {
    const saved = localStorage.getItem(key);

    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            localStorage.removeItem(key);
        }
    }

    localStorage.setItem(key, JSON.stringify(fallback));
    return [...fallback];
}

function saveData() {
    localStorage.setItem(ANIMAL_KEY, JSON.stringify(animals));
    localStorage.setItem(REPORT_KEY, JSON.stringify(reports));
    localStorage.setItem(VOLUNTEER_KEY, JSON.stringify(volunteers));
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

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 2600);
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

function openReportModal() {
    document.getElementById("reportModal").classList.remove("hidden");
}

function openAnimalModal() {
    document.getElementById("animalModal").classList.remove("hidden");
}

function openVolunteerModal() {
    document.getElementById("volunteerModal").classList.remove("hidden");
}

// STATS

function renderStats() {
    document.getElementById("animalCount").textContent = animals.length;
    document.getElementById("reportCount").textContent = reports.length;

    document.getElementById("resolvedCount").textContent =
        reports.filter(report => report.status === "Resolved").length;

    document.getElementById("volunteerCount").textContent = volunteers.length;
}

// ANIMAL DIRECTORY

function renderAnimals() {
    const search = document.getElementById("animalSearch").value
        .trim().toLowerCase();

    const filtered = animals.filter(animal => {
        const matchesSearch =
            animal.name.toLowerCase().includes(search) ||
            animal.location.toLowerCase().includes(search) ||
            animal.type.toLowerCase().includes(search);

        const matchesType =
            activeAnimalFilter === "All" ||
            animal.type === activeAnimalFilter;

        return matchesSearch && matchesType;
    });

    const grid = document.getElementById("animalGrid");
    const empty = document.getElementById("animalEmpty");

    grid.innerHTML = filtered.map(animal => {
        let statusClass = "animal-status";

        if (animal.status === "Needs attention") {
            statusClass += " attention";
        } else if (animal.status === "Not recently spotted") {
            statusClass += " not-seen";
        }

        return `
            <article class="animal-card">
                <div class="animal-art ${animal.type.toLowerCase()}">
                    <span>${escapeHTML(animal.icon)}</span>
                    <span class="animal-type-tag">${escapeHTML(animal.type.toUpperCase())}</span>
                </div>

                <div class="animal-card-body">
                    <h3>${escapeHTML(animal.name)}</h3>
                    <p class="animal-location">⌖ ${escapeHTML(animal.location)}</p>
                    <span class="${statusClass}">${escapeHTML(animal.status)}</span>

                    <div class="animal-card-footer">
                        <span>Campus companion ♡</span>
                        <button onclick="openAnimalDetails(${animal.id})">View profile →</button>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    empty.classList.toggle("hidden", filtered.length !== 0);
    grid.classList.toggle("hidden", filtered.length === 0);

    renderStats();
}

document.getElementById("animalSearch").addEventListener("input", renderAnimals);

document.querySelectorAll("[data-animal-filter]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-animal-filter]").forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");
        activeAnimalFilter = button.dataset.animalFilter;

        renderAnimals();
    });
});

// ADD ANIMAL

document.getElementById("animalForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const animal = {
        id: Date.now(),
        name: document.getElementById("animalName").value.trim(),
        type: document.getElementById("animalType").value,
        icon: document.getElementById("animalEmoji").value.trim() || "🐾",
        location: document.getElementById("animalLocation").value.trim(),
        description: document.getElementById("animalDescription").value.trim(),
        status: document.getElementById("animalStatus").value,
        created: Date.now()
    };

    animals.unshift(animal);

    saveData();
    this.reset();

    closeModal("animalModal");
    renderAnimals();

    showToast("New campus friend added! 🐾");
});

// ANIMAL PROFILE

function openAnimalDetails(id) {
    const animal = animals.find(item => item.id === id);

    if (!animal) return;

    const userAdded = animal.created > 6;

    document.getElementById("animalDetailsContent").innerHTML = `
        <span class="eyebrow">CAMPUS ANIMAL PROFILE</span>

        <div class="detail-animal-icon">${escapeHTML(animal.icon)}</div>

        <h2>${escapeHTML(animal.name)}</h2>

        <div class="detail-row">
            <span>Animal type</span>
            <strong>${escapeHTML(animal.type)}</strong>
        </div>

        <div class="detail-row">
            <span>Last known location</span>
            <strong>${escapeHTML(animal.location)}</strong>
        </div>

        <div class="detail-row">
            <span>General status</span>
            <strong>${escapeHTML(animal.status)}</strong>
        </div>

        <div class="detail-description">
            ${escapeHTML(animal.description || "No additional description available.")}
        </div>

        <div class="detail-actions">
            <button class="primary-btn" onclick="reportAboutAnimal(${animal.id})">
                Report an issue
            </button>

            ${userAdded ? `
                <button class="outline-btn" onclick="deleteAnimal(${animal.id})">
                    Remove profile
                </button>
            ` : ""}
        </div>
    `;

    document.getElementById("animalDetailsModal").classList.remove("hidden");
}

function reportAboutAnimal(id) {
    const animal = animals.find(item => item.id === id);

    if (!animal) return;

    document.getElementById("reportName").value = animal.name;
    document.getElementById("reportAnimal").value =
        ["Dog", "Cat", "Bird"].includes(animal.type) ? animal.type : "Other";

    document.getElementById("reportLocation").value = animal.location;

    closeModal("animalDetailsModal");
    openReportModal();
}

function deleteAnimal(id) {
    const animal = animals.find(item => item.id === id);

    if (!animal || animal.created <= 6) return;

    if (!confirm("Remove this animal profile from the directory?")) return;

    animals = animals.filter(item => item.id !== id);

    saveData();
    closeModal("animalDetailsModal");
    renderAnimals();

    showToast("Animal profile removed.");
}

// REPORT SUBMISSION

document.getElementById("reportForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const report = {
        id: Date.now(),
        type: document.getElementById("reportType").value,
        animal: document.getElementById("reportAnimal").value,
        animalName: document.getElementById("reportName").value.trim() || "Unknown",
        location: document.getElementById("reportLocation").value.trim(),
        description: document.getElementById("reportDescription").value.trim(),
        reporter: document.getElementById("reporterName").value.trim(),
        contact: document.getElementById("reporterContact").value.trim(),
        status: "Pending",
        created: Date.now()
    };

    reports.unshift(report);

    saveData();
    this.reset();

    closeModal("reportModal");
    renderReports();
    renderStats();

    showToast("Report submitted successfully! ♡");
});

// REPORT DIRECTORY

function renderReports() {
    let filtered = reports.filter(report => {
        return activeReportFilter === "All" ||
            report.type === activeReportFilter;
    });

    const list = document.getElementById("reportList");
    const empty = document.getElementById("reportEmpty");

    list.innerHTML = filtered.map(report => {
        let icon = "🐾";

        if (report.type === "Injured") icon = "♡";
        if (report.type === "Missing") icon = "🔎";
        if (report.type === "Sighting") icon = "👀";

        const userAdded = report.created > 3;

        let statusClass = "report-status";

        if (report.status === "Volunteer Assigned") {
            statusClass += " assigned";
        } else if (report.status === "Resolved") {
            statusClass += " resolved";
        }

        return `
            <article class="report-card">
                <div class="report-icon ${escapeHTML(report.type)}">${icon}</div>

                <div class="report-info">
                    <h3>${escapeHTML(report.type)} report — ${escapeHTML(report.animalName)}</h3>

                    <p class="report-location">⌖ ${escapeHTML(report.location)}</p>

                    <p>${escapeHTML(report.description)}</p>

                    <p>Animal: ${escapeHTML(report.animal)} · Reported by: ${escapeHTML(report.reporter)}</p>
                </div>

                <div class="report-card-actions">
                    <span class="${statusClass}">${escapeHTML(report.status)}</span>

                    ${userAdded && report.status !== "Resolved" ? `
                        <button onclick="updateReportStatus(${report.id})">
                            ${report.status === "Pending" ? "Assign volunteer →" : "Mark resolved ✓"}
                        </button>
                    ` : ""}
                </div>
            </article>
        `;
    }).join("");

    empty.classList.toggle("hidden", filtered.length !== 0);
    list.classList.toggle("hidden", filtered.length === 0);

    renderStats();
}

document.querySelectorAll("[data-report-filter]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-report-filter]").forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");
        activeReportFilter = button.dataset.reportFilter;

        renderReports();
    });
});

// REPORT STATUS

function updateReportStatus(id) {
    const report = reports.find(item => item.id === id);

    if (!report || report.created <= 3) return;

    if (report.status === "Pending") {
        report.status = "Volunteer Assigned";
        showToast("Volunteer assigned in demo!");
    } else if (report.status === "Volunteer Assigned") {
        report.status = "Resolved";
        showToast("Report marked as resolved!");
    }

    saveData();
    renderReports();
    renderStats();
}

// VOLUNTEER REGISTRATION

document.getElementById("volunteerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const roll = document.getElementById("volunteerRoll").value.trim();

    const alreadyRegistered = volunteers.some(volunteer =>
        volunteer.roll.toLowerCase() === roll.toLowerCase()
    );

    if (alreadyRegistered) {
        showToast("This roll number is already registered.");
        return;
    }

    volunteers.push({
        id: Date.now(),
        name: document.getElementById("volunteerName").value.trim(),
        roll,
        email: document.getElementById("volunteerEmail").value.trim(),
        interest: document.getElementById("volunteerInterest").value
    });

    saveData();
    this.reset();

    closeModal("volunteerModal");
    renderStats();

    showToast("Welcome to the PawTrack community! ♡");
});

// MODAL INTERACTIONS

document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            overlay.classList.add("hidden");
        }
    });
});

// INITIAL LOAD

renderAnimals();
renderReports();
renderStats();