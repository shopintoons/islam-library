let books = [];
let currentCategoryId = null;

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

// Ouvrir une catégorie : afficher les livres dessous
function openCategory(catId) {
  currentCategoryId = catId;

  const cat = categories.find(c => c.id === catId);
  const section = document.getElementById("booksSection");
  const titleEl = document.getElementById("booksTitle");
  const searchInput = document.getElementById("bookSearchInput");

  const filtered = books.filter(b => b.category === catId);

  titleEl.textContent = cat ? cat.name : "Livres";
  renderBooks(filtered);

  // on vide la recherche quand on change de catégorie
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
      <img src="${coverSrc}" class="book-cover" onclick="openPdf('${book.url}')">

      <h3>${book.title}</h3>
      <div class="book-meta">
        <div>Auteur : ${book.author || "Inconnu"}</div>
        <div>Langue : ${book.language || "-"}</div>
        <div>Format : ${book.format || "-"}</div>
      </div>
      <a href="#" onclick="openPdf('${book.url}')">📖 Ouvrir le livre</a>

    `;

    container.appendChild(div);
  });
}

// Bouton retour aux catégories
function setupBackButton() {
  const btn = document.getElementById("backToCategories");
  const section = document.getElementById("booksSection");

  btn.addEventListener("click", () => {
    section.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// 🔍 Recherche dans les livres d'une catégorie
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

document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  setupBackButton();
  setupSearchBooks();
});
// === OUVERTURE DU PDF DANS LE LECTEUR INTÉGRÉ ===
function openPdf(url) {
  const viewer = document.getElementById("pdfViewer");
  const frame = document.getElementById("pdfFrame");

  frame.src = url;
  viewer.classList.remove("hidden");
}

// === FERMETURE DU LECTEUR PDF ===
document.getElementById("closePdf").addEventListener("click", () => {
  const viewer = document.getElementById("pdfViewer");
  const frame = document.getElementById("pdfFrame");

  frame.src = "";
  viewer.classList.add("hidden");
});
