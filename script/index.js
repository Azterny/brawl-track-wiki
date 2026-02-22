// ==========================================
// MOTEUR PAGE ACCUEIL & BRAWLERS (index.js)
// ==========================================

const appContent = document.getElementById('app-content');
const db = { brawlers: null };

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
    const r = rarity.toLowerCase();
    if (r.includes('départ') || r.includes('starting')) return 'badge-starting';
    if (r.includes('super rare') || r.includes('super-rare')) return 'badge-super-rare';
    if (r.includes('rare')) return 'badge-rare';
    if (r.includes('épique') || r.includes('epic')) return 'badge-epic';
    if (r.includes('mythique') || r.includes('mythic')) return 'badge-mythic';
    if (r.includes('légendaire') || r.includes('legendary')) return 'badge-legendary';
    return 'badge-premium'; // Couleur par défaut si non reconnu
}

// Initialisation de l'application
async function initApp() {
    db.brawlers = await fetchJSON('brawlers.json');
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

function renderBrawlersList() {
    let html = `
        <div class="wiki-btn-back" style="text-align: left; width: 100%;">
            <button class="btn-back" onclick="window.location.href='index.html'">⬅ Retour aux Catégories</button>
        </div>
        <h1>Sélectionnez un Brawler</h1>
        
        <div class="brawlers-grid">
    `;
    
    // Parcourt les brawlers du JSON pour créer la grille
    for (const [id, brawler] of Object.entries(db.brawlers)) {
        const rarityClass = getRarityClass(brawler.rarity); // Récupère la bonne couleur
        
        html += `
            <div class="brawler-list-card" onclick="window.location.href='brawler.html?id=${id}'">
                <img src="${brawler.image || 'images/ui/placeholder.png'}" alt="${brawler.name}" onerror="this.src='https://via.placeholder.com/64x64?text=?'">
                <div class="brawler-list-info">
                    <h3>${brawler.name}</h3>
                    <div
