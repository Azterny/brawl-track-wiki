document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category'); // ex: 'brawlers', 'gadgets'

    if (!category) {
        renderCategories(); // Pas de paramètre ? Afficher l'accueil
    } else {
        renderList(category); // Paramètre présent ? Afficher la liste
    }
});

// 1. AFFICHER LES CATÉGORIES (Accueil)
function renderCategories() {
    const grid = document.getElementById('content-grid');
    
    const categories = [
        { key: 'brawlers', title: 'Brawlers', icon: 'face', desc: 'Stats, Attaques & Builds' },
        { key: 'gadgets', title: 'Gadgets', icon: 'build', desc: 'Tous les gadgets du jeu' },
        { key: 'maps', title: 'Maps', icon: 'map', desc: 'Cartes et Rotations' },
        { key: 'modes', title: 'Modes de Jeu', icon: 'sports_esports', desc: 'Règles et Astuces' }
    ];

    grid.innerHTML = categories.map(cat => `
        <div class="nav-card" onclick="window.location.href='?category=${cat.key}'">
            <span class="material-icons">${cat.icon}</span>
            <h2>${cat.title}</h2>
            <p>${cat.desc}</p>
        </div>
    `).join('');
}

// 2. AFFICHER UNE LISTE (ex: Liste des Brawlers)
async function renderList(category) {
    const grid = document.getElementById('content-grid');
    const title = document.getElementById('main-title');
    const sub = document.getElementById('sub-title');
    
    // Config selon la catégorie
    let fileJson = '';
    let linkPage = '';

    if (category === 'brawlers') {
        fileJson = 'data/brawlers.json';
        linkPage = 'brawler.html'; // Redirige vers la page Brawler
        title.innerText = "Tous les Brawlers";
    } else if (category === 'gadgets') {
        fileJson = 'data/gadgets.json';
        linkPage = 'gadget.html'; // Redirige vers la page Gadget
        title.innerText = "Tous les Gadgets";
    } else {
        grid.innerHTML = '<p>Catégorie inconnue ou en construction.</p>';
        return;
    }

    sub.innerHTML = `<a href="index.html" style="color:#ffce00">&larr; Retour Catégories</a>`;
    grid.innerHTML = '<div class="loader">Chargement...</div>';

    try {
        const response = await fetch(fileJson);
        const data = await response.json();
        grid.innerHTML = ''; // Vider le loader

        // Génération des cartes
        Object.values(data).forEach(item => {
            const card = document.createElement('a');
            card.className = 'brawler-card-link'; // Tu pourras renommer cette classe en 'generic-card-link' dans le CSS
            
            // On créé un lien avec l'ID de l'objet (nom transformé en ID pour les brawlers, ou ID direct)
            // Pour simplifier, on envoie l'ID ou la Clé
            const paramID = item.name.toUpperCase().replace(/ /g, '_').replace(/'/g, ''); 
            
            card.href = `${linkPage}?id=${paramID}`;
            
            card.innerHTML = `
                <div class="brawler-card">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100'">
                    <div class="brawler-info">
                        <h3>${item.name}</h3>
                        ${item.rarity ? `<span class="badge">${item.rarity}</span>` : ''}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="color:red">Erreur de chargement des données.</p>';
    }
}
