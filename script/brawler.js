// ==========================================
// MOTEUR BRAWLER PAGE (brawler.js)
// ==========================================

const brawlerContent = document.getElementById('brawler-content');

// Fonction utilitaire pour choisir la bonne couleur selon la rareté
function getRarityClass(rarity) {
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
        return {}; // Retourne un objet vide en cas d'erreur
    }
}

// Initialisation de la page
async function initBrawlerPage() {
    // 1. On récupère l'ID du brawler depuis l'URL (ex: brawler.html?id=NITA)
    const params = new URLSearchParams(window.location.search);
    const brawlerId = params.get('id') || 'NITA'; // On force 'NITA' par défaut pour tester

    if (!brawlerId) {
        brawlerContent.innerHTML = `<h1>Erreur: Aucun brawler sélectionné</h1>`;
        return;
    }

    // 2. Chargement des données de base
    const brawlersData = await fetchJSON('brawlers.json');
    const brawler = brawlersData[brawlerId];

    if (!brawler) {
        brawlerContent.innerHTML = `<h1>Brawler "${brawlerId}" introuvable</h1>`;
        return;
    }

    // 3. Chargement des équipements
    const gadgetsData = await fetchJSON('gadgets.json');
    const starpowersData = await fetchJSON('starpowers.json');
    const hyperchargesData = await fetchJSON('hypercharges.json');
    const skinsData = await fetchJSON('skins.json');

    // On isole les équipements appartenant UNIQUEMENT à ce brawler
    const brawlerGadgets = gadgetsData[brawlerId];
    const brawlerStarpowers = starpowersData[brawlerId];
    const brawlerHypercharges = hyperchargesData[brawlerId];
    const brawlerSkins = skinsData[brawlerId];
    
    const rarityClass = getRarityClass(brawler.rarity); // On récupère la couleur de rareté

    // 4. Construction de l'en-tête HTML
    let html = `
        <div class="wiki-btn-back" style="text-align: left; width: 100%;">
            <button class="btn-back" onclick="window.location.href='index.html?page=brawlers'">⬅ Retour à la liste</button>
        </div>

        <div class="brawler-top-section">
            <img src="${brawler.image || 'images/ui/placeholder.png'}" alt="${brawler.name}" class="brawler-detail-icon" onerror="this.src='https://via.placeholder.com/100x100?text=?'">
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

    // Fonction locale pour générer les cartes (Gadgets, SP, HC)
    const generateItemsHtml = (brawlerItems) => {
        if (!brawlerItems || Object.keys(brawlerItems).length === 0) {
            return `<p style="color: #aaa; font-style: italic;">Aucun objet disponible.</p>`;
        }
        
        let itemsHtml = `<div class="horizontal-scroll-container">`;
        for (const [itemId, itemData] of Object.entries(brawlerItems)) {
            itemsHtml += `
                <div class="item-card">
                    <h4>${itemData.name}</h4>
                    <p>${itemData.description}</p>
                </div>
            `;
        }
        itemsHtml += `</div>`;
        return itemsHtml;
    };

    // Injection : GADGETS
    html += `<h2 class="wiki-section-title">GADGETS</h2>`;
    html += generateItemsHtml(brawlerGadgets);

    // Injection : POUVOIRS STARS
    html += `<h2 class="wiki-section-title">POUVOIRS STARS</h2>`;
    html += generateItemsHtml(brawlerStarpowers);

    // Injection : HYPERCHARGE
    html += `<h2 class="wiki-section-title">HYPERCHARGE</h2>`;
    html += generateItemsHtml(brawlerHypercharges);

    // Injection : SKINS
    html += `<h2 class="wiki-section-title">SKINS</h2>`;
    if (brawlerSkins && Object.keys(brawlerSkins).length > 0) {
        html += `<div class="horizontal-scroll-container">`;
        for (const [skinId, skinData] of Object.entries(brawlerSkins)) {
            html += `
                <div class="item-card skin-card">
                    <img src="${skinData.image}" alt="${skinData.name}" onerror="this.src='https://via.placeholder.com/150x150?text=Image+Manquante'">
                    <h4 style="margin-top: 10px;">${skinData.name}</h4>
                </div>
            `;
        }
        html += `</div>`;
    } else {
        html += `<p style="color: #aaa; font-style: italic;">Aucun skin disponible.</p>`;
    }

    // 5. Affichage final
    brawlerContent.innerHTML = html;
}

// Déclenche la fonction quand la page est chargée
window.addEventListener('DOMContentLoaded', initBrawlerPage);
