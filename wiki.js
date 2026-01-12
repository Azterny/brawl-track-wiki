let globalData = {};

document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
    
    // Gestion de la navigation via URL
    const params = new URLSearchParams(window.location.search);
    const brawlerId = params.get('brawler');

    if (brawlerId) {
        showDetail(brawlerId);
    } else {
        renderList(globalData);
    }
});

// 1. Charger le JSON
async function loadData() {
    try {
        const res = await fetch('data.json');
        globalData = await res.json();
    } catch (e) {
        console.error("Erreur chargement data:", e);
        document.getElementById('brawlers-grid').innerHTML = "Erreur de chargement des données.";
    }
}

// 2. Afficher la liste (Grille)
function renderList(data) {
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('view-detail').classList.add('hidden');
    
    const grid = document.getElementById('brawlers-grid');
    grid.innerHTML = '';

    // Convertir l'objet JSON en tableau pour trier si besoin
    Object.keys(data).forEach(key => {
        const b = data[key];
        
        const card = document.createElement('div');
        card.className = 'wiki-card';
        card.onclick = () => {
            // Changement d'URL sans recharger la page
            window.history.pushState({}, '', `?brawler=${key}`);
            showDetail(key);
        };

        card.innerHTML = `
            <img src="${b.image}" alt="${b.name}" loading="lazy">
            <h3>${b.name}</h3>
        `;
        grid.appendChild(card);
    });
}

// 3. Afficher le détail
function showDetail(key) {
    const b = globalData[key];
    if (!b) return renderList(globalData);

    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-detail').classList.remove('hidden');

    const container = document.getElementById('detail-content');
    
    // Construction du HTML de détail
    container.innerHTML = `
        <div class="detail-header">
            <img src="${b.image}" class="detail-img">
            <div>
                <h1 style="margin:0; font-size:2.5em; color:#ffce00;">${b.name}</h1>
                <span class="tag-role">${b.role}</span>
            </div>
        </div>

        <p style="font-size: 1.1em; line-height: 1.6;">${b.description}</p>

        <div class="counters-box">
            <h3 style="margin-top:0;">💡 Astuces</h3>
            <ul class="tips-list">
                ${b.tips.map(t => `<li>${t}</li>`).join('')}
            </ul>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div class="counters-box">
                <h3 class="text-green">✅ Fort Contre</h3>
                <ul>${b.counters.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>
            <div class="counters-box">
                <h3 class="text-red">❌ Faible Contre</h3>
                <ul>${b.weak_against.map(w => `<li>${w}</li>`).join('')}</ul>
            </div>
        </div>
    `;
}

// 4. Fonction Retour
function goBack() {
    window.history.pushState({}, '', window.location.pathname);
    renderList(globalData);
}

// 5. Barre de recherche
function filterBrawlers() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const filtered = {};
    
    Object.keys(globalData).forEach(key => {
        if (globalData[key].name.toLowerCase().includes(term)) {
            filtered[key] = globalData[key];
        }
    });
    
    const grid = document.getElementById('brawlers-grid');
    grid.innerHTML = '';
    
    // On réutilise la logique de rendu pour les résultats filtrés
    Object.keys(filtered).forEach(key => {
        const b = filtered[key];
        const card = document.createElement('div');
        card.className = 'wiki-card';
        card.onclick = () => {
            window.history.pushState({}, '', `?brawler=${key}`);
            showDetail(key);
        };
        card.innerHTML = `<img src="${b.image}"><h3>${b.name}</h3>`;
        grid.appendChild(card);
    });
}
