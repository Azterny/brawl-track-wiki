// script/wiki.js

const appState = {
    view: 'home', 
    data: {
        brawlers: {},
        modes: {},
        mechanics: {}
    }
};

// =========================================
// 1. INITIALISATION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    // On charge les fichiers JSON vides pour l'instant (évite les erreurs 404)
    await loadAllData(); 
    
    // Détection de la page via URL
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const id = params.get('id');

    // Routeur
    if (!page) {
        renderHome();
    } else if (page === 'brawlers_list') {
        renderBrawlersList(); // Nouvelle fonction
    } else if (page === 'brawler' && id) {
        renderBrawlerDetail(id);
    } else if (page === 'modes') {
        renderModesList();
    } else if (page === 'mechanics') {
        renderMechanics();
    } else {
        renderHome();
    }
}

// =========================================
// 2. CHARGEMENT DES DONNÉES
// =========================================
async function loadAllData() {
    try {
        // Promise.all pour charger en parallèle
        const [brawlers, modes, mechanics] = await Promise.all([
            fetch('data/brawlers.json').then(res => res.json()),
            fetch('data/modes.json').then(res => res.json()),
            fetch('data/mechanics.json').then(res => res.json())
        ]);

        appState.data.brawlers = brawlers;
        appState.data.modes = modes;
        appState.data.mechanics = mechanics;

        console.log("Données chargées (Vides pour l'instant):", appState.data);

    } catch (error) {
        console.error("Erreur chargement données. Vérifiez que les fichiers .json existent dans /data", error);
        document.getElementById('app').innerHTML = `<h3 style="color:red; text-align:center">Erreur: Impossible de charger les données JSON.</h3>`;
    }
}

// =========================================
// 3. VUES (RENDERING)
// =========================================

function renderHome() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="hero-section">
            <h1>BrawlOpédia</h1>
            <p style="color:#ccc; font-size:1.1em;">La base de connaissances ultime.</p>
            <div class="search-wrapper">
                <input type="text" id="global-search" placeholder="Rechercher...">
                <span class="material-icons search-icon">search</span>
            </div>
        </div>

        <div class="nav-grid">
            <div class="nav-card" onclick="window.location.href='?page=brawlers_list'">
                <span class="material-icons">face</span>
                <h2>Brawlers</h2>
                <p>Stats, Counters & Builds</p>
            </div>

            <div class="nav-card" onclick="window.location.href='?page=modes'">
                <span class="material-icons">sports_esports</span>
                <h2>Modes de Jeu</h2>
                <p>Règles & Rotations</p>
            </div>

            <div class="nav-card" onclick="window.location.href='?page=mechanics'">
                <span class="material-icons">build</span>
                <h2>Mécaniques</h2>
                <p>Gears & Star Powers</p>
            </div>
        </div>
    `;
}

// --- VUES TEMPORAIRES (En attendant le remplissage des JSON) ---

function renderBrawlersList() {
    const app = document.getElementById('app');
    // Vérification si JSON vide
    const isEmpty = Object.keys(appState.data.brawlers).length === 0;
    
    let content = `
        <a href="index.html" style="color:#ffce00; display:inline-block; margin-bottom:20px;">&larr; Retour Accueil</a>
        <h1>Liste des Brawlers</h1>
    `;

    if (isEmpty) {
        content += `<div style="background:#252525; padding:20px; border-radius:10px; text-align:center;">
                        <span class="material-icons" style="font-size:3em; color:#444">inbox</span>
                        <p>Aucun Brawler trouvé dans <code>data/brawlers.json</code>.</p>
                    </div>`;
    } else {
        // Ici on générera la grille plus tard
        content += `<p>Des données ont été trouvées ! (À implémenter)</p>`;
    }

    app.innerHTML = content;
}

function renderBrawlerDetail(id) {
    document.getElementById('app').innerHTML = `
        <a href="?page=brawlers_list" style="color:#ffce00">&larr; Retour Liste</a>
        <h1>Détails : ${id}</h1>
        <p>En attente de données...</p>
    `;
}

function renderModesList() {
    document.getElementById('app').innerHTML = `
        <a href="index.html" style="color:#ffce00">&larr; Retour Accueil</a>
        <h1>Modes de Jeu</h1>
        <p>Le fichier <code>modes.json</code> est vide.</p>
    `;
}

function renderMechanics() {
    document.getElementById('app').innerHTML = `
        <a href="index.html" style="color:#ffce00">&larr; Retour Accueil</a>
        <h1>Mécaniques & Gears</h1>
        <p>Le fichier <code>mechanics.json</code> est vide.</p>
    `;
}
