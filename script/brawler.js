// ==========================================
// MOTEUR BRAWLER PAGE (brawler.js)
// ==========================================

const brawlerContent = document.getElementById('brawler-content');

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

// Fonction utilitaire pour charger les JSON depuis le dossier 'data/'
async function fetchJSON(file) {
    try {
        const response = await fetch(`data/${file}`);
        return await response.json();
    } catch (error) {
        console.error(`Erreur de chargement de ${file}:`, error);
        return {};
    }
}

// Génère le HTML d'une section d'équipements.
// Retourne '' si vide → la section ne s'affiche pas du tout.
function generateSectionHtml(items, sectionClass, sectionTitle, cardClass) {
    if (!items || Object.keys(items).length === 0) return '';

    let cardsHtml = `<div class="horizontal-scroll-container">`;
    for (const [itemId, itemData] of Object.entries(items)) {
        const iconHtml = itemData.icon
            ? `<img src="${itemData.icon}" alt="" class="item-icon-inline" onerror="this.style.display='none'">`
            : '';
        cardsHtml += `
            <div class="item-card ${cardClass}-card">
                <h4>${iconHtml}${itemData.name}</h4>
                <p>${itemData.description}</p>
            </div>
        `;
    }
    cardsHtml += `</div>`;

    return `
        <div class="${sectionClass}">
            <h2 class="wiki-section-title">${sectionTitle}</h2>
            ${cardsHtml}
        </div>
    `;
}

// Génère le HTML de la section Skins (masquée si vide)
function generateSkinsHtml(skins) {
    if (!skins || Object.keys(skins).length === 0) return '';

    let cardsHtml = `<div class="horizontal-scroll-container">`;
    for (const [skinId, skinData] of Object.entries(skins)) {
        cardsHtml += `
            <div class="item-card skin-card">
                <img src="${skinData.image}" alt="${skinData.name}" onerror="this.style.display='none'">
                <h4>${skinData.name}</h4>
            </div>
        `;
    }
    cardsHtml += `</div>`;

    return `
        <div class="section-skins">
            <h2 class="wiki-section-title">SKINS</h2>
            ${cardsHtml}
        </div>
    `;
}

// Initialisation de la page
async function initBrawlerPage() {
    const params = new URLSearchParams(window.location.search);
    const brawlerId = params.get('id');

    if (!brawlerId) {
        brawlerContent.innerHTML = `<h2 style="color:#dc3545;">Erreur : Aucun brawler sélectionné.</h2>`;
        return;
    }

    // Chargement parallèle de toutes les données (plus rapide)
    const [brawlersData, gadgetsData, starpowersData, hyperchargesData, skinsData] = await Promise.all([
        fetchJSON('brawlers.json'),
        fetchJSON('gadgets.json'),
        fetchJSON('starpowers.json'),
        fetchJSON('hypercharges.json'),
        fetchJSON('skins.json')
    ]);

    const brawler = brawlersData[brawlerId];
    if (!brawler) {
        brawlerContent.innerHTML = `<h2 style="color:#dc3545;">Brawler "${brawlerId}" introuvable.</h2>`;
        return;
    }

    // Mise à jour dynamique du titre de l'onglet
    document.title = `${brawler.name} - BrawlOpédia`;

    const rarityClass = getRarityClass(brawler.rarity);
    const borderClass = rarityClass.replace('badge-', 'border-');

    // En-tête du brawler
    let html = `
        <div class="wiki-btn-back">
            <button class="btn-back" onclick="window.location.href='index.html?page=brawlers'">⬅ Retour à la liste</button>
        </div>
        <div class="brawler-top-section">
            <img
                src="${brawler.image || 'images/ui/placeholder.png'}"
                alt="${brawler.name}"
                class="brawler-detail-icon ${borderClass}"
                onerror="this.src='images/ui/placeholder.png'; this.classList.remove('${borderClass}')"
            >
            <div class="brawler-info-left">
                <h1>${brawler.name}</h1>
                <div class="brawler-badges">
                    <span class="badge badge-basic">${brawler.class}</span>
                    <span class="badge ${rarityClass}">${brawler.rarity}</span>
                </div>
            </div>
            <div class="brawler-desc-right">
                ${brawler.description}
            </div>
        </div>
    `;

    // Sections équipements — affichées uniquement si des données existent
    html += generateSectionHtml(gadgetsData[brawlerId],       'section-gadget',      'GADGETS',        'gadget');
    html += generateSectionHtml(starpowersData[brawlerId],    'section-starpower',   'POUVOIRS STARS', 'starpower');
    html += generateSectionHtml(hyperchargesData[brawlerId],  'section-hypercharge', 'HYPERCHARGE',    'hypercharge');
    html += generateSkinsHtml(skinsData[brawlerId]);

    brawlerContent.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', initBrawlerPage);
