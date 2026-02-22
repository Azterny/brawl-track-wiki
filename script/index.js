// ==========================================
// MOTEUR BRAWLOPÉDIA (wiki.js)
// ==========================================

const appContent = document.getElementById('app-content');

// Cache local pour éviter de re-télécharger les JSON à chaque clic
const db = {
    brawlers: null,
    gadgets: null,
    starpowers: null,
    hypercharges: null,
    skins: null
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

// Initialisation de l'application
async function initApp() {
    // On charge la base de brawlers en premier
    db.brawlers = await fetchJSON('brawlers.json');
    
    // Routage basique
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'home';
    const id = params.get('id');

    if (page === 'brawler' && id) {
        await renderBrawlerPage(id);
    } else if (page === 'brawlers') {
        renderBrawlersList();
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
        <p>Sélectionnez une catégorie ci-dessus pour commencer.</p>
        <div class="landing-wrapper">
            <div class="landing-column" style="cursor:pointer;" onclick="window.location.href='?page=brawlers'">
                <h2>Tous les Brawlers</h2>
                <p>Découvrez les stats, gadgets et pouvoirs de tous les personnages.</p>
            </div>
        </div>
    `;
}

function renderBrawlersList() {
    let html = `<h1>Liste des Brawlers</h1><div class="stats-grid">`;
    
    // Parcourt les brawlers du JSON pour créer la grille
    for (const [id, brawler] of Object.entries(db.brawlers)) {
        html += `
            <div class="stat-card" style="cursor:pointer; text-align:center;" onclick="window.location.href='?page=brawler&id=${id}'">
                <h3 style="margin:0;">${brawler.name}</h3>
                <span class="badge badge-premium" style="margin-top:5px;">${brawler.rarity}</span>
            </div>
        `;
    }
    
    html += `</div>`;
    appContent.innerHTML = html;
}

async function renderBrawlerPage(brawlerId) {
    const brawler = db.brawlers[brawlerId];
    if (!brawler) {
        appContent.innerHTML = `<h1>Brawler introuvable</h1>`;
        return;
    }

    // Chargement paresseux (Lazy load) des autres JSON uniquement si on est sur la page d'un Brawler
    if (!db.gadgets) db.gadgets = await fetchJSON('gadgets.json');
    if (!db.starpowers) db.starpowers = await fetchJSON('starpowers.json');
    if (!db.hypercharges) db.hypercharges = await fetchJSON('hypercharges.json');
    if (!db.skins) db.skins = await fetchJSON('skins.json');

    // Construction du HTML dynamique
    let html = `
        <div class="brawler-top-section">
            <div class="brawler-info-left">
                <h1>${brawler.name}</h1>
                <div class="brawler-badges">
                    <span class="badge badge-basic">${brawler.class}</span>
                    <span class="badge badge-premium">${brawler.rarity}</span>
                </div>
            </div>
            <div class="brawler-desc-right">
                ${brawler.description}
            </div>
        </div>
    `;

    // Fonction pour générer les cartes d'items (Gadgets, SP, HC)
    const generateItemsHtml = (itemIds, dbRef) => {
        if (!itemIds || itemIds.length === 0) return `<p>Aucun objet disponible.</p>`;
        let itemsHtml = `<div class="horizontal-scroll-container">`;
        itemIds.forEach(itemId => {
            const itemData = dbRef[itemId];
            if (itemData) {
                itemsHtml += `
                    <div class="item-card">
                        <h4>${itemData.name}</h4>
                        <p>${itemData.description}</p>
                    </div>
                `;
            }
        });
        itemsHtml += `</div>`;
        return itemsHtml;
    };

    html += `<h2 class="wiki-section-title">GADGETS</h2>`;
    html += generateItemsHtml(brawler.gadgets, db.gadgets);

    html += `<h2 class="wiki-section-title">POUVOIRS STARS</h2>`;
    html += generateItemsHtml(brawler.starpowers, db.starpowers);

    html += `<h2 class="wiki-section-title">HYPERCHARGE</h2>`;
    html += generateItemsHtml(brawler.hypercharge, db.hypercharges);

    // SKINS
    html += `<h2 class="wiki-section-title">SKINS</h2>`;
    if (brawler.skins && brawler.skins.length > 0) {
        html += `<div class="horizontal-scroll-container">`;
        brawler.skins.forEach(skinId => {
            const skinData = db.skins[skinId];
            if (skinData) {
                html += `
                    <div class="item-card skin-card">
                        <img src="${skinData.image}" alt="${skinData.name}" onerror="this.src='https://via.placeholder.com/150x150?text=Image+Manquante'">
                        <h4>${skinData.name}</h4>
                    </div>
                `;
            }
        });
        html += `</div>`;
    }

    appContent.innerHTML = html;
}

// Lancement au chargement de la page
window.addEventListener('DOMContentLoaded', initApp);
