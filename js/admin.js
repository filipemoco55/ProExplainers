const API_BASE_URL = 'http://localhost:3000';

let listaCompletaDeUtilizadores = [];
let listaCompletaDeDisciplinas = [];

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    if (id === 'utilizadores') mostrarUtilizadores();
    if (id === 'disciplinas') mostrarDisciplinas();
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function toggleProfileMenu() {
    const menu = document.getElementById("dropdown");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function logout() {
    localStorage.removeItem('tipoConta');
    window.location.href = 'login.html';
}

async function mostrarUtilizadores() {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';

    let apiUsers = [], apiExplainers = [];
    try {
        const [resU, resE] = await Promise.all([
            fetch(`${API_BASE_URL}/user`),
            fetch(`${API_BASE_URL}/explainer`)
        ]);
        apiUsers = await resU.json();
        apiExplainers = await resE.json();
    } catch (err) {
        console.warn('Erro ao buscar utilizadores da API:', err);
    }

    const localUsers = JSON.parse(localStorage.getItem('utilizadores')) || [];

    const todos = [
        ...apiUsers.map(u => ({
            ...u,
            origem: 'api',
            tipo: u.tipo || u.type || 'desconhecido',
            nome: u.nome || u.name || 'Sem nome'
        })),
        ...apiExplainers.map(u => ({
            ...u,
            origem: 'api',
            tipo: u.tipo || u.type || 'explainer',
            nome: u.nome || u.name || 'Sem nome'
        })),
        ...localUsers.map(u => ({
            ...u,
            origem: 'local',
            tipo: u.tipo || u.type || 'local',
            nome: u.nome || u.name || 'Sem nome'
        }))
    ];

    listaCompletaDeUtilizadores = todos;

    todos.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.nome || '—'}</td>
            <td>${user.email || '—'}</td>
            <td>${user.tipo || '—'}</td>
            <td>
                <button onclick="editarUtilizador('${user.id}', '${user.origem}')">Editar</button>
                <button onclick="removerUtilizador('${user.id}', '${user.origem}')">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function adicionarUtilizador() {
    const nome = document.getElementById('addNome').value.trim();
    const email = document.getElementById('addEmail').value.trim();
    const tipoRaw = document.getElementById('addTipo').value;
    const password = document.getElementById('addPassword').value;

    if (!nome || !email || !tipoRaw || !password) return alert('Preencha todos os campos.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return alert('Email inválido.');

    let utilizadores = JSON.parse(localStorage.getItem('utilizadores')) || [];
    if (utilizadores.some(u => u.email.toLowerCase() === email.toLowerCase()))
        return alert('Email já existe.');

    const tipo = tipoRaw.toLowerCase();
    const novo = {
        id: crypto.randomUUID(),
        nome,
        email,
        tipo,
        type: tipo,
        name: nome,
        password,
        image: 'https://via.placeholder.com/150'
    };

    utilizadores.push(novo);
    localStorage.setItem('utilizadores', JSON.stringify(utilizadores));

    document.getElementById('addNome').value = '';
    document.getElementById('addEmail').value = '';
    document.getElementById('addTipo').value = '';
    document.getElementById('addPassword').value = '';

    closeModal('addUserModal');
    mostrarUtilizadores();
}

function editarUtilizador(id, origem) {
    alert(`Função editar utilizador ainda não implementada (${origem})`);
}

async function removerUtilizador(id, origem) {
    if (!confirm('Remover este utilizador?')) return;

    if (origem === 'local') {
        let utilizadores = JSON.parse(localStorage.getItem('utilizadores')) || [];
        utilizadores = utilizadores.filter(u => u.id !== id);
        localStorage.setItem('utilizadores', JSON.stringify(utilizadores));
        mostrarUtilizadores();
    } else {
        try {
            const res = await fetch(`${API_BASE_URL}/user/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Removido com sucesso.');
                mostrarUtilizadores();
            } else alert('Erro ao remover da API.');
        } catch (err) {
            console.error(err);
            alert('Erro de comunicação com a API.');
        }
    }
}

function filtrarUtilizadores() {
    const filtro = document.getElementById('searchUser').value.toLowerCase();
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';

    const filtrados = listaCompletaDeUtilizadores.filter(user =>
        (user.nome || '').toLowerCase().includes(filtro) ||
        (user.email || '').toLowerCase().includes(filtro) ||
        (user.tipo || '').toLowerCase().includes(filtro)
    );

    filtrados.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.nome || '—'}</td>
            <td>${user.email || '—'}</td>
            <td>${user.tipo || '—'}</td>
            <td>
                <button onclick="editarUtilizador('${user.id}', '${user.origem}')">Editar</button>
                <button onclick="removerUtilizador('${user.id}', '${user.origem}')">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function mostrarDisciplinas() {
    const tbody = document.getElementById('disciplinaTableBody');
    tbody.innerHTML = '';

    const locais = JSON.parse(localStorage.getItem('disciplinas')) || [];

    let apiDisciplinas = [];
    try {
        const resposta = await fetch(`${API_BASE_URL}/explainer`);
        const explicadores = await resposta.json();
        explicadores.forEach(exp => {
            if (Array.isArray(exp.disciplinas)) {
                exp.disciplinas.forEach(d => {
                    if (!apiDisciplinas.includes(d)) apiDisciplinas.push(d);
                });
            }
        });
    } catch (err) {
        console.warn('Erro ao buscar disciplinas da API:', err);
    }

    const todas = [...new Set([...locais.map(d => d.nome), ...apiDisciplinas])];
    listaCompletaDeDisciplinas = todas.map(nome => ({ id: crypto.randomUUID(), nome }));

    listaCompletaDeDisciplinas.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${d.nome}</td>
            <td>
                <button onclick="editarDisciplina('${d.id}')">Editar</button>
                <button onclick="removerDisciplina('${d.id}')">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function adicionarDisciplina() {
    const nome = document.getElementById('addDisciplinaNome').value.trim();

    if (!nome) {
        alert('Insira o nome da disciplina.');
        return;
    }

    let disciplinas = JSON.parse(localStorage.getItem('disciplinas')) || [];

    if (disciplinas.some(d => d.nome.toLowerCase() === nome.toLowerCase())) {
        alert('Já existe uma disciplina com esse nome.');
        return;
    }

    const novaDisciplina = {
        id: crypto.randomUUID(),
        nome
    };

    disciplinas.push(novaDisciplina);
    localStorage.setItem('disciplinas', JSON.stringify(disciplinas));

    document.getElementById('addDisciplinaNome').value = '';
    closeModal('addDisciplinaModal');
    mostrarDisciplinas();
}

function removerDisciplina(id) {
    if (!confirm('Remover esta disciplina?')) return;
    let disciplinas = JSON.parse(localStorage.getItem('disciplinas')) || [];
    disciplinas = disciplinas.filter(d => d.id !== id);
    localStorage.setItem('disciplinas', JSON.stringify(disciplinas));
    mostrarDisciplinas();
}

function editarDisciplina(id) {
    alert(`Função editar disciplina ainda não implementada (${id})`);
}

function filtrarDisciplinas() {
    const termo = document.getElementById('searchDisciplina').value.toLowerCase();
    const tbody = document.getElementById('disciplinaTableBody');
    tbody.innerHTML = '';

    const filtradas = listaCompletaDeDisciplinas.filter(d =>
        d.nome.toLowerCase().includes(termo)
    );

    filtradas.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${d.nome}</td>
            <td>
                <button onclick="editarDisciplina('${d.id}')">Editar</button>
                <button onclick="removerDisciplina('${d.id}')">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const tipo = localStorage.getItem('tipoConta');
    if (tipo !== 'admin') {
        alert('Acesso restrito a administradores.');
        window.location.href = 'index.html';
        return;
    }
    mostrarUtilizadores();
});
