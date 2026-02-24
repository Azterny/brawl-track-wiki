// ==========================================
// MOTEUR BRAWLER PAGE (brawler.js)
// ==========================================

const brawlerContent = document.getElementById('brawler-content');

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

async function fetchJSON(file) {
    try {
        const r = await fetch('data/' + file);
        return await r.json();
    } catch (e) {
        console.error('Erreur de chargement ' + file + ':', e);
        return {};
    }
}

// Calcule la valeur d'une stat à un niveau donné (P1 + 10% par niveau au-delà de 1)
function statAtLevel(base, level) {
    return Math.round(base * (1 + (level - 1) * 0.1));
}

function formatSpeed(speed) {
    if (!speed) return '—';
    if (speed <= 660) return 'Très lente';
    if (speed <= 690) return 'Lente';
    if (speed <= 750) return 'Normale';
    if (speed <= 820) return 'Rapide';
    return 'Très rapide';
}

function generateSectionHtml(items, sectionClass, sectionTitle, cardClass) {
    if (!items || Object.keys(items).length === 0) return '';
    let cardsHtml = '<div class="horizontal-scroll-container">';
    for (const [, itemData] of Object.entries(items)) {
        const iconHtml = itemData.icon
            ? '<img src="' + itemData.icon + '" alt="" class="item-icon-inline" onerror="this.style.display=\'none\'">'
            : '';
        cardsHtml += '<div class="item-card ' + cardClass + '-card"><h4>' + iconHtml + itemData.name + '</h4><p>' + itemData.description + '</p></div>';
    }
    cardsHtml += '</div>';
    return '<div class="' + sectionClass + '"><h2 class="wiki-section-title">' + sectionTitle + '</h2>' + cardsHtml + '</div>';
}

function formatDateSkin(dateStr) {
    if (!dateStr) return '';
    const months = ['Jan.','Fév.','Mar.','Avr.','Mai','Juin','Juil.','Août','Sep.','Oct.','Nov.','Déc.'];
    const [year, month] = dateStr.split('-');
    return months[parseInt(month) - 1] + ' ' + year;
}

function generateSkinsHtml(skins) {
    if (!skins || Object.keys(skins).length === 0) return '';
    const count = Object.keys(skins).length;
    let cardsHtml = '<div class="horizontal-scroll-container">';
    for (const [, skinData] of Object.entries(skins)) {
        const dateStr = skinData['date de sortie'] ? formatDateSkin(skinData['date de sortie']) : '';
        const dateBadge = dateStr
            ? '<div class="skin-date-badge">&#128197; ' + dateStr + '</div>'
            : '';
        cardsHtml += '<div class="item-card skin-card">'
            + '<div class="skin-img-wrapper">'
            + '<img src="' + skinData.image + '" alt="' + skinData.name + '" onerror="this.parentElement.classList.add(\'skin-img-error\')">'
            + '</div>'
            + '<div class="skin-info">'
            + '<span class="skin-name">' + skinData.name + '</span>'
            + dateBadge
            + '</div>'
            + '</div>';
    }
    cardsHtml += '</div>';
    return '<div class="section-skins">'
        + '<h2 class="wiki-section-title">SKINS <span class="section-count">(' + count + ')</span></h2>'
        + cardsHtml
        + '</div>';
}

// ==========================================
// SECTION STATISTIQUES
// ==========================================
function generateStatsHtml(brawler) {
    if (!brawler.hp && !brawler.attack_damage && !brawler.speed && !brawler.range) return '';

    const statsId = 'stats-brawler-' + brawler.id;

    // Lignes de stats : [label, baseValue, unit, hasLevelScaling]
    const rows = [];
    if (brawler.hp)            rows.push({ label: '❤️ Points de Vie',    key: 'hp',            base: brawler.hp,            unit: '',       scales: true });
    if (brawler.attack_damage) rows.push({ label: '⚔️ Dégâts (attaque)', key: 'attack_damage', base: brawler.attack_damage, unit: '',       scales: true });
    if (brawler.speed)         rows.push({ label: '💨 Vitesse',           key: 'speed',         base: brawler.speed,         unit: '',       scales: false, label2: formatSpeed(brawler.speed) });
    if (brawler.range)         rows.push({ label: '🎯 Portée',            key: 'range',         base: brawler.range,         unit: ' tuiles',scales: false });

    const rowsHtml = rows.map(function(row) {
        const displayVal = row.scales
            ? ('<span class="stat-value" id="' + statsId + '-' + row.key + '">' + row.base.toLocaleString('fr-FR') + '</span>' + row.unit)
            : ('<span class="stat-value">' + (row.label2 || (row.base + row.unit)) + '</span>');

        // Barre de progression (pour hp et attack_damage, basée sur les valeurs max connues)
        let barHtml = '';
        if (row.scales) {
            const maxHp  = 7000, maxDmg = 2500;
            const maxVal = row.key === 'hp' ? maxHp : maxDmg;
            const pct    = Math.min(100, Math.round((row.base / maxVal) * 100));
            barHtml = '<div class="stat-bar-bg"><div class="stat-bar-fill" id="' + statsId + '-bar-' + row.key + '" style="width:' + pct + '%"></div></div>';
        }

        return '<div class="stat-row">'
            + '<span class="stat-label">' + row.label + '</span>'
            + '<div class="stat-right">' + displayVal + barHtml + '</div>'
            + '</div>';
    }).join('');

    // Slider de niveau de pouvoir
    const sliderHtml = '<div class="power-level-slider">'
        + '<div class="power-level-header">'
        + '<span class="power-icon">&#9889;</span>'
        + '<span class="power-label">Niveau de Pouvoir</span>'
        + '<span class="power-value-badge" id="' + statsId + '-badge">P1</span>'
        + '</div>'
        + '<div class="power-slider-track">'
        + '<span class="power-min">P1</span>'
        + '<input type="range" id="' + statsId + '-slider" min="1" max="11" step="1" value="1" class="power-slider">'
        + '<span class="power-max">P11</span>'
        + '</div>'
        + '<div class="power-ticks">'
        + Array.from({length: 11}, function(_, i) { return '<span class="power-tick' + (i === 0 ? ' active' : '') + '" id="' + statsId + '-tick-' + (i+1) + '">' + (i+1) + '</span>'; }).join('')
        + '</div>'
        + '</div>';

    const html = '<div class="section-stats">'
        + '<h2 class="wiki-section-title">STATISTIQUES</h2>'
        + sliderHtml
        + '<div class="stats-grid" id="' + statsId + '">' + rowsHtml + '</div>'
        + '</div>';

    // On attache le listener après insertion dans le DOM via un defer
    const scalingRows = rows.filter(function(r) { return r.scales; });
    setTimeout(function() {
        const slider = document.getElementById(statsId + '-slider');
        if (!slider) return;
        function updateStats(level) {
            document.getElementById(statsId + '-badge').textContent = 'P' + level;
            // Mettre à jour les ticks
            for (let i = 1; i <= 11; i++) {
                const tick = document.getElementById(statsId + '-tick-' + i);
                if (tick) tick.classList.toggle('active', i === level);
            }
            scalingRows.forEach(function(row) {
                const el = document.getElementById(statsId + '-' + row.key);
                if (el) el.textContent = statAtLevel(row.base, level).toLocaleString('fr-FR');
                // Barre
                const barEl = document.getElementById(statsId + '-bar-' + row.key);
                if (barEl) {
                    const maxVal = row.key === 'hp' ? 14000 : 5000;
                    const val    = statAtLevel(row.base, level);
                    barEl.style.width = Math.min(100, Math.round((val / maxVal) * 100)) + '%';
                }
            });
        }
        slider.addEventListener('input', function() { updateStats(parseInt(slider.value)); });
    }, 50);

    return html;
}

// ==========================================
// SECTION EQUILIBRAGE
// ==========================================
function generateEquilibrageHtml(balanceData) {
    if (!balanceData || Object.keys(balanceData).length === 0) return '';

    const ICONS = {
        buff:   '<span class="eq-icon eq-buff"   title="Buff">&#x2B06;</span>',
        nerf:   '<span class="eq-icon eq-nerf"   title="Nerf">&#x2B07;</span>',
        rework: '<span class="eq-icon eq-rework" title="Rework">&#x1F504;</span>',
        patch:  '<span class="eq-icon eq-patch"  title="Patch">&#x25CF;</span>',
        other:  '<span class="eq-icon eq-other"  title="Autre">&#x25CF;</span>'
    };

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const months = ['Jan.','Fév.','Mar.','Avr.','Mai','Juin','Juil.','Août','Sep.','Oct.','Nov.','Déc.'];
        const [year, month] = dateStr.split('-');
        return months[parseInt(month) - 1] + ' ' + year;
    }

    const LIMIT = 10;
    const entries = Object.values(balanceData).sort(function(a, b) {
        return (b.date || '').localeCompare(a.date || '');
    });
    const total = entries.length;

    function buildRow(entry) {
        const icon = ICONS[entry.type] || ICONS.other;
        return '<tr class="eq-row eq-type-' + (entry.type || 'other') + '">'
            + '<td class="eq-td eq-td-icon">' + icon + '</td>'
            + '<td class="eq-td eq-td-date">' + formatDate(entry.date) + '</td>'
            + '<td class="eq-td eq-td-desc">' + entry.description + '</td>'
            + '</tr>';
    }

    const visibleRows  = entries.slice(0, LIMIT).map(buildRow).join('');
    const hiddenRows   = total > LIMIT ? entries.slice(LIMIT).map(buildRow).join('') : '';
    const showMoreBtn  = total > LIMIT
        ? '<button class="eq-show-more-btn" id="eq-toggle-btn" onclick="toggleEquilibrage()">'
          + '&#x25BC; Afficher plus (' + (total - LIMIT) + ')</button>'
        : '';

    const hiddenBlock = hiddenRows
        ? '<tbody id="eq-hidden-rows" class="eq-hidden">' + hiddenRows + '</tbody>'
        : '';

    return '<div class="section-equilibrage">'
        + '<h2 class="wiki-section-title">ÉQUILIBRAGE <span class="section-count">(' + total + ')</span></h2>'
        + '<div class="eq-table-wrapper">'
        + '<table class="eq-table">'
        + '<thead><tr>'
        + '<th class="eq-th" style="width:52px">Type</th>'
        + '<th class="eq-th" style="width:90px">Date</th>'
        + '<th class="eq-th">Description</th>'
        + '</tr></thead>'
        + '<tbody id="eq-visible-rows">' + visibleRows + '</tbody>'
        + hiddenBlock
        + '</table>'
        + '</div>'
        + showMoreBtn
        + '</div>';
}

// ==========================================
// TOGGLE ÉQUILIBRAGE (global, appelé via onclick)
// ==========================================
function toggleEquilibrage() {
    const hidden = document.getElementById('eq-hidden-rows');
    const btn    = document.getElementById('eq-toggle-btn');
    if (!hidden || !btn) return;
    const isHidden = hidden.classList.contains('eq-hidden');
    hidden.classList.toggle('eq-hidden', !isHidden);
    if (isHidden) {
        btn.innerHTML = '&#x25B2; Afficher moins';
        btn.classList.add('eq-show-more-btn--open');
    } else {
        const count = hidden.querySelectorAll('tr').length;
        btn.innerHTML = '&#x25BC; Afficher plus (' + count + ')';
        btn.classList.remove('eq-show-more-btn--open');
    }
}

// ==========================================
// INITIALISATION
// ==========================================
async function initBrawlerPage() {
    const params    = new URLSearchParams(window.location.search);
    const brawlerId = params.get('id');

    if (!brawlerId) {
        brawlerContent.innerHTML = '<h2 style="color:#dc3545;">Erreur : Aucun brawler sélectionné.</h2>';
        return;
    }

    const [brawlersData, gadgetsData, starpowersData, hyperchargesData, skinsData, equilibrageData] = await Promise.all([
        fetchJSON('brawlers.json'),
        fetchJSON('gadgets.json'),
        fetchJSON('starpowers.json'),
        fetchJSON('hypercharges.json'),
        fetchJSON('skins.json'),
        fetchJSON('equilibrage.json')
    ]);

    const brawler = brawlersData[brawlerId];
    if (!brawler) {
        brawlerContent.innerHTML = '<h2 style="color:#dc3545;">Brawler "' + brawlerId + '" introuvable.</h2>';
        return;
    }

    document.title = brawler.name + ' - BrawlOpédia';

    const rarityClass = getRarityClass(brawler.rarity);
    const borderClass = rarityClass.replace('badge-', 'border-');

    let html = '<div class="wiki-btn-back">'
        + '<button class="btn-back" onclick="window.location.href=\'index.html?page=brawlers\'">&#x2B05; Retour à la liste</button>'
        + '</div>'
        + '<div class="brawler-top-section">'
        + '<img src="' + (brawler.image || 'images/ui/placeholder.png') + '" alt="' + brawler.name + '" class="brawler-detail-icon ' + borderClass + '" onerror="this.src=\'images/ui/placeholder.png\'; this.classList.remove(\'' + borderClass + '\')">'
        + '<div class="brawler-info-left">'
        + '<h1>' + brawler.name + '</h1>'
        + '<div class="brawler-badges">'
        + '<span class="badge badge-basic">' + brawler.class + '</span>'
        + '<span class="badge ' + rarityClass + '">' + brawler.rarity + '</span>'
        + '</div></div>'
        + '<div class="brawler-desc-right">' + brawler.description + '</div>'
        + '</div>';

    html += generateSectionHtml(gadgetsData[brawlerId],      'section-gadget',      'GADGETS',        'gadget');
    html += generateSectionHtml(starpowersData[brawlerId],   'section-starpower',   'POUVOIRS STARS', 'starpower');
    html += generateSectionHtml(hyperchargesData[brawlerId], 'section-hypercharge', 'HYPERCHARGE',    'hypercharge');
    html += generateStatsHtml(brawler);
    html += generateSkinsHtml(skinsData[brawlerId]);
    html += generateEquilibrageHtml(equilibrageData[brawlerId]);

    brawlerContent.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', initBrawlerPage);
