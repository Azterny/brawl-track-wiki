document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); // ex: SHELLY

    if(!id) return;

    try {
        const response = await fetch('data/brawlers.json');
        const data = await response.json();
        const brawler = data[id];

        if (!brawler) throw new Error("Brawler introuvable");

        renderBrawler(brawler);
    } catch (e) {
        document.body.innerHTML = `<h1 style="color:red">${e.message}</h1>`;
    }
});

function renderBrawler(b) {
    // 1. Header (Image, Nom, Rareté, Classe...)
    document.getElementById('b-image').src = b.image;
    document.getElementById('b-name').innerText = b.name;
    document.getElementById('b-rarity').innerText = b.rarity;
    document.getElementById('b-class').innerText = b.class;
    document.getElementById('b-speed').innerText = b.speed;
    document.getElementById('b-desc').innerText = b.description;
    document.getElementById('b-hypercharge').innerText = b.hypercharge || "Aucune";

    // 2. Stats & Attaques
    document.getElementById('b-hp').innerText = b.hp_lvl1;
    document.getElementById('b-attack').innerText = b.attack_name;
    document.getElementById('b-super').innerText = b.super_name;

    // 3. Listes (Gadgets, Star Powers...)
    // Fonction utilitaire pour créer des boutons liens
    const createLinks = (list, targetPage) => {
        if(!list) return 'Aucun';
        return list.map(itemName => {
            // Transforme "Avance Rapide" en "AVANCE_RAPIDE" pour l'ID URL
            const urlId = itemName.toUpperCase().replace(/ /g, '_').replace(/'/g, '');
            return `<a href="${targetPage}?id=${urlId}" class="item-chip">${itemName}</a>`;
        }).join(' ');
    };

    document.getElementById('list-gadgets').innerHTML = createLinks(b.gadgets, 'gadget.html');
    document.getElementById('list-starpowers').innerHTML = createLinks(b.star_powers, 'starpower.html');
    document.getElementById('list-gears').innerHTML = createLinks(b.gears, 'gear.html');
    
    // Traits (Pas de lien, juste du texte)
    document.getElementById('list-traits').innerHTML = b.traits.length ? b.traits.join(', ') : "Aucun";
}
