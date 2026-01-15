// wiki.js - Le cerveau de BrawlOpédia

// État global de l'application
const appState = {
    view: 'home', // 'home', 'brawler', 'mode', 'mechanics'
    data: {
        brawlers: {},
        modes: {}
    }
};

// =========================================
// 1. INITIALISATION & ROUTEUR
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    // 1. Charger les données (Simulé pour l'instant)
    // await loadData(); 
    
    // 2. Détecter la page via l'URL
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const id = params.get('id');

    // 3. Router
    if (!page) {
        renderHome();
    } else if (page === 'brawler' && id) {
        renderBrawlerDetail(id);
    } else if (page === 'modes') {
        renderModesList();
    } else {
        renderHome(); // Fallback
    }
}

// =========================================
// 2. RENDU DES PAGES
// =========================================

/**
 * Affiche la page d'accueil (Home)
 */
function renderHome() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="hero-section">
            <h1>BrawlOpédia</h1>
            <p style="color:#ccc; font-size:1.1em;">La base de connaissances ultime pour Brawl Stars.</p>
            
            <div class="search-wrapper">
                <input type="text" id="global-search" placeholder="Rechercher un Brawler, un Mode...">
                <span class="material-icons search-icon">search</span>
            </div>
        </div>

        <div class="featured-section">
            <div class="featured-item">
                <h3 style="margin-top:0;">🔥 Brawler du Moment</h3>
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="width:50px; height:50px; background:#333; border-radius:8px;"></div>
                    <div>
                        <strong style="color:white; font-size:1.2em;">Mélodie</strong>
                        <div style="color:#aaa; font-size:0.9em;">Assassin Mythique</div>
                    </div>
                </div>
            </div>
            <div class="featured-item">
                <h3 style="margin-top:0;">🗺️ Map Actuelle</h3>
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="width:50px; height:50px; background:#333; border-radius:8px;"></div>
                    <div>
                        <strong style="color:white; font-size:1.2em;">Razzia de Gemmes</strong>
                        <div style="color:#aaa; font-size:0.9em;">Map: Mine Rocailleuse</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="nav-grid">
            <div class="nav-card" onclick="alert('Bientôt : Liste des Brawlers')">
                <span class="material-icons">face</span>
                <h2>Brawlers</h2>
                <p>Stats, Counters, Builds et Skins de tous les persos.</p>
            </div>

            <div class="nav-card" onclick="alert('Bientôt : Modes de jeu')">
                <span class="material-icons">sports_esports</span>
                <h2>Modes de Jeu</h2>
                <p>Règles, Rotations et meilleures compos.</p>
            </div>

            <div class="nav-card" onclick="alert('Bientôt : Mécaniques')">
                <span class="material-icons">build</span>
                <h2>Mécaniques</h2>
                <p>Gears, Stats d'état et fonctionnement du jeu.</p>
            </div>
        </div>
    `;
    
    // Ajout d'un écouteur sur la recherche (Mock)
    document.getElementById('global-search').addEventListener('keyup', (e) => {
        if(e.key === 'Enter') {
            alert('Recherche lancée pour : ' + e.target.value);
        }
    });
}

/**
 * Placeholder pour le détail Brawler
 */
function renderBrawlerDetail(id) {
    const app = document.getElementById('app');
    app.innerHTML = `<h1>Détail du Brawler : ${id}</h1><a href="index.html" style="color:#ffce00">< Retour</a>`;
}

function renderModesList() {
    const app = document.getElementById('app');
    app.innerHTML = `<h1>Liste des Modes</h1><a href="index.html" style="color:#ffce00">< Retour</a>`;
}

// Fonction de chargement des données (À implémenter plus tard)
async function loadData() {
    try {
        const response = await fetch('data/brawlers.json');
        appState.data.brawlers = await response.json();
    } catch (error) {
        console.error("Erreur chargement données:", error);
    }
}
