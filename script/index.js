// ==========================================
// MOTEUR PAGE ACCUEIL & BRAWLERS (index.js)
// ==========================================

const appContent = document.getElementById('app-content');

// Cache local pour éviter de re-télécharger le JSON
const db = {
    brawlers: null
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

    if (page === 'brawlers') {
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
            <div class="stat-card" style="cursor:pointer; text-align:center;" onclick="window.location.href='brawler.html?id=${id}'">
                <h3 style="margin:0;">${brawler.name}</h3>
                <span class="badge badge-premium" style="margin-top:5px;">${brawler.rarity}</span>
            </div>
        `;
    }
    
    html += `</div>`;
    appContent.innerHTML = html;
}

// Lancement au chargement de la page
window.addEventListener('DOMContentLoaded', initApp);
