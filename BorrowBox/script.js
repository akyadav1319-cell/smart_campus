// BORROWBOX — Frontend-only campus borrowing demo

const sampleItems = [
  {
    id: 1,
    name: "Scientific Calculator",
    category: "Study",
    emoji: "🧮",
    condition: "Good",
    owner: "Aarav",
    location: "Hostel J",
    phone: "9876543210",
    duration: "2–3 days",
    description: "Casio scientific calculator. Works perfectly. Available for assignments and practicals.",
    created: 1
  },
  {
    id: 2,
    name: "Lab Coat",
    category: "Clothing",
    emoji: "🥼",
    condition: "Good",
    owner: "Mehak",
    location: "Hostel H",
    phone: "9876543211",
    duration: "1 day",
    description: "Clean white lab coat. Perfect if you forgot yours before practicals!",
    created: 2
  },
  {
    id: 3,
    name: "Type-C Charger",
    category: "Electronics",
    emoji: "🔌",
    condition: "Like new",
    owner: "Rishabh",
    location: "Hostel C",
    phone: "9876543212",
    duration: "1 day",
    description: "Fast charging Type-C charger. Please return after use.",
    created: 3
  },
  {
    id: 4,
    name: "Engineering Mathematics Book",
    category: "Study",
    emoji: "📚",
    condition: "Used",
    owner: "Simran",
    location: "Hostel G",
    phone: "9876543213",
    duration: "1 week",
    description: "Useful reference book for engineering mathematics. Some notes included.",
    created: 4
  },
  {
    id: 5,
    name: "Umbrella",
    category: "Daily Essentials",
    emoji: "☂️",
    condition: "Good",
    owner: "Kabir",
    location: "Hostel B",
    phone: "9876543214",
    duration: "1 day",
    description: "Large black umbrella. Available for rainy days.",
    created: 5
  },
  {
    id: 6,
    name: "Badminton Racket",
    category: "Sports",
    emoji: "🏸",
    condition: "Good",
    owner: "Ishita",
    location: "Hostel A",
    phone: "9876543215",
    duration: "2–3 days",
    description: "One badminton racket available. Take care of it!",
    created: 6
  }
];

const sampleRequests = [
  {
    id: 101,
    item: "Drawing sheet and instruments",
    category: "Study",
    emoji: "📐",
    name: "Ananya",
    location: "Hostel D",
    duration: "Tomorrow"
  },
  {
    id: 102,
    item: "Power bank",
    category: "Electronics",
    emoji: "🔋",
    name: "Dev",
    location: "Hostel F",
    duration: "Today"
  },
  {
    id: 103,
    item: "Basketball",
    category: "Sports",
    emoji: "🏀",
    name: "Tanya",
    location: "Hostel E",
    duration: "2–3 days"
  }
];

const categoryEmoji = {
  "Study": "📚",
  "Electronics": "🔌",
  "Clothing": "🥼",
  "Daily Essentials": "☂️",
  "Sports": "🏸",
  "Other": "📦"
};

const categoryClass = {
  "Study": "study",
  "Electronics": "electronics",
  "Clothing": "clothing",
  "Daily Essentials": "daily-essentials",
  "Sports": "sports",
  "Other": "study"
};

// Load saved data or use demo data.
let items = loadData("borrowbox_items", sampleItems);
let requests = loadData("borrowbox_requests", sampleRequests);

let activeCategory = "All";
let searchTerm = "";
let sortMode = "newest";

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [...fallback];
  } catch (error) {
    return [...fallback];
  }
}

function saveData() {
  localStorage.setItem("borrowbox_items", JSON.stringify(items));
  localStorage.setItem("borrowbox_requests", JSON.stringify(requests));
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

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// RENDER ITEMS

function renderItems() {
  const grid = document.getElementById("itemGrid");
  const emptyState = document.getElementById("emptyState");

  let filtered = items.filter(item => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;

    const searchText =
      `${item.name} ${item.category} ${item.owner} ${item.location}`.toLowerCase();

    const matchesSearch = searchText.includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  if (sortMode === "az") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered.sort((a, b) => b.created - a.created);
  }

  document.getElementById("itemStat").textContent = items.length;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  grid.innerHTML = filtered.map(item => {
    const safeCategory = categoryClass[item.category] || "study";

    return `
      <article class="item-card">
        <div class="item-art ${safeCategory}">
          <span>${categoryEmoji[item.category] || "📦"}</span>
          <span class="condition-tag">${escapeHTML(item.condition)}</span>
        </div>

        <div class="item-content">
          <span class="item-category">${escapeHTML(item.category)}</span>
          <h3>${escapeHTML(item.name)}</h3>

          <div class="item-meta">
            <span>📍 ${escapeHTML(item.location)}</span>
            <span>⏱ ${escapeHTML(item.duration)}</span>
          </div>

          <div class="owner-line">
            <div class="owner-avatar">
              ${escapeHTML(item.owner.charAt(0).toUpperCase())}
            </div>

            <div class="owner-info">
              <strong>${escapeHTML(item.owner)}</strong>
              <small>Item owner</small>
            </div>

            <button class="view-btn" onclick="openDetails(${Number(item.id)})">
              View item →
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// RENDER REQUESTS

function renderRequests() {
  const list = document.getElementById("requestList");

  document.getElementById("requestStat").textContent = requests.length;
  document.getElementById("requestCount").textContent =
    `${requests.length} request${requests.length === 1 ? "" : "s"}`;

  if (requests.length === 0) {
    list.innerHTML = `
      <p class="no-requests">No requests yet. Be the first to ask!</p>
    `;
    return;
  }

  list.innerHTML = requests.slice(0, 6).map(request => `
    <div class="request-entry">
      <div class="request-emoji">${categoryEmoji[request.category] || "📦"}</div>

      <div class="request-info">
        <strong>${escapeHTML(request.item)}</strong>
        <small>
          ${escapeHTML(request.name)} · ${escapeHTML(request.location)}
        </small>
      </div>

      <span class="needed-tag">${escapeHTML(request.duration)}</span>
    </div>
  `).join("");
}

// CATEGORY FILTERS

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    activeCategory = button.dataset.category;

    renderItems();
  });
});

// SEARCH

document.getElementById("searchInput").addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderItems();
});

// SORT

document.getElementById("sortSelect").addEventListener("change", event => {
  sortMode = event.target.value;
  renderItems();
});

// RESET FILTERS

document.getElementById("resetFilters").addEventListener("click", () => {
  activeCategory = "All";
  searchTerm = "";
  sortMode = "newest";

  document.getElementById("searchInput").value = "";
  document.getElementById("sortSelect").value = "newest";

  document.querySelectorAll(".category").forEach(button => {
    button.classList.toggle("active", button.dataset.category === "All");
  });

  renderItems();
});

// MODAL CONTROLS

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

document.getElementById("openListBtn").addEventListener("click", () => {
  openModal("listModal");
});

document.getElementById("heroListBtn").addEventListener("click", () => {
  openModal("listModal");
});

document.getElementById("browseListBtn").addEventListener("click", () => {
  openModal("listModal");
});

document.getElementById("openRequestBtn").addEventListener("click", () => {
  openModal("requestModal");
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

// ADD A NEW ITEM

document.getElementById("listForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("itemName").value.trim();
  const category = document.getElementById("itemCategory").value;
  const condition = document.getElementById("itemCondition").value;
  const owner = document.getElementById("ownerName").value.trim();
  const location = document.getElementById("itemLocation").value.trim();
  const phone = document.getElementById("ownerPhone").value.trim();
  const duration = document.getElementById("itemDuration").value;
  const description = document.getElementById("itemDescription").value.trim();

  if (!/^[0-9]{10}$/.test(phone)) {
    showToast("Please enter a valid 10-digit contact number.");
    return;
  }

  const newItem = {
    id: Date.now(),
    name,
    category,
    emoji: categoryEmoji[category] || "📦",
    condition,
    owner,
    location,
    phone,
    duration,
    description,
    created: Date.now()
  };

  items.unshift(newItem);

  saveData();
  renderItems();

  event.target.reset();
  closeModal("listModal");

  showToast("Your item is now on the BorrowBox shelf! 🎉");

  document.getElementById("browse").scrollIntoView({
    behavior: "smooth"
  });
});

// POST A REQUEST

document.getElementById("requestForm").addEventListener("submit", event => {
  event.preventDefault();

  const item = document.getElementById("requestItem").value.trim();
  const category = document.getElementById("requestCategory").value;
  const name = document.getElementById("requesterName").value.trim();
  const location = document.getElementById("requesterLocation").value.trim();
  const duration = document.getElementById("requestDuration").value;

  const newRequest = {
    id: Date.now(),
    item,
    category,
    emoji: categoryEmoji[category] || "📦",
    name,
    location,
    duration
  };

  requests.unshift(newRequest);

  saveData();
  renderRequests();

  event.target.reset();
  closeModal("requestModal");

  showToast("Your request has been posted! 💜");
});

// ITEM DETAILS

function openDetails(id) {
  const item = items.find(item => Number(item.id) === Number(id));

  if (!item) {
    showToast("This item is no longer available.");
    return;
  }

  const safeCategory = categoryClass[item.category] || "study";

  document.getElementById("detailsContent").innerHTML = `
    <span class="eyebrow">ITEM DETAILS</span>

    <div class="details-art item-art ${safeCategory}">
      ${categoryEmoji[item.category] || "📦"}
    </div>

    <span class="item-category">${escapeHTML(item.category)}</span>
    <h2>${escapeHTML(item.name)}</h2>

    <p class="details-description">
      ${escapeHTML(item.description || "No additional description provided. Contact the owner for more details.")}
    </p>

    <div class="details-info">
      <div>
        <span>OWNER</span>
        <strong>${escapeHTML(item.owner)}</strong>
      </div>

      <div>
        <span>LOCATION</span>
        <strong>${escapeHTML(item.location)}</strong>
      </div>

      <div>
        <span>CONDITION</span>
        <strong>${escapeHTML(item.condition)}</strong>
      </div>

      <div>
        <span>AVAILABLE FOR</span>
        <strong>${escapeHTML(item.duration)}</strong>
      </div>
    </div>

    <div class="details-actions">
      <a class="btn btn-primary"
         href="tel:${encodeURIComponent(item.phone)}">
         📞 Contact owner
      </a>

      ${item.created > 6 ? `
        <button class="btn btn-outline" onclick="removeItem(${Number(item.id)})">
          Remove listing
        </button>
      ` : ""}
    </div>
  `;

  openModal("detailsModal");
}

// REMOVE USER-ADDED ITEM

function removeItem(id) {
  const confirmed = confirm("Remove this item from the BorrowBox shelf?");

  if (!confirmed) return;

  items = items.filter(item => Number(item.id) !== Number(id));

  saveData();
  renderItems();
  closeModal("detailsModal");

  showToast("Your listing has been removed.");
}

// INITIAL PAGE RENDER

renderItems();
renderRequests();