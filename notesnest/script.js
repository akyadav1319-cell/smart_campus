// --------------------------------------
// NotesNest — frontend demo application
// --------------------------------------

const starterResources = [
  {
    id: 1,
    title: "Data Structures — Linked Lists",
    subject: "Data Structures",
    semester: "3",
    category: "Notes",
    branch: "All branches",
    description: "Concepts, diagrams, insertion, deletion and traversal of singly linked lists.",
    link: "",
    contributor: "Campus Contributor",
    created: 1
  },
  {
    id: 2,
    title: "Operating Systems — Previous Year Paper",
    subject: "Operating Systems",
    semester: "3",
    category: "PYQ",
    branch: "All branches",
    description: "A practice paper covering processes, scheduling, deadlocks and memory management.",
    link: "",
    contributor: "Campus Contributor",
    created: 2
  },
  {
    id: 3,
    title: "Computer Networks — OSI Model",
    subject: "Computer Networks",
    semester: "4",
    category: "Study Guide",
    branch: "All branches",
    description: "A concise revision guide to the seven layers of the OSI model.",
    link: "",
    contributor: "Campus Contributor",
    created: 3
  },
  {
    id: 4,
    title: "Digital Electronics — Flip Flops",
    subject: "Digital Electronics",
    semester: "2",
    category: "PPT",
    branch: "All branches",
    description: "Revision slides on SR, JK, D and T flip flops with truth tables.",
    link: "",
    contributor: "Campus Contributor",
    created: 4
  },
  {
    id: 5,
    title: "Programming in C — Lab Manual",
    subject: "Programming in C",
    semester: "1",
    category: "Lab File",
    branch: "All branches",
    description: "Practice programs covering arrays, functions, pointers and structures.",
    link: "",
    contributor: "Campus Contributor",
    created: 5
  },
  {
    id: 6,
    title: "Engineering Mathematics — Matrices",
    subject: "Engineering Mathematics",
    semester: "2",
    category: "Notes",
    branch: "All branches",
    description: "Revision notes covering matrices, rank, eigenvalues and eigenvectors.",
    link: "",
    contributor: "Campus Contributor",
    created: 6
  }
];

const starterLabs = [
  {
    id: 101,
    subject: "Data Structures",
    experiment: "Singly Linked Lists",
    semester: "3",
    questions: "1. What is a linked list?\n2. Explain insertion at the beginning.\n3. What is the difference between an array and a linked list?\n4. What is the time complexity of searching?",
    tips: "Practise pointer diagrams and dry-run insertion and deletion operations.",
    contributor: "Campus Contributor",
    created: 1
  },
  {
    id: 102,
    subject: "Operating Systems",
    experiment: "CPU Scheduling",
    semester: "3",
    questions: "1. Differentiate between FCFS and SJF.\n2. Calculate waiting time and turnaround time.\n3. What is starvation?\n4. Explain Round Robin scheduling.",
    tips: "Be comfortable solving small scheduling numericals.",
    contributor: "Campus Contributor",
    created: 2
  },
  {
    id: 103,
    subject: "Digital Electronics",
    experiment: "Flip Flops",
    semester: "2",
    questions: "1. Draw the truth table of JK flip flop.\n2. What is race-around condition?\n3. Differentiate between latch and flip flop.",
    tips: "Revise characteristic tables and circuit diagrams.",
    contributor: "Campus Contributor",
    created: 3
  }
];

let resources = loadData("nn_resources", starterResources);
let labs = loadData("nn_labs", starterLabs);
let bookmarks = loadData("nn_bookmarks", []);
let activeView = "discover";
let activeCategory = "All";
let searchText = "";
let semesterValue = "all";
let sortValue = "newest";

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : structuredClone(fallback);
  } catch (error) {
    return structuredClone(fallback);
  }
}

function saveData() {
  localStorage.setItem("nn_resources", JSON.stringify(resources));
  localStorage.setItem("nn_labs", JSON.stringify(labs));
  localStorage.setItem("nn_bookmarks", JSON.stringify(bookmarks));
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

function iconFor(category) {
  const icons = {
    "Notes": "▤",
    "PYQ": "◷",
    "PPT": "▧",
    "Lab File": "⌘",
    "Study Guide": "✎"
  };
  return icons[category] || "▤";
}

function classFor(category) {
  const classes = {
    "Notes": "file-notes",
    "PYQ": "file-pyq",
    "PPT": "file-ppt",
    "Lab File": "file-lab",
    "Study Guide": "file-guide"
  };
  return classes[category] || "file-notes";
}

function updateStats() {
  document.getElementById("resourceCount").textContent = resources.length;
  document.getElementById("pyqCount").textContent =
    resources.filter(r => r.category === "PYQ").length;
  document.getElementById("labCount").textContent = labs.length;
  document.getElementById("bookmarkCount").textContent = bookmarks.length;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

function openResourceModal() {
  document.getElementById("resourceForm").reset();
  openModal("resourceModal");
}

function openLabModal() {
  document.getElementById("labForm").reset();
  openModal("labModal");
}

// --------------------------------------
// Navigation
// --------------------------------------

const viewDetails = {
  discover: {
    title: "Find your next <span>aha moment.</span>",
    subtitle: "A little help from your fellow students goes a long way.",
    section: "Explore resources",
    eyebrow: "THE COMMUNITY LIBRARY"
  },
  pyqs: {
    title: "Practice makes <span>progress.</span>",
    subtitle: "Find previous year papers and prepare with purpose.",
    section: "Previous year papers",
    eyebrow: "YOUR EXAM PREPARATION SPACE"
  },
  labs: {
    title: "Walk into labs <span>prepared.</span>",
    subtitle: "Real student experiences. Useful viva questions. Fewer surprises.",
    section: "Lab experiences",
    eyebrow: "LEARN FROM THE LAB"
  },
  bookmarks: {
    title: "Your little <span>knowledge vault.</span>",
    subtitle: "Everything you saved, all in one place.",
    section: "Saved resources",
    eyebrow: "YOUR PERSONAL COLLECTION"
  },
  uploads: {
    title: "Your knowledge <span>makes a difference.</span>",
    subtitle: "Keep track of the resources you've shared with the community.",
    section: "My contributions",
    eyebrow: "YOUR SHARED KNOWLEDGE"
  }
};

function switchView(view) {
  activeView = view;
  activeCategory = "All";

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  const details = viewDetails[view];

  document.getElementById("pageTitle").innerHTML = details.title;
  document.getElementById("pageSubtitle").textContent = details.subtitle;
  document.getElementById("sectionTitle").textContent = details.section;
  document.getElementById("sectionEyebrow").textContent = details.eyebrow;
  document.getElementById("breadcrumbName").textContent =
    view === "pyqs" ? "PYQ Bank" :
    view === "labs" ? "Lab Experiences" :
    view === "uploads" ? "My Contributions" :
    view.charAt(0).toUpperCase() + view.slice(1);

  document.getElementById("categoryFilters").classList.toggle("hidden", view === "labs");

  document.getElementById("searchInput").placeholder =
    view === "labs" ? "Search subjects, experiments, or questions..." :
    "Search subjects, topics, or resources...";

  document.getElementById("addResourceBtn").textContent =
    view === "labs" ? "＋ Share experience" : "＋ Add resource";

  document.getElementById("addResourceBtn").onclick =
    view === "labs" ? openLabModal : openResourceModal;

  document.getElementById("semesterFilter").value = "all";
  document.getElementById("searchInput").value = "";
  document.getElementById("sortFilter").value = "newest";

  searchText = "";
  semesterValue = "all";
  sortValue = "newest";

  document.querySelectorAll(".filter-chip").forEach(button => {
    button.classList.toggle("selected", button.dataset.category === "All");
  });

  renderContent();
}

document.querySelectorAll(".nav-link, .quick-link").forEach(button => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

// --------------------------------------
// Resource rendering
// --------------------------------------

function getFilteredResources() {
  let filtered = [...resources];

  if (activeView === "pyqs") {
    filtered = filtered.filter(r => r.category === "PYQ");
  }

  if (activeView === "bookmarks") {
    filtered = filtered.filter(r => bookmarks.includes(r.id));
  }

  if (activeView === "uploads") {
    filtered = filtered.filter(r => r.userCreated);
  }

  if (activeCategory !== "All" && activeView !== "pyqs") {
    filtered = filtered.filter(r => r.category === activeCategory);
  }

  if (semesterValue !== "all") {
    filtered = filtered.filter(r => r.semester === semesterValue);
  }

  if (searchText) {
    const query = searchText.toLowerCase();

    filtered = filtered.filter(r =>
      `${r.title} ${r.subject} ${r.description} ${r.category} ${r.branch}`
        .toLowerCase().includes(query)
    );
  }

  if (sortValue === "az") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filtered.sort((a, b) => b.created - a.created);
  }

  return filtered;
}

function renderResources() {
  const grid = document.getElementById("resourceGrid");
  const empty = document.getElementById("emptyState");

  const filtered = getFilteredResources();

  document.getElementById("resultsLabel").textContent =
    `Showing ${filtered.length} resource${filtered.length === 1 ? "" : "s"}`;

  grid.innerHTML = filtered.map(resource => {
    const saved = bookmarks.includes(resource.id);

    return `
      <article class="resource-card">
        <div class="card-top">
          <div class="file-icon ${classFor(resource.category)}">
            ${iconFor(resource.category)}
          </div>
          <button class="bookmark-btn ${saved ? "saved" : ""}"
            data-bookmark="${resource.id}"
            title="${saved ? "Remove bookmark" : "Save bookmark"}">
            ${saved ? "♥" : "♡"}
          </button>
        </div>

        <h3>${escapeHTML(resource.title)}</h3>
        <div class="card-subject">${escapeHTML(resource.subject)}</div>
        <p class="card-description">${escapeHTML(resource.description || "A student-shared academic resource.")}</p>

        <div class="card-meta">
          <span class="tag">${escapeHTML(resource.category)}</span>
          <span class="card-semester">Semester ${escapeHTML(resource.semester)}</span>
        </div>

        <div class="card-footer">
          <span class="contributor">By ${escapeHTML(resource.contributor)}</span>
          <button class="view-btn" data-details="${resource.id}">View details ↗</button>
        </div>
      </article>
    `;
  }).join("");

  empty.classList.toggle("hidden", filtered.length !== 0);
  grid.classList.toggle("hidden", filtered.length === 0);

  grid.querySelectorAll("[data-bookmark]").forEach(button => {
    button.addEventListener("click", () => {
      toggleBookmark(Number(button.dataset.bookmark));
    });
  });

  grid.querySelectorAll("[data-details]").forEach(button => {
    button.addEventListener("click", () => {
      showResourceDetails(Number(button.dataset.details));
    });
  });
}

// --------------------------------------
// Lab experience rendering
// --------------------------------------

function renderLabs() {
  const grid = document.getElementById("resourceGrid");
  const empty = document.getElementById("emptyState");

  let filtered = [...labs];

  if (semesterValue !== "all") {
    filtered = filtered.filter(l => l.semester === semesterValue);
  }

  if (searchText) {
    const query = searchText.toLowerCase();

    filtered = filtered.filter(l =>
      `${l.subject} ${l.experiment} ${l.questions} ${l.tips}`
        .toLowerCase().includes(query)
    );
  }

  if (sortValue === "az") {
    filtered.sort((a, b) => a.subject.localeCompare(b.subject));
  } else {
    filtered.sort((a, b) => b.created - a.created);
  }

  document.getElementById("resultsLabel").textContent =
    `Showing ${filtered.length} experience${filtered.length === 1 ? "" : "s"}`;

  grid.innerHTML = filtered.map(lab => `
    <article class="resource-card">
      <div class="card-top">
        <div class="file-icon file-lab">⌘</div>
        <span class="tag">Lab experience</span>
      </div>
      <h3>${escapeHTML(lab.experiment)}</h3>
      <div class="card-subject">${escapeHTML(lab.subject)}</div>
      <p class="card-description">${escapeHTML(lab.questions.split("\n")[0])}</p>
      <div class="card-meta">
        <span class="tag">Viva / Evaluation</span>
        <span class="card-semester">Semester ${escapeHTML(lab.semester)}</span>
      </div>
      <div class="card-footer">
        <span class="contributor">By ${escapeHTML(lab.contributor)}</span>
        <button class="view-btn" data-lab-details="${lab.id}">Read experience ↗</button>
      </div>
    </article>
  `).join("");

  empty.classList.toggle("hidden", filtered.length !== 0);
  grid.classList.toggle("hidden", filtered.length === 0);

  grid.querySelectorAll("[data-lab-details]").forEach(button => {
    button.addEventListener("click", () => {
      showLabDetails(Number(button.dataset.labDetails));
    });
  });
}

function renderContent() {
  updateStats();

  if (activeView === "labs") {
    renderLabs();
  } else {
    renderResources();
  }
}

// --------------------------------------
// Bookmarks
// --------------------------------------

function toggleBookmark(id) {
  if (bookmarks.includes(id)) {
    bookmarks = bookmarks.filter(item => item !== id);
    showToast("Removed from your bookmarks.");
  } else {
    bookmarks.push(id);
    showToast("Saved to your knowledge vault ♥");
  }

  saveData();
  renderContent();
}

// --------------------------------------
// Resource details
// --------------------------------------

function showResourceDetails(id) {
  const resource = resources.find(r => r.id === id);
  if (!resource) return;

  document.getElementById("detailsTitle").textContent = resource.title;

  const linkHTML = resource.link
    ? `<a class="detail-link" href="${escapeHTML(resource.link)}" target="_blank" rel="noopener noreferrer">Open resource ↗</a>`
    : `<p class="form-note">This sample resource does not have an attached file link yet.</p>`;

  document.getElementById("detailsContent").innerHTML = `
    <span class="tag detail-type">${escapeHTML(resource.category)}</span>
    <p class="detail-description">${escapeHTML(resource.description || "No description provided.")}</p>
    <div class="detail-info"><span>Subject</span><strong>${escapeHTML(resource.subject)}</strong></div>
    <div class="detail-info"><span>Semester</span><strong>${escapeHTML(resource.semester)}</strong></div>
    <div class="detail-info"><span>Branch</span><strong>${escapeHTML(resource.branch || "All branches")}</strong></div>
    <div class="detail-info"><span>Contributor</span><strong>${escapeHTML(resource.contributor)}</strong></div>
    ${linkHTML}
  `;

  openModal("detailsModal");
}

function showLabDetails(id) {
  const lab = labs.find(l => l.id === id);
  if (!lab) return;

  document.getElementById("detailsTitle").textContent = lab.experiment;

  document.getElementById("detailsContent").innerHTML = `
    <span class="tag detail-type">${escapeHTML(lab.subject)}</span>
    <div class="detail-info"><span>Semester</span><strong>${escapeHTML(lab.semester)}</strong></div>
    <h3 style="font-size:13px;margin-top:18px;">Questions asked</h3>
    <div class="questions-box">${escapeHTML(lab.questions)}</div>
    ${lab.tips ? `
      <h3 style="font-size:13px;">Additional tips</h3>
      <p class="detail-description">${escapeHTML(lab.tips)}</p>
    ` : ""}
    <div class="detail-info"><span>Shared by</span><strong>${escapeHTML(lab.contributor)}</strong></div>
  `;

  openModal("detailsModal");
}

// --------------------------------------
// Add resource
// --------------------------------------

document.getElementById("resourceForm").addEventListener("submit", event => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const link = formData.get("link").trim();

  if (link) {
    try {
      const parsed = new URL(link);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid URL");
      }
    } catch {
      showToast("Please enter a valid resource link.");
      return;
    }
  }

  const newResource = {
    id: Date.now(),
    title: formData.get("title").trim(),
    subject: formData.get("subject").trim(),
    semester: formData.get("semester"),
    category: formData.get("category"),
    branch: formData.get("branch"),
    description: formData.get("description").trim(),
    link,
    contributor: "You",
    created: Date.now(),
    userCreated: true
  };

  resources.unshift(newResource);
  saveData();

  closeModal("resourceModal");
  event.target.reset();

  switchView("uploads");
  showToast("Your resource has been added! ✨");
});

// --------------------------------------
// Add lab experience
// --------------------------------------

document.getElementById("labForm").addEventListener("submit", event => {
  event.preventDefault();

  const formData = new FormData(event.target);

  const newLab = {
    id: Date.now(),
    subject: formData.get("subject").trim(),
    experiment: formData.get("experiment").trim(),
    semester: formData.get("semester"),
    questions: formData.get("questions").trim(),
    tips: formData.get("tips").trim(),
    contributor: "You",
    created: Date.now()
  };

  labs.unshift(newLab);
  saveData();

  closeModal("labModal");
  event.target.reset();

  switchView("labs");
  showToast("Lab experience shared successfully! ✨");
});

// --------------------------------------
// Filters and search
// --------------------------------------

document.getElementById("searchInput").addEventListener("input", event => {
  searchText = event.target.value.trim();
  renderContent();
});

document.getElementById("semesterFilter").addEventListener("change", event => {
  semesterValue = event.target.value;
  renderContent();
});

document.getElementById("sortFilter").addEventListener("change", event => {
  sortValue = event.target.value;
  renderContent();
});

document.querySelectorAll(".filter-chip").forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;

    document.querySelectorAll(".filter-chip").forEach(chip => {
      chip.classList.toggle("selected", chip === button);
    });

    renderContent();
  });
});

// --------------------------------------
// Buttons
// --------------------------------------

document.getElementById("topUploadBtn").addEventListener("click", openResourceModal);
document.getElementById("sideUploadBtn").addEventListener("click", openResourceModal);
document.getElementById("contributeBtn").addEventListener("click", openResourceModal);
document.getElementById("emptyAddBtn").addEventListener("click", () => {
  if (activeView === "labs") {
    openLabModal();
  } else {
    openResourceModal();
  }
});

// Close buttons
document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });
});

// Close when clicking outside modal
document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      overlay.classList.add("hidden");
    }
  });
});

// Escape key closes modals
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-overlay").forEach(modal => {
      modal.classList.add("hidden");
    });
  }

  // "/" focuses search when not typing in an input
  if (
    event.key === "/" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
  ) {
    event.preventDefault();
    document.getElementById("searchInput").focus();
  }
});

// Initial render
switchView("discover");