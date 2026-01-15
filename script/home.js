// script/home.js
const DATA_URL = 'data/brawlers.json';

document.addEventListener('DOMContentLoaded', () => {
    loadBrawlersGrid();
});

async function loadBrawlersGrid() {
    const grid = document.getElementById('brawlers-grid');
    
    // Sécurité si l'élément n'existe pas
    if (!grid) return;

    try {
        const response = await fetch(DATA_URL);
        const brawlers = await response.json();

        // On vide le loader
        grid.innerHTML = '';

        // On vérifie si le JSON est vide
        if (Object.keys(brawlers).length === 0) {
            grid.innerHTML = '<p>Aucune donnée trouvée.</p>';
            return;
        }

        // On génère les cartes
        Object.values(brawlers).forEach(brawler => {
            const card = document.createElement('a');
            card.className = 'brawler-card-link';
            // On pointe vers la page détail avec l'ID en paramètre
            card.href = `brawler.html?id=${brawler.name.toUpperCase()}`;
            
            card.innerHTML = `
                <div class="brawler-card">
                    <img src="${brawler.image}" alt="${brawler.name}" onerror="this.src='https://via.placeholder.com/100?text=?'">
                    <div class="brawler-info">
                        <h3>${brawler.name}</h3>
                        <span class="rarity-badge" data-rarity="${brawler.rarity}">${brawler.rarity}</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Erreur home.js :", error);
        grid.innerHTML = '<p style="color:red">Impossible de charger les Brawlers.</p>';
    }
}
