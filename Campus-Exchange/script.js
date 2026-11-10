// CAMPUS EXCHANGE — Frontend-only marketplace demo

const sampleProducts = [
  {
    id: 1,
    name: "Engineering Mathematics Book",
    category: "Books",
    emoji: "📚",
    price: 250,
    originalPrice: 550,
    condition: "Good",
    seller: "Ananya",
    location: "Hostel H",
    phone: "9876543210",
    description: "Engineering mathematics textbook with neatly maintained pages. Useful for semester preparation.",
    created: 1
  },
  {
    id: 2,
    name: "Wireless Headphones",
    category: "Electronics",
    emoji: "🎧",
    price: 650,
    originalPrice: 1200,
    condition: "Like new",
    seller: "Rohan",
    location: "Hostel J",
    phone: "9876543211",
    description: "Wireless headphones in excellent condition. Battery and sound work perfectly.",
    created: 2
  },
  {
    id: 3,
    name: "Study Table Lamp",
    category: "Hostel Essentials",
    emoji: "💡",
    price: 180,
    originalPrice: 350,
    condition: "Good",
    seller: "Mehak",
    location: "Hostel G",
    phone: "9876543212",
    description: "Compact study lamp. Perfect for late-night study sessions.",
    created: 3
  },
  {
    id: 4,
    name: "Oversized Denim Jacket",
    category: "Fashion",
    emoji: "🧥",
    price: 450,
    originalPrice: 900,
    condition: "Good",
    seller: "Ishita",
    location: "Hostel A",
    phone: "9876543213",
    description: "Comfortable oversized denim jacket. Great condition.",
    created: 4
  },
  {
    id: 5,
    name: "Scientific Calculator",
    category: "Stationery",
    emoji: "🧮",
    price: 300,
    originalPrice: 650,
    condition: "Like new",
    seller: "Kabir",
    location: "Hostel C",
    phone: "9876543214",
    description: "Scientific calculator, fully functional and ready for practicals.",
    created: 5
  },
  {
    id: 6,
    name: "Mini Indoor Plant",
    category: "Other",
    emoji: "🪴",
    price: 100,
    originalPrice: 180,
    condition: "Good",
    seller: "Simran",
    location: "Hostel D",
    phone: "9876543215",
    description: "Small indoor plant. Perfect for decorating your hostel desk.",
    created: 6
  },
  {
    id: 7,
    name: "Programming in C Book",
    category: "Books",
    emoji: "📖",
    price: 200,
    originalPrice: 400,
    condition: "Used",
    seller: "Dev",
    location: "Hostel B",
    phone: "9876543216",
    description: "Helpful programming reference book. Some highlighting inside.",
    created: 7
  },
  {
    id: 8,
    name: "Portable Bluetooth Speaker",
    category: "Electronics",
    emoji: "🔊",
    price: 550,
    originalPrice: 1000,
    condition: "Good",
    seller: "Tanya",
    location: "Hostel E",
    phone: "9876543217",
    description: "Portable Bluetooth speaker with good sound quality.",
    created: 8
  }
];

const categoryClass = {
  "Books": "books",
  "Electronics": "electronics",
  "Hostel Essentials": "hostel",
  "Fashion": "fashion",
  "Stationery": "stationery",
  "Other": "other"
};

// Load saved products and wishlist.

function loadData(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [...fallback];
  } catch {
    return [...fallback];
  }
}

let products = loadData("campusExchange_products", sampleProducts);
let wishlist = loadData("campusExchange_wishlist", []);

let activeCategory = "All";
let searchTerm = "";
let conditionFilter = "All";
let sortMode = "newest";
let wishlistOnly = false;

function saveData() {
  localStorage.setItem("campusExchange_products", JSON.stringify(products));
  localStorage.setItem("campusExchange_wishlist", JSON.stringify(wishlist));
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
  }, 2700);
}

// RENDER PRODUCTS

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyState");

  let filtered = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;

    const searchText =
      `${product.name} ${product.category} ${product.seller} ${product.location}`.toLowerCase();

    const matchesSearch = searchText.includes(searchTerm);

    const matchesCondition =
      conditionFilter === "All" || product.condition === conditionFilter;

    const matchesWishlist =
      !wishlistOnly || wishlist.includes(product.id);

    return matchesCategory &&
      matchesSearch &&
      matchesCondition &&
      matchesWishlist;
  });

  if (sortMode === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortMode === "high") {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    filtered.sort((a, b) => b.created - a.created);
  }

  document.getElementById("totalListings").textContent = products.length;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  grid.innerHTML = filtered.map(product => {
    const safeClass = categoryClass[product.category] || "other";
    const isSaved = wishlist.includes(product.id);

    let discount = "";

    if (product.originalPrice && product.originalPrice > product.price) {
      const percentage = Math.round(
        (1 - product.price / product.originalPrice) * 100
      );

      discount = `<span class="discount">${percentage}% OFF</span>`;
    }

    return `
      <article class="product-card">

        <div class="product-image ${safeClass}">
          <span>${product.emoji || "📦"}</span>

          <span class="condition-label">
            ${escapeHTML(product.condition)}
          </span>

          <button
            class="wishlist-btn ${isSaved ? "saved" : ""}"
            onclick="toggleWishlist(${Number(product.id)})"
            aria-label="Toggle wishlist"
          >
            ${isSaved ? "♥" : "♡"}
          </button>
        </div>

        <div class="product-info">

          <span class="product-category">
            ${escapeHTML(product.category)}
          </span>

          <h3>${escapeHTML(product.name)}</h3>

          <div class="product-prices">
            <span class="current-price">₹${Number(product.price).toLocaleString("en-IN")}</span>

            ${
              product.originalPrice
                ? `<span class="old-price">₹${Number(product.originalPrice).toLocaleString("en-IN")}</span>`
                : ""
            }

            ${discount}
          </div>

          <div class="product-footer">

            <div class="seller-avatar">
              ${escapeHTML(product.seller.charAt(0).toUpperCase())}
            </div>

            <div class="seller-info">
              <strong>${escapeHTML(product.seller)}</strong>
              <small>📍 ${escapeHTML(product.location)}</small>
            </div>

            <button
              class="view-product"
              onclick="openProduct(${Number(product.id)})"
            >
              View →
            </button>

          </div>
        </div>
      </article>
    `;
  }).join("");
}

// WISHLIST

function toggleWishlist(id) {
  const product = products.find(item => Number(item.id) === Number(id));

  if (!product) return;

  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(item => item !== id);
    showToast("Removed from your wishlist.");
  } else {
    wishlist.push(id);
    showToast("Added to your wishlist! ♥");
  }

  saveData();
  renderProducts();
}

function showWishlist() {
  wishlistOnly = true;
  activeCategory = "All";
  conditionFilter = "All";
  searchTerm = "";

  document.getElementById("searchInput").value = "";
  document.getElementById("conditionFilter").value = "All";

  document.querySelectorAll(".filter-chip").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "All"
    );
  });

  document.getElementById("marketplace").scrollIntoView({
    behavior: "smooth"
  });

  renderProducts();

  showToast("Showing your saved products ♥");
}

// CATEGORY FILTERS

document.querySelectorAll(".filter-chip").forEach(button => {
  button.addEventListener("click", () => {
    wishlistOnly = false;
    activeCategory = button.dataset.category;

    document.querySelectorAll(".filter-chip").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    renderProducts();
  });
});

// CATEGORY TILES

document.querySelectorAll(".category-tile").forEach(tile => {
  tile.addEventListener("click", () => {
    wishlistOnly = false;
    activeCategory = tile.dataset.category;

    document.querySelectorAll(".filter-chip").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.category === activeCategory
      );
    });

    document.getElementById("marketplace").scrollIntoView({
      behavior: "smooth"
    });

    renderProducts();
  });
});

// SEARCH

document.getElementById("searchInput").addEventListener("input", event => {
  wishlistOnly = false;
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});

// SORT

document.getElementById("sortSelect").addEventListener("change", event => {
  sortMode = event.target.value;
  renderProducts();
});

// CONDITION FILTER

document.getElementById("conditionFilter").addEventListener("change", event => {
  conditionFilter = event.target.value;
  renderProducts();
});

// RESET FILTERS

document.getElementById("resetFilters").addEventListener("click", () => {
  wishlistOnly = false;
  activeCategory = "All";
  searchTerm = "";
  conditionFilter = "All";
  sortMode = "newest";

  document.getElementById("searchInput").value = "";
  document.getElementById("conditionFilter").value = "All";
  document.getElementById("sortSelect").value = "newest";

  document.querySelectorAll(".filter-chip").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "All"
    );
  });

  renderProducts();
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

document.getElementById("sellNav").addEventListener("click", () => {
  openModal("sellModal");
});

document.getElementById("heroSellBtn").addEventListener("click", () => {
  openModal("sellModal");
});

document.getElementById("sellMarketBtn").addEventListener("click", () => {
  openModal("sellModal");
});

document.getElementById("wishlistNav").addEventListener("click", showWishlist);

document.getElementById("viewWishlistBtn").addEventListener("click", showWishlist);

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

// ADD NEW PRODUCT

document.getElementById("sellForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value;
  const condition = document.getElementById("productCondition").value;
  const price = Number(document.getElementById("productPrice").value);
  const originalPriceInput = document.getElementById("originalPrice").value;
  const originalPrice = originalPriceInput ? Number(originalPriceInput) : null;
  const seller = document.getElementById("sellerName").value.trim();
  const location = document.getElementById("sellerLocation").value.trim();
  const phone = document.getElementById("sellerPhone").value.trim();
  const description = document.getElementById("productDescription").value.trim();

  if (!/^[0-9]{10}$/.test(phone)) {
    showToast("Please enter a valid 10-digit phone number.");
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    showToast("Please enter a valid selling price.");
    return;
  }

  if (
    originalPrice !== null &&
    (!Number.isFinite(originalPrice) || originalPrice <= 0)
  ) {
    showToast("Please enter a valid original price.");
    return;
  }

  const newProduct = {
    id: Date.now(),
    name,
    category,
    emoji: ({
      "Books": "📚",
      "Electronics": "🎧",
      "Hostel Essentials": "🛏️",
      "Fashion": "👕",
      "Stationery": "✏️",
      "Other": "✨"
    })[category] || "📦",
    price,
    originalPrice,
    condition,
    seller,
    location,
    phone,
    description,
    created: Date.now()
  };

  products.unshift(newProduct);

  saveData();
  renderProducts();

  event.target.reset();
  closeModal("sellModal");

  wishlistOnly = false;
  activeCategory = "All";
  searchTerm = "";
  conditionFilter = "All";

  document.getElementById("searchInput").value = "";
  document.getElementById("conditionFilter").value = "All";

  document.querySelectorAll(".filter-chip").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "All"
    );
  });

  renderProducts();

  showToast("Your product is now listed! 🎉");

  document.getElementById("marketplace").scrollIntoView({
    behavior: "smooth"
  });
});

// PRODUCT DETAILS

function openProduct(id) {
  const product = products.find(item => Number(item.id) === Number(id));

  if (!product) {
    showToast("This product is no longer available.");
    return;
  }

  const safeClass = categoryClass[product.category] || "other";

  const discount = product.originalPrice &&
    product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  document.getElementById("detailsContent").innerHTML = `
    <span class="eyebrow">PRODUCT DETAILS</span>

    <div class="details-image product-image ${safeClass}">
      ${product.emoji || "📦"}
    </div>

    <span class="product-category">${escapeHTML(product.category)}</span>

    <h2>${escapeHTML(product.name)}</h2>

    <div class="details-price">
      ₹${Number(product.price).toLocaleString("en-IN")}
    </div>

    ${
      product.originalPrice
        ? `<p class="old-price">Original price: ₹${Number(product.originalPrice).toLocaleString("en-IN")}</p>`
        : ""
    }

    ${
      discount
        ? `<p class="discount">${discount}% below original price</p>`
        : ""
    }

    <p class="details-description">
      ${escapeHTML(product.description || "No additional description provided. Contact the seller for more details.")}
    </p>

    <div class="details-info">
      <div>
        <span>SELLER</span>
        <strong>${escapeHTML(product.seller)}</strong>
      </div>

      <div>
        <span>LOCATION</span>
        <strong>${escapeHTML(product.location)}</strong>
      </div>

      <div>
        <span>CONDITION</span>
        <strong>${escapeHTML(product.condition)}</strong>
      </div>

      <div>
        <span>CATEGORY</span>
        <strong>${escapeHTML(product.category)}</strong>
      </div>
    </div>

    <div class="details-actions">

      <a class="btn btn-dark"
         href="tel:${encodeURIComponent(product.phone)}">
         📞 Contact seller
      </a>

      <button
        class="btn btn-outline"
        onclick="toggleWishlist(${Number(product.id)}); openProduct(${Number(product.id)})"
      >
        ${wishlist.includes(product.id) ? "♥ Saved" : "♡ Wishlist"}
      </button>

      ${
        product.created > 8
          ? `<button class="btn btn-outline" onclick="removeProduct(${Number(product.id)})">Remove listing</button>`
          : ""
      }

    </div>
  `;

  openModal("detailsModal");
}

// REMOVE USER LISTING

function removeProduct(id) {
  const confirmed = confirm("Are you sure you want to remove this listing?");

  if (!confirmed) return;

  products = products.filter(product => Number(product.id) !== Number(id));
  wishlist = wishlist.filter(item => Number(item) !== Number(id));

  saveData();
  renderProducts();
  closeModal("detailsModal");

  showToast("Your product listing has been removed.");
}

// INITIAL RENDER

renderProducts();