// ==========================================
// MOTEUR PAGE ACCUEIL & BRAWLERS (index.js)
// ==========================================

const appContent = document.getElementById('app-content');
const db = { brawlers: null, skins: null };

const brawlersState = {
    search: '',
    sortBy: 'id',
    sortAsc: true,
    filters: {
        classes: new Set(),
        rarities: new Set(),
        hpMin: null,
        speedMin: null
    }
};

// Ordre hiérarchique des raretés — Rare AVANT Super Rare
const RARITY_ORDER = {
    'brawler de départ': 1,
    'rare': 2,
    'super rare': 3, 'super-rare': 3,
    'épique': 4, 'epic': 4,
    'mythique': 5, 'mythic': 5,
    'légendaire': 6, 'legendary': 6
};

const RARITY_COLORS = {
    'Brawler de départ': '#54c8f9',
    'Rare':              '#28a745',
    'Super Rare':        '#007bff',
    'Épique':            '#8a2be2',
    'Mythique':          '#dc3545',
    'Légendaire':        '#ffce00',
    'Autre':             '#ffffff'
};

const CLASS_COLORS = {
    "Dégâts":           '#ff6b6b',
    "Tank":             '#4ecdc4',
    "Tireur d'élite":   '#45b7d1',
    "Artilleur":        '#f7dc6f',
    "Contrôleur":       '#a8d8ea',
    "Soutien":          '#98fb98',
    "Assassin":         '#da70d6',
    "Autre":            '#ffffff'
};

async function fetchJSON(file) {
    try {
        const r = await fetch('data/' + file);
        return await r.json();
    } catch (e) {
        console.error('Erreur de chargement ' + file + ':', e);
        return {};
    }
}

function getRarityClass(rarity) {
    if (!rarity) return 'badge-premium';
    const r = rarity.toLowerCase();
    if (r.includes('départ')) return 'badge-starting';
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

function formatDate(dateStr) {
    if (!dateStr) return 'Inconnue';
    const months = ['Jan.','Fév.','Mar.','Avr.','Mai','Juin','Juil.','Août','Sep.','Oct.','Nov.','Déc.'];
    const [year, month] = dateStr.split('-');
    return months[parseInt(month) - 1] + ' ' + year;
}

function formatSpeed(speed) {
    if (!speed) return 'Normale';
    if (speed <= 660) return 'Très lente';
    if (speed <= 690) return 'Lente';
    if (speed <= 750) return 'Normale';
    if (speed <= 820) return 'Rapide';
    return 'Très rapide';
}

function getSkinCount(brawlerId) {
    if (!db.skins || !db.skins[brawlerId]) return 0;
    return Object.keys(db.skins[brawlerId]).length;
}

function getBrawlerExtraHtml(brawler, sortBy) {
    if (sortBy === 'date_added' && brawler.date_added) {
        return '<div class="brawler-extra-date"><span class="extra-icon">&#128197;</span><span>' + formatDate(brawler.date_added) + '</span></div>';
    }
    if (sortBy === 'hp' && brawler.hp) {
        const p11 = Math.round(brawler.hp * 2);
        return '<div class="brawler-hp-table"><div class="hp-row"><span class="hp-label">&#10084;&#65039; PV</span><span class="hp-cell hp-p1"><span class="hp-tier">P1</span>' + brawler.hp.toLocaleString('fr-FR') + '</span><span class="hp-sep">&rarr;</span><span class="hp-cell hp-p11"><span class="hp-tier">P11</span>' + p11.toLocaleString('fr-FR') + '</span></div></div>';
    }
    if (sortBy === 'speed' && brawler.speed) {
        const label = formatSpeed(brawler.speed);
        const cls = 'speed-' + label.toLowerCase().replace(/ /g,'-').replace(/è/g,'e').replace(/à/g,'a');
        return '<div class="brawler-extra-speed ' + cls + '"><span class="extra-icon">&#128168;</span><span>' + label + ' (' + brawler.speed + ')</span></div>';
    }
    if (sortBy === 'range' && brawler.range) {
        return '<div class="brawler-extra-range"><span class="extra-icon">&#127919;</span><span>' + brawler.range + ' tuiles</span></div>';
    }
    if (sortBy === 'skins') {
        const count = getSkinCount(brawler.id);
        return '<div class="brawler-extra-skins"><span class="extra-icon">&#127912;</span><span>' + count + ' skin' + (count > 1 ? 's' : '') + '</span></div>';
    }
    return '';
}

async function initApp() {
    [db.brawlers, db.skins] = await Promise.all([
        fetchJSON('brawlers.json'),
        fetchJSON('skins.json')
    ]);
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'home';
    if (page === 'brawlers') {
        renderBrawlersPageLayout();
        updateBrawlersGrid();
    } else {
        renderHome();
    }
}

function renderHome() {
    appContent.innerHTML = '<h1>Bienvenue sur BrawlOpédia</h1><p>Sélectionnez une catégorie ci-dessous pour commencer.</p><div class="category-grid"><div class="category-card" onclick="window.location.href=\'?page=brawlers\'"><h2 style="color:#00d2ff;">&#x1F94A; Brawlers</h2><p>Découvrez les stats, gadgets et pouvoirs de tous les personnages du jeu.</p></div><div class="category-card" style="opacity:0.5;cursor:not-allowed;" title="Bientôt disponible"><h2 style="color:#ffce00;">&#x1F5FA;&#xFE0F; Modes &amp; Maps</h2><p>Informations sur les rotations et règles des événements.</p></div></div>';
}

function renderBrawlersPageLayout() {
    const classes  = [...new Set(Object.values(db.brawlers).map(b => b.class))].filter(Boolean).sort();
    const rarities = [...new Set(Object.values(db.brawlers).map(b => b.rarity))].filter(Boolean)
                       .sort((a, b) => getRarityValue(a) - getRarityValue(b));

    let filtersHtml = '<div class="filter-group"><h4>Classes</h4>'
        + classes.map(c => '<label><input type="checkbox" value="' + c + '" data-type="class"> ' + c + '</label>').join('')
        + '</div><div class="filter-group"><h4>Raretés</h4>'
        + rarities.map(r => '<label><input type="checkbox" value="' + r + '" data-type="rarity"> ' + r + '</label>').join('')
        + '</div><div class="filter-group"><h4>PV minimum (P1)</h4><div class="filter-range-row"><input type="range" id="filter-hp-min" min="0" max="7000" step="200" value="0" class="filter-range"><span id="filter-hp-min-label" class="filter-range-label">Tous</span></div></div>'
        + '<div class="filter-group"><h4>Vitesse minimum</h4><div class="filter-range-row"><input type="range" id="filter-speed-min" min="640" max="900" step="10" value="640" class="filter-range"><span id="filter-speed-min-label" class="filter-range-label">Toutes</span></div></div>'
        + '<button id="filter-reset-btn" class="wiki-btn filter-reset-btn">&#x1F504; Réinitialiser les filtres</button>';

    appContent.innerHTML = '<div class="wiki-btn-back"><button class="btn-back" onclick="window.location.href=\'index.html\'">&#x2B05; Retour aux Catégories</button></div>'
        + '<h1>Sélectionnez un Brawler</h1>'
        + '<div class="wiki-controls-bar">'
        + '<input type="text" id="brawler-search" placeholder="Rechercher par nom..." class="wiki-input">'
        + '<select id="brawler-sort" class="wiki-select">'
        + '<option value="id">Trier par : Défaut</option>'
        + '<option value="name">Trier par : Ordre Alphabétique</option>'
        + '<option value="rarity">Trier par : Rareté</option>'
        + '<option value="class">Trier par : Classe</option>'
        + '<option value="date_added">Trier par : Date d\'ajout</option>'
        + '<option value="hp">Trier par : PV (P1)</option>'
        + '<option value="speed">Trier par : Vitesse</option>'
        + '<option value="range">Trier par : Portée</option>'
        + '<option value="skins">Trier par : Nombre de Skins</option>'
        + '</select>'
        + '<button id="brawler-order-btn" class="wiki-btn-icon" title="Ordre Croissant/Décroissant">&#x25B2;</button>'
        + '<div class="wiki-dropdown"><button id="brawler-filter-btn" class="wiki-btn">Filtres &#x25BC;</button>'
        + '<div id="wiki-filter-menu" class="wiki-dropdown-menu hidden">' + filtersHtml + '</div></div>'
        + '</div>'
        + '<div id="brawlers-count" class="brawlers-count"></div>'
        + '<div id="brawlers-grid-container"></div>';

    document.getElementById('brawler-search').addEventListener('input', function(e) {
        brawlersState.search = e.target.value; updateBrawlersGrid();
    });
    document.getElementById('brawler-sort').addEventListener('change', function(e) {
        brawlersState.sortBy = e.target.value; updateBrawlersGrid();
    });
    document.getElementById('brawler-order-btn').addEventListener('click', function(e) {
        brawlersState.sortAsc = !brawlersState.sortAsc;
        e.target.textContent = brawlersState.sortAsc ? '▲' : '▼';
        updateBrawlersGrid();
    });
    document.getElementById('brawler-filter-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('wiki-filter-menu').classList.toggle('hidden');
    });
    document.querySelectorAll('#wiki-filter-menu input[type="checkbox"]').forEach(function(cb) {
        cb.addEventListener('change', function(e) {
            const type = e.target.getAttribute('data-type');
            const val  = e.target.value;
            const set  = type === 'class' ? brawlersState.filters.classes : brawlersState.filters.rarities;
            e.target.checked ? set.add(val) : set.delete(val);
            updateBrawlersGrid();
        });
    });
    const hpRange = document.getElementById('filter-hp-min');
    const hpLabel = document.getElementById('filter-hp-min-label');
    hpRange.addEventListener('input', function() {
        const v = parseInt(hpRange.value);
        brawlersState.filters.hpMin = v > 0 ? v : null;
        hpLabel.textContent = v > 0 ? ('\u2265 ' + v.toLocaleString('fr-FR') + ' PV') : 'Tous';
        updateBrawlersGrid();
    });
    const speedRange = document.getElementById('filter-speed-min');
    const speedLabel = document.getElementById('filter-speed-min-label');
    speedRange.addEventListener('input', function() {
        const v = parseInt(speedRange.value);
        brawlersState.filters.speedMin = v > 640 ? v : null;
        speedLabel.textContent = v > 640 ? ('\u2265 ' + v) : 'Toutes';
        updateBrawlersGrid();
    });
    document.getElementById('filter-reset-btn').addEventListener('click', function() {
        brawlersState.filters.classes.clear();
        brawlersState.filters.rarities.clear();
        brawlersState.filters.hpMin = null;
        brawlersState.filters.speedMin = null;
        document.querySelectorAll('#wiki-filter-menu input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
        hpRange.value = 0; hpLabel.textContent = 'Tous';
        speedRange.value = 640; speedLabel.textContent = 'Toutes';
        updateBrawlersGrid();
    });
    document.addEventListener('click', function(e) {
        const dd   = document.querySelector('.wiki-dropdown');
        const menu = document.getElementById('wiki-filter-menu');
        if (dd && !dd.contains(e.target) && menu && !menu.classList.contains('hidden'))
            menu.classList.add('hidden');
    });
}

function updateBrawlersGrid() {
    const container = document.getElementById('brawlers-grid-container');
    const countEl   = document.getElementById('brawlers-count');

    let list = Object.entries(db.brawlers).map(function([id, data], index) {
        return Object.assign({ id: id, _order: index, _skinCount: getSkinCount(id) }, data);
    });

    list = list.filter(function(b) {
        if (brawlersState.search && !b.name.toLowerCase().includes(brawlersState.search.toLowerCase())) return false;
        if (brawlersState.filters.classes.size  > 0 && !brawlersState.filters.classes.has(b.class))   return false;
        if (brawlersState.filters.rarities.size > 0 && !brawlersState.filters.rarities.has(b.rarity)) return false;
        if (brawlersState.filters.hpMin    !== null && b.hp    && b.hp    < brawlersState.filters.hpMin)    return false;
        if (brawlersState.filters.speedMin !== null && b.speed && b.speed < brawlersState.filters.speedMin) return false;
        return true;
    });

    list.sort(function(a, b) {
        let res = 0;
        switch (brawlersState.sortBy) {
            case 'name':       res = a.name.localeCompare(b.name, 'fr'); break;
            case 'rarity':     res = getRarityValue(a.rarity) - getRarityValue(b.rarity);
                               if (!res) res = a.name.localeCompare(b.name, 'fr'); break;
            case 'class':      res = (a.class||'').localeCompare(b.class||'', 'fr');
                               if (!res) res = getRarityValue(a.rarity) - getRarityValue(b.rarity); break;
            case 'date_added': res = (a.date_added||'0000').localeCompare(b.date_added||'0000'); break;
            case 'hp':         res = (a.hp||0) - (b.hp||0); break;
            case 'speed':      res = (a.speed||0) - (b.speed||0); break;
            case 'range':      res = (a.range||0) - (b.range||0); break;
            case 'skins':      res = a._skinCount - b._skinCount; break;
            default:           res = a._order - b._order;
        }
        return brawlersState.sortAsc ? res : -res;
    });

    if (countEl) countEl.textContent = list.length
        ? (list.length + ' brawler' + (list.length > 1 ? 's' : '') + ' trouvé' + (list.length > 1 ? 's' : ''))
        : '';

    if (!list.length) {
        container.innerHTML = '<p style="width:100%;text-align:center;color:#aaa;margin-top:40px;">Aucun brawler ne correspond à votre recherche.</p>';
        return;
    }

    const useGroups = ['rarity', 'class'].includes(brawlersState.sortBy);
    if (useGroups) renderGroupedGrid(container, list);
    else           renderFlatGrid(container, list);
}

function renderFlatGrid(container, list) {
    container.innerHTML = '<div class="brawlers-grid">' + list.map(buildBrawlerCard).join('') + '</div>';
}

function renderGroupedGrid(container, list) {
    const sortBy   = brawlersState.sortBy;
    const groupKey = sortBy === 'rarity' ? 'rarity' : 'class';
    const colorMap = sortBy === 'rarity' ? RARITY_COLORS : CLASS_COLORS;

    const groups   = [];
    const groupMap = new Map();
    list.forEach(function(b) {
        const key = b[groupKey] || 'Autre';
        if (!groupMap.has(key)) { groupMap.set(key, []); groups.push(key); }
        groupMap.get(key).push(b);
    });

    let html = '';
    groups.forEach(function(groupName) {
        const items = groupMap.get(groupName);
        if (!items || !items.length) return;
        const color = colorMap[groupName] || '#aaa';
        html += '<div class="brawler-group">'
            + '<div class="brawler-group-header">'
            + '<span class="group-name" style="color:' + color + '">' + groupName + '</span>'
            + '<span class="group-count">(' + items.length + ')</span>'
            + '<div class="group-divider" style="background:' + color + ';opacity:0.4"></div>'
            + '</div>'
            + '<div class="brawlers-grid brawlers-grid--group">'
            + items.map(buildBrawlerCard).join('')
            + '</div></div>';
    });

    container.innerHTML = html;
}

function buildBrawlerCard(brawler) {
    const sortBy      = brawlersState.sortBy;
    const rarityClass = getRarityClass(brawler.rarity);
    const borderClass = rarityClass.replace('badge-', 'border-');
    const extraHtml   = getBrawlerExtraHtml(brawler, sortBy);
    return '<div class="brawler-list-card" onclick="window.location.href=\'brawler.html?id=' + brawler.id + '\'">'
        + '<img src="' + (brawler.image || 'images/ui/placeholder.svg') + '" alt="' + brawler.name + '" class="' + borderClass + '" onerror="this.src=\'images/ui/placeholder.svg\'; this.classList.remove(\'' + borderClass + '\')">'
        + '<div class="brawler-list-info"><h3>' + brawler.name + '</h3>'
        + '<div class="badges-row"><span class="badge badge-basic">' + brawler.class + '</span>'
        + '<span class="badge ' + rarityClass + '">' + brawler.rarity + '</span></div>'
        + extraHtml + '</div></div>';
}

window.addEventListener('DOMContentLoaded', initApp);
