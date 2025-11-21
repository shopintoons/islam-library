let books = [];
let currentCategoryId = null;
let deferredInstallPrompt = null;

// Tes 3 catégories
const categories = [
  { id: "coran",  name: "Coran",               image: "assets/cat-coran.jpg" },
  { id: "livres", name: "Livres islamiques",   image: "assets/cat-livres.jpg" },
  { id: "doua",   name: "Doua & invocations", image: "assets/cat-doua.jpg" }
];

async function loadBooks() {
  try {
    const res = await fetch("books.json");
    books = await res.json();
    renderCategories();
  } catch (err) {
    console.error("Erreur chargement books.json", err);
    document.getElementById("categoriesContainer").innerHTML =
      "<p>Erreur lors du chargement des livres.</p>";
  }
}

// Affiche les 3 grosses cartes catégories
function renderCategories() {
  const container = document.getElementById("categoriesContainer");
  container.innerHTML = "";

  categories.forEach(cat => {
    const count = books.filter(b => b.category === cat.id).length;
    const card = document.createElement("div");
    card.className = "category-card";

    card.innerHTML = `
      <div class="category-bg" style="background-image:url('${cat.image}')">
        <div class="category-top">
          <span class="category-badge">${count} ${count > 1 ? "livres" : "livre"}</span>
        </div>
        <div class="category-center">
          <h2>${cat.name}</h2>
        </div>
      </div>
    `;

    card.addEventListener("click", () => openCategory(cat.id));
    container.appendChild(card);
  });
}

// Ouvrir une catégorie
function openCategory(catId) {
  currentCategoryId = catId;

  const cat = categories.find(c => c.id === catId);
  const section = document.getElementById("booksSection");
  const titleEl = document.getElementById("booksTitle");
  const searchInput = document.getElementById("bookSearchInput");

  const list = books.filter(b => b.category === catId);

  titleEl.textContent = cat ? cat.name : "Livres";
  renderBooks(list);

  if (searchInput) {
    searchInput.value = "";
  }

  section.classList.remove("hidden");
  section.scrollIntoView({ behavior: "smooth" });
}

// Afficher les livres d'une catégorie
function renderBooks(list) {
  const container = document.getElementById("booksContainer");
  container.innerHTML = "";

  if (!list || list.length === 0) {
    container.innerHTML = "<p>Aucun livre dans cette catégorie pour l’instant.</p>";
    return;
  }

  list.forEach(book => {
    const div = document.createElement("div");
    div.className = "book-card";

    const coverSrc = book.cover || "assets/default-cover.jpg";

    div.innerHTML = `
      <img src="${coverSrc}" alt="Couverture de ${book.title}" class="book-cover">
      <h3>${book.title}</h3>
      <div class="book-meta">
        <div>Auteur : ${book.author || "Inconnu"}</div>
        <div>Langue : ${book.language || "-"}</div>
        <div>Format : ${book.format || "-"}</div>
      </div>
      <a href="#" class="open-book">📖 Ouvrir le livre</a>
    `;

    const img = div.querySelector(".book-cover");
    const link = div.querySelector(".open-book");

    const handler = (e) => {
      e.preventDefault();
      openPdf(book.url);
    };

    if (img)  img.addEventListener("click", handler);
    if (link) link.addEventListener("click", handler);

    container.appendChild(div);
  });
}

// Bouton retour aux catégories
function setupBackButton() {
  const btn = document.getElementById("backToCategories");
  const section = document.getElementById("booksSection");

  if (!btn || !section) return;

  btn.addEventListener("click", () => {
    section.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Recherche dans les livres d'une catégorie
function setupSearchBooks() {
  const searchInput = document.getElementById("bookSearchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();

    if (!currentCategoryId) return;

    const list = books.filter(b => {
      if (b.category !== currentCategoryId) return false;

      const title = (b.title || "").toLowerCase();
      const author = (b.author || "").toLowerCase();

      if (!q) return true;
      return title.includes(q) || author.includes(q);
    });

    renderBooks(list);
  });
}

// === LECTEUR PDF ===
// === LECTEUR PDF ===
function openPdf(url) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 📱 Sur mobile : ouvrir directement dans un nouvel onglet (lecteur natif)
  if (isMobile) {
    window.open(url, "_blank");
    return;
  }

  // 💻 Sur ordinateur : utiliser le lecteur intégré
  const viewer = document.getElementById("pdfViewer");
  const frame = document.getElementById("pdfFrame");

  if (!viewer || !frame) {
    window.open(url, "_blank");
    return;
  }

  frame.src = url;
  viewer.classList.remove("hidden");
}

function setupPdfClose() {
  const btn = document.getElementById("closePdf");
  const viewer = document.getElementById("pdfViewer");
  const frame = document.getElementById("pdfFrame");

  if (!btn || !viewer || !frame) return;

  btn.addEventListener("click", () => {
    frame.src = "";
    viewer.classList.add("hidden");
  });
}

// === MENU DU BAS ===
function setupBottomNav() {
  const buttons = document.querySelectorAll(".bottom-nav .nav-btn");
  const categoriesSection = document.getElementById("categoriesSection");
  const aboutSection = document.getElementById("aboutSection");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (action === "categories" && categoriesSection) {
        categoriesSection.scrollIntoView({ behavior: "smooth" });
      } else if (action === "about" && aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // activer Catégories par défaut
  const first = document.querySelector('.bottom-nav .nav-btn[data-action="categories"]');
  if (first) first.classList.add("active");
}

// === PWA : INSTALLATION ===
function setupPwaInstall() {
  const installBtn = document.getElementById("installBtn");
  if (!installBtn) return;

  // On attend l'événement beforeinstallprompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installBtn.disabled = false;
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log("Résultat installation PWA :", outcome);
    deferredInstallPrompt = null;
    installBtn.disabled = true;
  });
}

// === PWA : SERVICE WORKER ===
function setupServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("service-worker.js")
        .then(() => console.log("Service worker enregistré"))
        .catch(err => console.error("Erreur SW:", err));
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  setupBackButton();
  setupSearchBooks();
  setupPdfClose();
  setupBottomNav();
  setupPwaInstall();
  setupServiceWorker();
});
