// ==========================================
// MOTEUR PAGE ACCUEIL & BRAWLERS (index.js)
// ==========================================

const appContent = document.getElementById('app-content');
const db = { brawlers: null };

// État global pour la recherche et les filtres
const brawlersState = {
    search: '',
    sortBy: 'id', // 'id', 'name', 'rarity', 'class'
    sortAsc: true,
    filters: {
        classes: new Set(),
        rarities: new Set()
    }
};

// Ordre hiérarchique des raretés pour le tri
const RARITY_ORDER = {
    'brawler de départ': 1, 'starting': 1,
    'rare': 2,
    'super rare': 3, 'super-rare': 3,
    'épique': 4, 'epic': 4,
    'mythique': 5, 'mythic': 5,
    'légendaire': 6, 'legendary': 6
};

// Fonction utilitaire pour charger les JSON
async function fetchJSON(file) {
    try {
        const response = await fetch(`data/${file}`);
        return await response.json();
    } catch (error) {
        console.error(`Erreur de chargement de ${file}:`, error);
        return {};
    }
}

// Fonction utilitaire pour choisir la bonne couleur selon la rareté
function getRarityClass(rarity) {
    if (!rarity) return 'badge-premium';
    const r = rarity.toLowerCase();
    if (r.includes('départ') || r.includes('starting')) return 'badge-starting';
    if (r.includes('super rare') || r.includes('super-rare')) return 'badge-super-rare';
    if (r.includes('rare')) return 'badge-rare';
    if (r.includes('épique') || r.includes('epic')) return 'badge-epic';
    if (r.includes('mythique') || r.includes('mythic')) return 'badge-mythic';
    if (r.includes('légendaire') || r.includes('legendary')) return 'badge-legendary';
    return 'badge-premium';
}

function getRarityValue(rarity) {
    if (!rarity) return 99;
    const r = rarity.toLowerCase();
    for (const [key, val] of Object.entries(RARITY_ORDER)) {
        if (r.includes(key)) return val;
    }
    return 99;
}

// Initialisation de l'application
async function initApp() {
    db.brawlers = await fetchJSON('brawlers.json');
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'home';

    if (page === 'brawlers') {
        renderBrawlersPageLayout(); // On affiche la structure de base (Barre de recherche)
        updateBrawlersGrid();       // On injecte les brawlers filtrés
    } else {
        renderHome();
    }
}

// ==========================================
// VUES (RENDU HTML)
// ==========================================

function renderHome() {
    appContent.innerHTML = `
        <h1>Bienvenue sur BrawlOpédia</h1>
        <p>Sélectionnez une catégorie ci-dessous pour commencer.</p>
        
        <div class="category-grid">
            <div class="category-card" onclick="window.location.href='?page=brawlers'">
                <h2 style="color: #00d2ff;">🥊 Brawlers</h2>
                <p>Découvrez les stats, gadgets et pouvoirs de tous les personnages du jeu.</p>
            </div>
            
            <div class="category-card" style="opacity: 0.5; cursor: not-allowed;" title="Bientôt disponible">
                <h2 style="color: #ffce00;">🗺️ Modes & Maps</h2>
                <p>Informations sur les rotations et règles des événements.</p>
            </div>
        </div>
    `;
}

// === NOUVEAU MOTEUR DE GRILLE BRAWLERS ===

// 1. Affiche l'interface (Barre de recherche, filtres)
function renderBrawlersPageLayout() {
    // Récupérer toutes les classes et raretés uniques pour créer les filtres dynamiquement
    const classes = [...new Set(Object.values(db.brawlers).map(b => b.class))].filter(Boolean).sort();
    const rarities = [...new Set(Object.values(db.brawlers).map(b => b.rarity))].filter(Boolean).sort((a,b) => getRarityValue(a) - getRarityValue(b));

    // Génération du HTML des cases à cocher
    let filtersHtml = `
        <div class="filter-group">
            <h4>Classes</h4>
            ${classes.map(c => `<label><input type="checkbox" value="${c}" data-type="class"> ${c}</label>`).join('')}
        </div>
        <div class="filter-group">
            <h4>Raretés</h4>
            ${rarities.map(r => `<label><input type="checkbox" value="${r}" data-type="rarity"> ${r}</label>`).join('')}
        </div>
    `;

    appContent.innerHTML = `
        <div class="wiki-btn-back">
            <button class="btn-back" onclick="window.location.href='index.html'">⬅ Retour aux Catégories</button>
        </div>
        <h1>Sélectionnez un Brawler</h1>
        
        <div class="wiki-controls-bar">
            <input type="text" id="brawler-search" placeholder="Rechercher par nom..." class="wiki-input">
            
            <select id="brawler-sort" class="wiki-select">
                <option value="id">Trier par : Défaut</option>
                <option value="name">Trier par : Ordre Alphabétique</option>
                <option value="rarity">Trier par : Rareté</option>
                <option value="class">Trier par : Classe</option>
            </select>

            <button id="brawler-order-btn" class="wiki-btn-icon" title="Ordre Croissant/Décroissant">▲</button>

            <div class="wiki-dropdown">
                <button id="brawler-filter-btn" class="wiki-btn">Filtres ▼</button>
                <div id="wiki-filter-menu" class="wiki-dropdown-menu hidden">
                    ${filtersHtml}
                </div>
            </div>
        </div>

        <div id="brawlers-grid-container" class="brawlers-grid"></div>
    `;

    // ÉCOUTEURS D'ÉVÉNEMENTS
    document.getElementById('brawler-search').addEventListener('input', (e) => {
        brawlersState.search = e.target.value;
        updateBrawlersGrid();
    });

    document.getElementById('brawler-sort').addEventListener('change', (e) => {
        brawlersState.sortBy = e.target.value;
        updateBrawlersGrid();
    });

    document.getElementById('brawler-order-btn').addEventListener('click', (e) => {
        brawlersState.sortAsc = !brawlersState.sortAsc;
        e.target.textContent = brawlersState.sortAsc ? '▲' : '▼';
        updateBrawlersGrid();
    });

    document.getElementById('brawler-filter-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Évite que le clic ferme immédiatement le menu
        document.getElementById('wiki-filter-menu').classList.toggle('hidden');
    });

    // Écouteurs pour les cases à cocher
    document.querySelectorAll('#wiki-filter-menu input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const type = e.target.getAttribute('data-type');
            const val = e.target.value;
            const set = type === 'class' ? brawlersState.filters.classes : brawlersState.filters.rarities;
            
            if (e.target.checked) set.add(val);
            else set.delete(val);
            
            updateBrawlersGrid();
        });
    });
    
    // Fermer le menu déroulant si on clique ailleurs
    document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.wiki-dropdown');
        const menu = document.getElementById('wiki-filter-menu');
        if (dropdown && !dropdown.contains(e.target) && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    });
}

// 2. Traite les données (Filtre + Tri) et met à jour l'affichage
function updateBrawlersGrid() {
    const container = document.getElementById('brawlers-grid-container');
    
    // Convertir l'objet JSON en tableau pour le tri et filtrage
    let list = Object.entries(db.brawlers).map(([id, data]) => ({ id, ...data }));

    // --- FILTRAGE ---
    list = list.filter(b => {
        // Recherche par nom
        if (brawlersState.search && !b.name.toLowerCase().includes(brawlersState.search.toLowerCase())) return false;
        // Filtres de classes
        if (brawlersState.filters.classes.size > 0 && !brawlersState.filters.classes.has(b.class)) return false;
        // Filtres de raretés
        if (brawlersState.filters.rarities.size > 0 && !brawlersState.filters.rarities.has(b.rarity)) return false;
        
        return true;
    });

    // --- TRI ---
    list.sort((a, b) => {
        let res = 0;
        if (brawlersState.sortBy === 'name') {
            res = a.name.localeCompare(b.name);
        } else if (brawlersState.sortBy === 'rarity') {
            res = getRarityValue(a.rarity) - getRarityValue(b.rarity);
            if (res === 0) res = a.id.localeCompare(b.id); // Si même rareté, tri par ID
        } else if (brawlersState.sortBy === 'class') {
            res = a.class.localeCompare(b.class);
            if (res === 0) res = getRarityValue(a.rarity) - getRarityValue(b.rarity); // Si même classe, tri par rareté
            if (res === 0) res = a.id.localeCompare(b.id);
        } else {
            res = a.id.localeCompare(b.id); // Tri par défaut (ID)
        }
        return brawlersState.sortAsc ? res : -res;
    });

    // --- GÉNÉRATION HTML ---
    if (list.length === 0) {
        container.innerHTML = `<p style="width: 100%; text-align: center; color: #aaa; margin-top: 40px;">Aucun brawler ne correspond à votre recherche.</p>`;
        return;
    }

    let html = '';
    list.forEach(brawler => {
        const rarityClass = getRarityClass(brawler.rarity);
        const borderClass = rarityClass.replace('badge-', 'border-');
        
        html += `
            <div class="brawler-list-card" onclick="window.location.href='brawler.html?id=${brawler.id}'">
                <img src="${brawler.image || 'images/ui/placeholder.png'}" alt="${brawler.name}" class="${borderClass}" onerror="this.src='https://via.placeholder.com/64x64?text=?'; this.classList.remove('${borderClass}')">
                <div class="brawler-list-info">
                    <h3>${brawler.name}</h3>
                    <div class="badges-row">
                        <span class="badge badge-basic">${brawler.class}</span>
                        <span class="badge ${rarityClass}">${brawler.rarity}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Lancement au chargement de la page
window.addEventListener('DOMContentLoaded', initApp);
