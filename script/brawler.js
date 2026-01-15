// script/brawler.js
const DATA_URL = 'data/brawlers.json';

document.addEventListener('DOMContentLoaded', () => {
    loadBrawlerDetail();
});

async function loadBrawlerDetail() {
    const container = document.getElementById('brawler-detail-container');
    
    // Récupération de l'ID dans l'URL (ex: ?id=SHELLY)
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!container) return;

    if (!id) {
        container.innerHTML = '<h2>Erreur : Aucun Brawler spécifié.</h2><a href="index.html">Retour</a>';
        return;
    }

    try {
        const response = await fetch(DATA_URL);
        const data = await response.json();
        const brawler = data[id]; // On cherche la clé (ex: "SHELLY")

        if (!brawler) {
            container.innerHTML = `<h2>Brawler introuvable : ${id}</h2><a href="index.html">Retour</a>`;
            return;
        }

        // 1. Mise à jour du Titre de l'onglet
        document.title = `${brawler.name} - Wiki Brawl-Track`;

        // 2. Génération du contenu HTML
        container.innerHTML = `
            <div class="brawler-header">
                <div class="brawler-portrait">
                    <img src="${brawler.image}" alt="${brawler.name}" onerror="this.src='https://via.placeholder.com/150?text=?'">
                </div>
                <div class="brawler-header-info">
                    <h1 class="brawler-title">${brawler.name}</h1>
                    <div class="badges">
                        <span class="rarity-badge large" data-rarity="${brawler.rarity}">${brawler.rarity}</span>
                        <span class="class-badge">${brawler.class}</span>
                    </div>
                    <p class="brawler-desc">${brawler.description}</p>
                </div>
            </div>

            <div class="stats-container">
                <h2>Statistiques</h2>
                <table class="stats-table">
                    <tr>
                        <th>Niveau</th>
                        <th>PV (Santé)</th>
                        <th>Dégâts (Attaque)</th>
                    </tr>
                    <tr>
                        <td>Niv 1</td>
                        <td>${brawler.stats.hp_lvl1}</td>
                        <td>${brawler.stats.damage_lvl1}</td>
                    </tr>
                    <tr>
                        <td style="color:#ffce00; font-weight:bold;">Niv 11</td>
                        <td style="color:#ffce00; font-weight:bold;">${brawler.stats.hp_lvl11}</td>
                        <td style="color:#ffce00; font-weight:bold;">${brawler.stats.damage_lvl11}</td>
                    </tr>
                </table>
            </div>

            <div class="abilities-grid">
                <div class="ability-card">
                    <h3>⚔️ Attaque : ${brawler.attack.name}</h3>
                    <p>${brawler.attack.desc}</p>
                </div>
                <div class="ability-card super">
                    <h3>☠️ Super : ${brawler.super.name}</h3>
                    <p>${brawler.super.desc}</p>
                </div>
            </div>

            <div class="counters-section">
                <div class="counter-box green">
                    <h3>✅ Fort contre</h3>
                    <p>${brawler.weak_against ? brawler.weak_against.join(', ') : 'Aucune donnée'}</p>
                </div>
                <div class="counter-box red">
                    <h3>❌ Faible contre</h3>
                    <p>${brawler.counters ? brawler.counters.join(', ') : 'Aucune donnée'}</p>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Erreur brawler.js :", error);
        container.innerHTML = '<p style="color:red">Erreur technique lors du chargement du profil.</p>';
    }
}
