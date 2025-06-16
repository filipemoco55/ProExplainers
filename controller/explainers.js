const API_BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/explainer';

const container = document.querySelector('.recipe-container');

// Filtros
const nomeInput = document.getElementById('filter-nome');
const nivelSelect = document.getElementById('filter-nivel');
const precoSelect = document.getElementById('filter-preco');
const localSelect = document.getElementById('filter-local');
const disciplinasSelect = document.getElementById('filter-disciplinas');

let explicadores = [];

// Fetch inicial
document.addEventListener('DOMContentLoaded', async () => {
    explicadores = await fetchExplainers();
    renderExplainers(explicadores);
    populateDynamicFilters(explicadores);
    attachFilterEvents();
});

async function fetchExplainers() {
    const res = await fetch(`${API_BASE_URL}${ENDPOINT}`);
    return await res.json();
}

function renderExplainers(data) {
    container.innerHTML = ''; // limpa

    data.forEach(exp => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.style.backgroundImage = `url(${exp.image})`;

        card.innerHTML = `
            <div class="card-overlay">
                <div class="card-header">
                    <h3>${exp.name}</h3>
                    <span class="rating">${exp.classificacao} ⭐</span>
                </div>
                <p><strong>Local:</strong> ${exp.local}</p>
                <p><strong>Disciplinas:</strong> ${exp.disciplinas.join(', ')}</p>
            </div>
        `;

        // 👉 Evento de clique para abrir a página de detalhe
        card.addEventListener('click', () => {
            window.location.href = `explicador_detalhe.html?id=${exp.id}`;
        });

        container.appendChild(card);
    });

    // Armazena explicadores localmente para usar na página de detalhe
    localStorage.setItem("explicadores", JSON.stringify(data));
}

function populateDynamicFilters(data) {
    const niveis = [...new Set(data.map(e => e.nivel))];
    const locais = [...new Set(data.map(e => e.local))];
    const disciplinas = [...new Set(data.flatMap(e => e.disciplinas))];

    nivelSelect.innerHTML = `<option value="">Todos os níveis</option>` +
        niveis.map(n => `<option value="${n}">${n}</option>`).join('');

    localSelect.innerHTML = `<option value="">Todas as localidades</option>` +
        locais.map(l => `<option value="${l}">${l}</option>`).join('');

    disciplinasSelect.innerHTML =
        disciplinas.map(d => `<option value="${d}">${d}</option>`).join('');
}

function attachFilterEvents() {
    nomeInput?.addEventListener('input', filterAndRender);
    nivelSelect?.addEventListener('change', filterAndRender);
    precoSelect?.addEventListener('change', filterAndRender);
    localSelect?.addEventListener('change', filterAndRender);
    disciplinasSelect?.addEventListener('change', filterAndRender);
}

function filterAndRender() {
    let filtered = [...explicadores];

    const nome = nomeInput?.value.toLowerCase() || '';
    const nivel = nivelSelect?.value;
    const preco = precoSelect?.value;
    const local = localSelect?.value;
    const selectedDisciplinas = Array.from(disciplinasSelect?.selectedOptions || []).map(o => o.value);

    // Filtros aplicados
    if (nome) {
        filtered = filtered.filter(e => e.name.toLowerCase().includes(nome));
    }

    if (nivel) {
        filtered = filtered.filter(e => e.nivel === nivel);
    }

    if (preco) {
        const [min, max] = preco.split('-').map(Number);
        filtered = filtered.filter(e => e.preco >= min && e.preco <= max);
    }

    if (local) {
        filtered = filtered.filter(e => e.local === local);
    }

    if (selectedDisciplinas.length > 0) {
        filtered = filtered.filter(e =>
            selectedDisciplinas.every(d => e.disciplinas.includes(d))
        );
    }

    renderExplainers(filtered);
}
