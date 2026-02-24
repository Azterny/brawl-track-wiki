// ==========================================
// MOTEUR PAGE ACCUEIL & BRAWLERS (index.js)
// ==========================================

const appContent = document.getElementById('app-content');
const db = { brawlers: null };

// État global pour la recherche et les filtres
const brawlersState = {
    search: '',
    sortBy: 'id', // 'id', 'name', 'rarity', 'class', 'date_added', 'hp'
    sortAsc: true,
    filters: {
        classes: new Set(),
        rarities: new Set(),
        hpMin: null,
        hpMax: null,
        speedMin: null
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

// Couleurs pour les en-têtes de groupe
const RARITY_COLORS = {
    'Brawler de départ': '#54c8f9',
    'Rare': '#28a745',
    'Super Rare': '#007bff',
    'Épique': '#8a2be2',
    'Mythique': '#dc3545',
    'Légendaire': '#ffce00'
};

const CLASS_COLORS = {
    'Dégâts': '#ff6b6b',
    'Tank': '#4ecdc4',
    'Tireur d\'élite': '#45b7d1',
    'Artilleur': '#f7dc6f',
    'Contrôleur': '#a8d8ea',
    'Soutien': '#98fb98',
    'Assassin': '#da70d6'
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

// Formatte une date "YYYY-MM" en "Mois YYYY"
function formatDate(dateStr) {
    if (!dateStr) return 'Inconnue';
    const months = ['Jan.', 'Fév.', 'Mar.', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sep.', 'Oct.', 'Nov.', 'Déc.'];
    const [year, month] = dateStr.split('-');
    return `${months[parseInt(month) - 1]} ${year}`;
}

// Formatte la vitesse en label lisible
function formatSpeed(speed) {
    if (!speed) return 'Normale';
    if (speed <= 660) return 'Très lente';
    if (speed <= 690) return 'Lente';
    if (speed <= 750) return 'Normale';
    if (speed <= 820) return 'Rapide';
    return 'Très rapide';
}

// Génère la "pill" extra à afficher sous le nom selon le mode de tri
function getBrawlerExtraHtml(brawler, sortBy) {
    if (sortBy === 'date_added' && brawler.date_added) {
        return `
            <div class="brawler-extra-date">
                <span class="extra-icon">🗓</span>
                <span>${formatDate(brawler.date_added)}</span>
            </div>
        `;
    }
    if (sortBy === 'hp' && brawler.hp) {
        return `
            <div class="brawler-hp-table">
                <div class="hp-row">
                    <span class="hp-label">❤️ PV</span>
                    <span class="hp-cell hp-p1"><span class="hp-tier">P1</span>${brawler.hp.p1.toLocaleString('fr-FR')}</span>
                    <span class="hp-sep">→</span>
                    <span class="hp-cell hp-p11"><span class="hp-tier">P11</span>${brawler.hp.p11.toLocaleString('fr-FR')}</span>
                </div>
            </div>
        `;
    }
    if (sortBy === 'speed' && brawler.speed) {
        const label = formatSpeed(brawler.speed);
        const speedClass = `speed-${label.toLowerCase().replace(' ', '-').replace('è', 'e').replace('à', 'a')}`;
        return `
            <div class="brawler-extra-speed ${speedClass}">
                <span class="extra-icon">💨</span>
                <span>${label} (${brawler.speed})</span>
            </div>
        `;
    }
    if (sortBy === 'range' && brawler.range) {
        return `
            <div class="brawler-extra-range">
                <span class="extra-icon">🎯</span>
                <span>${brawler.range} tuiles</span>
            </div>
        `;
    }
    return '';
}

// Initialisation de l'application
async function initApp() {
    db.brawlers = await fetchJSON('brawlers.json');
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'home';

    if (page === 'brawlers') {
        renderBrawlersPageLayout();
        updateBrawlersGrid();
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

// === MOTEUR DE GRILLE BRAWLERS ===

function renderBrawlersPageLayout() {
    const classes = [...new Set(Object.values(db.brawlers).map(b => b.class))].filter(Boolean).sort();
    const rarities = [...new Set(Object.values(db.brawlers).map(b => b.rarity))].filter(Boolean).sort((a, b) => getRarityValue(a) - getRarityValue(b));

    let filtersHtml = `
        <div class="filter-group">
            <h4>Classes</h4>
            ${classes.map(c => `<label><input type="checkbox" value="${c}" data-type="class"> ${c}</label>`).join('')}
        </div>
        <div class="filter-group">
            <h4>Raretés</h4>
            ${rarities.map(r => `<label><input type="checkbox" value="${r}" data-type="rarity"> ${r}</label>`).join('')}
        </div>
        <div class="filter-group">
            <h4>PV minimum (P1)</h4>
            <div class="filter-range-row">
                <input type="range" id="filter-hp-min" min="0" max="7000" step="200" value="0" class="filter-range">
                <span id="filter-hp-min-label" class="filter-range-label">Tous</span>
            </div>
        </div>
        <div class="filter-group">
            <h4>Vitesse minimum</h4>
            <div class="filter-range-row">
                <input type="range" id="filter-speed-min" min="640" max="900" step="10" value="640" class="filter-range">
                <span id="filter-speed-min-label" class="filter-range-label">Toutes</span>
            </div>
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
                <option value="date_added">Trier par : Date d'ajout</option>
                <option value="hp">Trier par : PV (P1)</option>
                <option value="speed">Trier par : Vitesse</option>
                <option value="range">Trier par : Portée</option>
            </select>

            <button id="brawler-order-btn" class="wiki-btn-icon" title="Ordre Croissant/Décroissant">▲</button>

            <div class="wiki-dropdown">
                <button id="brawler-filter-btn" class="wiki-btn">Filtres ▼</button>
                <div id="wiki-filter-menu" class="wiki-dropdown-menu hidden">
                    ${filtersHtml}
                    <button id="filter-reset-btn" class="wiki-btn filter-reset-btn">🔄 Réinitialiser les filtres</button>
                </div>
            </div>
        </div>

        <div id="brawlers-count" class="brawlers-count"></div>
        <div id="brawlers-grid-container"></div>
    `;

    // === ÉCOUTEURS D'ÉVÉNEMENTS ===

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
        e.stopPropagation();
        document.getElementById('wiki-filter-menu').classList.toggle('hidden');
    });

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

    const hpRange = document.getElementById('filter-hp-min');
    const hpLabel = document.getElementById('filter-hp-min-label');
    hpRange.addEventListener('input', () => {
        const val = parseInt(hpRange.value);
        brawlersState.filters.hpMin = val > 0 ? val : null;
        hpLabel.textContent = val > 0 ? `≥ ${val.toLocaleString('fr-FR')} PV` : 'Tous';
        updateBrawlersGrid();
    });

    const speedRange = document.getElementById('filter-speed-min');
    const speedLabel = document.getElementById('filter-speed-min-label');
    speedRange.addEventListener('input', () => {
        const val = parseInt(speedRange.value);
        brawlersState.filters.speedMin = val > 640 ? val : null;
        speedLabel.textContent = val > 640 ? `≥ ${val}` : 'Toutes';
        updateBrawlersGrid();
    });

    document.getElementById('filter-reset-btn').addEventListener('click', () => {
        brawlersState.filters.classes.clear();
        brawlersState.filters.rarities.clear();
        brawlersState.filters.hpMin = null;
        brawlersState.filters.speedMin = null;
        document.querySelectorAll('#wiki-filter-menu input[type="checkbox"]').forEach(cb => cb.checked = false);
        hpRange.value = 0;
        hpLabel.textContent = 'Tous';
        speedRange.value = 640;
        speedLabel.textContent = 'Toutes';
        updateBrawlersGrid();
    });

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
    const countEl = document.getElementById('brawlers-count');

    let list = Object.entries(db.brawlers).map(([id, data], index) => ({ id, _order: index, ...data }));

    // --- FILTRAGE ---
    list = list.filter(b => {
        if (brawlersState.search && !b.name.toLowerCase().includes(brawlersState.search.toLowerCase())) return false;
        if (brawlersState.filters.classes.size > 0 && !brawlersState.filters.classes.has(b.class)) return false;
        if (brawlersState.filters.rarities.size > 0 && !brawlersState.filters.rarities.has(b.rarity)) return false;
        if (brawlersState.filters.hpMin !== null && b.hp && b.hp.p1 < brawlersState.filters.hpMin) return false;
        if (brawlersState.filters.speedMin !== null && b.speed && b.speed < brawlersState.filters.speedMin) return false;
        return true;
    });

    // --- TRI ---
    list.sort((a, b) => {
        let res = 0;
        if (brawlersState.sortBy === 'name') {
            res = a.name.localeCompare(b.name, 'fr');
        } else if (brawlersState.sortBy === 'rarity') {
            res = getRarityValue(a.rarity) - getRarityValue(b.rarity);
            if (res === 0) res = a.name.localeCompare(b.name, 'fr');
        } else if (brawlersState.sortBy === 'class') {
            res = (a.class || '').localeCompare(b.class || '', 'fr');
            if (res === 0) res = getRarityValue(a.rarity) - getRarityValue(b.rarity);
            if (res === 0) res = a.name.localeCompare(b.name, 'fr');
        } else if (brawlersState.sortBy === 'date_added') {
            const da = a.date_added || '0000-00';
            const db2 = b.date_added || '0000-00';
            res = da.localeCompare(db2);
        } else if (brawlersState.sortBy === 'hp') {
            const ha = (a.hp && a.hp.p1) || 0;
            const hb = (b.hp && b.hp.p1) || 0;
            res = ha - hb;
        } else if (brawlersState.sortBy === 'speed') {
            res = (a.speed || 0) - (b.speed || 0);
        } else if (brawlersState.sortBy === 'range') {
            res = (a.range || 0) - (b.range || 0);
        } else {
            res = a._order - b._order;
        }
        return brawlersState.sortAsc ? res : -res;
    });

    // Compteur
    if (countEl) {
        countEl.textContent = list.length === 0 ? '' : `${list.length} brawler${list.length > 1 ? 's' : ''} trouvé${list.length > 1 ? 's' : ''}`;
    }

    if (list.length === 0) {
        container.innerHTML = `<p style="width:100%;text-align:center;color:#aaa;margin-top:40px;">Aucun brawler ne correspond à votre recherche.</p>`;
        return;
    }

    // --- GÉNÉRATION HTML ---
    const useGroups = ['rarity', 'class'].includes(brawlersState.sortBy);

    if (useGroups) {
        renderGroupedGrid(container, list);
    } else {
        renderFlatGrid(container, list);
    }
}

function renderFlatGrid(container, list) {
    const sortBy = brawlersState.sortBy;
    let html = '<div class="brawlers-grid">';
    list.forEach(brawler => {
        html += buildBrawlerCard(brawler, sortBy);
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderGroupedGrid(container, list) {
    const sortBy = brawlersState.sortBy;
    const groupKey = sortBy === 'rarity' ? 'rarity' : 'class';
    const colorMap = sortBy === 'rarity' ? RARITY_COLORS : CLASS_COLORS;

    // Construire les groupes en conservant l'ordre du tri
    const groups = [];
    const groupMap = new Map();
    list.forEach(brawler => {
        const key = brawler[groupKey] || 'Autre';
        if (!groupMap.has(key)) {
            groupMap.set(key, []);
            groups.push(key);
        }
        groupMap.get(key).push(brawler);
    });

    let html = '';
    groups.forEach(groupName => {
        const items = groupMap.get(groupName);
        const color = colorMap[groupName] || '#aaa';
        const emoji = sortBy === 'rarity' ? getRarityEmoji(groupName) : getClassEmoji(groupName);

        html += `
            <div class="brawler-group">
                <div class="brawler-group-header" style="border-left-color: ${color}; color: ${color};">
                    <span class="group-emoji">${emoji}</span>
                    <span class="group-name">${groupName}</span>
                    <span class="group-count">${items.length} brawler${items.length > 1 ? 's' : ''}</span>
                </div>
                <div class="brawlers-grid brawlers-grid--group">
                    ${items.map(b => buildBrawlerCard(b, sortBy)).join('')}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function buildBrawlerCard(brawler, sortBy) {
    const rarityClass = getRarityClass(brawler.rarity);
    const borderClass = rarityClass.replace('badge-', 'border-');
    const extraHtml = getBrawlerExtraHtml(brawler, sortBy);

    return `
        <div class="brawler-list-card" onclick="window.location.href='brawler.html?id=${brawler.id}'">
            <img src="${brawler.image || 'images/ui/placeholder.svg'}" alt="${brawler.name}" class="${borderClass}" onerror="this.src='images/ui/placeholder.svg'; this.classList.remove('${borderClass}')">
            <div class="brawler-list-info">
                <h3>${brawler.name}</h3>
                <div class="badges-row">
                    <span class="badge badge-basic">${brawler.class}</span>
                    <span class="badge ${rarityClass}">${brawler.rarity}</span>
                </div>
                ${extraHtml}
            </div>
        </div>
    `;
}

function getRarityEmoji(rarity) {
    const r = (rarity || '').toLowerCase();
    if (r.includes('départ')) return '🟦';
    if (r.includes('super rare')) return '💙';
    if (r.includes('rare')) return '💚';
    if (r.includes('épique')) return '💜';
    if (r.includes('mythique')) return '❤️';
    if (r.includes('légendaire')) return '⭐';
    return '⬜';
}

function getClassEmoji(cls) {
    const map = {
        'Dégâts': '💥', 'Tank': '🛡️', 'Tireur d\'élite': '🎯',
        'Artilleur': '💣', 'Contrôleur': '🌀', 'Soutien': '💚', 'Assassin': '🗡️'
    };
    return map[cls] || '❓';
}

// Lancement au chargement de la page
window.addEventListener('DOMContentLoaded', initApp);
