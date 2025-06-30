const API_BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/user';

const container = document.querySelector('#listaAlunos');

// Filtros
const nomeInput = document.getElementById('filter-nome');
const cidadeSelect = document.getElementById('filter-cidade');
const disciplinasSelect = document.getElementById('filter-disciplinas');

let alunos = [];

document.addEventListener('DOMContentLoaded', async () => {
    const dbAlunos = await fetchAlunos();
    const localStorageAlunos = getLocalStorageAlunos();

    console.log('Alunos da API:', dbAlunos);
    console.log('Alunos do localStorage:', localStorageAlunos);

    alunos = [...dbAlunos, ...localStorageAlunos];

    renderAlunos(alunos);
    populateFilters(alunos);
    attachFilterEvents();
});

async function fetchAlunos() {
    const res = await fetch(`${API_BASE_URL}${ENDPOINT}`);
    const data = await res.json();
    return data.filter(u => u.type === "aluno");
}

function getLocalStorageAlunos() {
    const localData = localStorage.getItem("alunosRegistrados");
    if (!localData) return [];

    try {
        const alunos = JSON.parse(localData);
        return alunos.filter(a => a.type === "aluno" || a.tipo === "aluno");
    } catch (e) {
        return [];
    }
}

function renderAlunos(data) {
    container.innerHTML = ''; 

    if (data.length === 0) {
        container.innerHTML = '<p>Nenhum aluno encontrado.</p>';
        return;
    }

    data.forEach(aluno => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.style.backgroundImage = `url(${aluno.image || 'https://via.placeholder.com/400x300'})`;

        card.innerHTML = `
            <div class="card-overlay">
                <div class="card-header">
                    <h3>${aluno.name}</h3>
                </div>
                <p><strong>Email:</strong> ${aluno.email}</p>
                <p><strong>Cidade:</strong> ${aluno.cidade || 'Não definida'}</p>
                <p><strong>Disciplinas:</strong> ${aluno.disciplinas?.join(', ') || 'Nenhuma'}</p>
            </div>
        `;

        container.appendChild(card);
    });
}

function salvarAlunoNoLocalStorage(novoAluno) {
    let alunosRegistrados = JSON.parse(localStorage.getItem("alunosRegistrados")) || [];

    // Verifica se o aluno já existe pelo id ou email, para não duplicar
    const existe = alunosRegistrados.some(a => a.id === novoAluno.id || a.email === novoAluno.email);
    if (!existe) {
        alunosRegistrados.push(novoAluno);
        localStorage.setItem("alunosRegistrados", JSON.stringify(alunosRegistrados));
    }
}

function populateFilters(data) {
    const cidades = [...new Set(data.map(a => a.cidade).filter(Boolean))];
    const disciplinas = [...new Set(data.flatMap(a => a.disciplinas || []))];

    cidadeSelect.innerHTML = `<option value="">Todas as cidades</option>` +
        cidades.map(c => `<option value="${c}">${c}</option>`).join('');

    disciplinasSelect.innerHTML =
        disciplinas.map(d => `<option value="${d}">${d}</option>`).join('');
}

function attachFilterEvents() {
    nomeInput?.addEventListener('input', filterAndRender);
    cidadeSelect?.addEventListener('change', filterAndRender);
    disciplinasSelect?.addEventListener('change', filterAndRender);
}

function filterAndRender() {
    let filtered = [...alunos];

    const nome = nomeInput?.value.toLowerCase() || '';
    const cidade = cidadeSelect?.value;
    const selectedDisciplinas = Array.from(disciplinasSelect?.selectedOptions || []).map(o => o.value);

    if (nome) {
        filtered = filtered.filter(a => a.name.toLowerCase().includes(nome));
    }

    if (cidade) {
        filtered = filtered.filter(a => a.cidade === cidade);
    }

    if (selectedDisciplinas.length > 0) {   
        filtered = filtered.filter(a =>
            selectedDisciplinas.every(d => a.disciplinas?.includes(d))
        );
    }

    renderAlunos(filtered);
}
