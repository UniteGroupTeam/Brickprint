import { products } from './products.js';

// Elements
const grid = document.getElementById('product-grid');
const trendingGrid = document.getElementById('trending-grid');
const modal = document.getElementById('product-modal');
const desktopCats = document.getElementById('desktop-categories');
const mobileCats = document.getElementById('mobile-categories');
const searchInput = document.getElementById('search-input');
const mobileSearchInput = document.getElementById('mobile-search-input');
const pageTitle = document.getElementById('page-title');
const body = document.getElementById('catalog-body');

// State
let state = {
    category: 'All',
    search: '',
    cart: []
};

// Utils
const formatPrice = (price) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check URL Params
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    const idParam = urlParams.get('id');

    // Index Page specific
    if (trendingGrid) {
        renderTrending();
    }

    // Catalog Page specific
    if (grid) {
        renderFilters();

        if (catParam) {
            handleFilter(catParam);
        } else {
            renderGrid(products);
        }

        if (idParam) {
            const product = products.find(p => p.id === idParam);
            if (product) openProductModal(product);
        }

        // Listeners
        if (searchInput) searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
        if (mobileSearchInput) mobileSearchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }
});

// Render Home Trending
function renderTrending() {
    // Pick 4 random or top items
    const trending = products.slice(0, 4);
    trendingGrid.innerHTML = trending.map(product => `
        <div class="bg-[#1e1e1e] rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300" onclick="window.location.href='catalogo.html?id=${product.id}'">
            <div class="h-48 overflow-hidden relative">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500 bg-white/5">
                <div class="absolute top-2 right-2 bg-lego-yellow text-black text-xs font-bold px-2 py-1 rounded">HOT</div>
            </div>
            <div class="p-4">
                <p class="text-xs text-gray-400 mb-1">${product.category}</p>
                <h3 class="font-bold text-white mb-2 truncate">${product.name}</h3>
                <div class="flex justify-between items-center">
                    <span class="text-lego-yellow font-bold">${formatPrice(product.price)}</span>
                    <button class="bg-white/10 p-2 rounded-full hover:bg-lego-red hover:text-white transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render Catalog Grid
function renderGrid(items) {
    if (!grid) return;

    grid.innerHTML = items.map(product => `
        <div class="bg-[#1E1E1E] border border-white/5 rounded-2xl overflow-hidden hover:border-lego-yellow/50 transition-all duration-300 group flex flex-col" onclick="handleCardClick('${product.id}')">
            <div class="relative h-48 md:h-64 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center p-6">
                <img src="${product.image}" loading="lazy" class="max-w-full max-h-full object-contain filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <span class="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-white/10">${product.category}</span>
            </div>
            <div class="p-4 md:p-6 flex-1 flex flex-col">
                <h3 class="text-lg font-bold mb-2 leading-tight group-hover:text-lego-yellow transition-colors">${product.name}</h3>
                <p class="text-gray-400 text-sm line-clamp-2 flex-1 mb-4">${product.description}</p>
                <div class="flex items-center justify-between mt-auto">
                    <div>
                        <span class="block text-xs text-gray-500">Precio</span>
                        <span class="text-xl font-bold text-white">${formatPrice(product.price)}</span>
                    </div>
                    <button class="w-10 h-10 rounded-full ${product.buttonColor} flex items-center justify-center text-white shadow-lg transform active:scale-95 transition-all">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    const count = document.getElementById('result-count');
    if (count) count.innerText = `Mostrando ${items.length} sets increíbles`;
}

// Global scope wrapper for click handlers
window.handleCardClick = (id) => {
    const product = products.find(p => p.id === id);
    if (product) openProductModal(product);
};

// Render Filters
function renderFilters() {
    if (!desktopCats) return;
    const categories = ['All', ...new Set(products.map(p => p.category))];

    const html = categories.map(cat => `
        <label class="flex items-center space-x-3 cursor-pointer group checkbox-wrapper">
            <input type="radio" name="category" value="${cat}" class="hidden peer" onchange="handleFilter('${cat}')" ${cat === state.category ? 'checked' : ''}>
            <div class="w-5 h-5 border-2 border-gray-600 rounded-md peer-checked:bg-lego-red peer-checked:border-lego-red transition-all"></div>
            <span class="text-gray-400 group-hover:text-white transition-colors capitalize">${cat}</span>
        </label>
    `).join('');

    desktopCats.innerHTML = html;
    if (mobileCats) mobileCats.innerHTML = html;
}

// Logic
window.handleFilter = (cat) => {
    state.category = cat;
    let filtered = products;

    if (cat !== 'All') {
        filtered = products.filter(p => p.category === cat);
        // Apply Theme
        applyTheme(cat);
        pageTitle.innerText = `Colección ${cat}`;
    } else {
        resetTheme();
        pageTitle.innerText = 'Todos los Sets';
    }

    renderGrid(filtered);

    // Update Radio UI check state manually for visual sync
    document.querySelectorAll(`input[name="category"][value="${cat}"]`).forEach(el => el.checked = true);
};

function handleSearch(query) {
    state.search = query.toLowerCase();
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(state.search) ||
        p.description.toLowerCase().includes(state.search) ||
        p.category.toLowerCase().includes(state.search)
    );
    renderGrid(filtered);
}

function applyTheme(cat) {
    if (!body) return;
    // Reset
    body.className = "bg-dark-bg text-white min-h-screen flex flex-col transition-colors duration-700";

    const themeMap = {
        'Star Wars': 'theme-starwars',
        'Botanical': 'theme-botanical',
        'Icons': 'bg-[#1c1917]', // Stone
        'Marvel': 'theme-marvel',
        'Disney': 'theme-disney',
        'Technic': 'bg-slate-900',
        'Ideas': 'bg-teal-950',
    };

    if (themeMap[cat]) {
        body.classList.add(...themeMap[cat].split(' '));
    }
}

function resetTheme() {
    if (body) body.className = "bg-dark-bg text-white min-h-screen flex flex-col transition-colors duration-700";
}

// Modal Logic
function openProductModal(product) {
    if (!modal) return;

    // Dynamic Copywriting based on Role (Parent vs AFOL)
    // We display BOTH angles to be persuasive.

    modal.innerHTML = `
        <div class="w-full h-full md:p-8 flex items-center justify-center relative">
            <button class="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full hover:bg-white/20 text-white" onclick="closeModal()">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div class="bg-[#121212] w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] md:rounded-3xl shadow-2xl overflow-y-auto flex flex-col md:flex-row relative">
                 <!-- Image Section -->
                 <div class="w-full md:w-1/2 p-8 bg-gradient-to-br ${product.themeColor || 'from-gray-800 to-black'} flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <img src="${product.image}" class="max-w-full max-h-[50vh] object-contain drop-shadow-2xl z-10 animate-fade-in-up">
                 </div>

                 <!-- Content Section -->
                 <div class="w-full md:w-1/2 p-6 md:p-10 flex flex-col">
                    <div class="mb-6">
                        <span class="inline-block py-1 px-3 rounded text-xs font-bold bg-white/10 text-lego-yellow mb-2 tracking-widest uppercase">${product.category}</span>
                        <h2 class="text-3xl md:text-5xl font-extrabold leading-tight mb-2">${product.name}</h2>
                        <span class="text-xs text-gray-500 font-mono">ID: ${product.id}</span>
                    </div>

                    <div class="flex items-end gap-4 mb-8">
                        <span class="text-4xl font-bold text-white">${formatPrice(product.price)}</span>
                        <span class="text-sm text-green-400 mb-2 flex items-center gap-1">
                             <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                             Disponible
                        </span>
                    </div>

                    <div class="space-y-6 mb-8 flex-1">
                        <div>
                            <h3 class="font-bold text-lg mb-2 text-white/90 flex items-center gap-2">
                                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                ¿Por qué este set es único?
                            </h3>
                            <p class="text-gray-300 leading-relaxed">${product.description}</p>
                        </div>
                        
                        <div class="bg-white/5 p-4 rounded-xl border border-white/5">
                            <h4 class="font-bold text-lego-yellow mb-2 text-sm uppercase">Experto en LEGO dice:</h4>
                            <p class="text-sm text-gray-400 italic">"Este set ${product.id} no es solo un juguete, es una pieza de inversión. Su diseño detallado en la categoría ${product.category} asegura horas de construcción inmersiva. Perfecto para desconectar del estrés digital."</p>
                        </div>
                    </div>

                    <div class="flex gap-4 mt-auto">
                        <button class="flex-1 py-4 bg-lego-red hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-lego-red/20 text-lg flex items-center justify-center gap-2" onclick="addToCart('${product.id}')">
                            Agregar al Carrito
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        </button>
                        <button class="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    `;

    // Animate In using requestAnimationFrame to ensure CSS transition works
    modal.classList.remove('translate-y-full');
}

window.closeModal = () => {
    modal.classList.add('translate-y-full');
    // Clear URL param? Optional.
    // window.history.pushState({}, '', window.location.pathname);
}

window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    alert(`${product.name} agregado al carrito! (Simulación)`);
}
