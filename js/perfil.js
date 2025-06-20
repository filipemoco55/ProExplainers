document.addEventListener('DOMContentLoaded', () => {
    const tipoConta = localStorage.getItem('tipoConta');
    const userRaw = localStorage.getItem('utilizadorAtual');

    if (!tipoConta || !userRaw) {
        alert('Utilizador não autenticado');
        window.location.href = 'login.html';
        return;
    }

    const tipo = tipoConta.toLowerCase();
    const user = JSON.parse(userRaw);

    document.getElementById('adminProfile').style.display = 'none';
    document.getElementById('userProfile').style.display = 'none';
    document.getElementById('explainerProfile').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'none';

    if (tipo === 'admin') {
        document.getElementById('adminProfile').style.display = 'flex';
    } else if (tipo === 'aluno') {
        document.getElementById('userProfile').style.display = 'flex';
    } else if (tipo === 'explicador') {
        document.getElementById('explainerProfile').style.display = 'flex';
    }

    document.getElementById('boasVindas').textContent = `Bem-vindo, ${user.name || 'Utilizador'}!`;

    const infoLista = document.getElementById('infoContaLista');
    infoLista.innerHTML = '';

    const appendInfo = (label, valor) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${label}:</strong> ${valor}`;
        infoLista.appendChild(li);
    };

    appendInfo('Nome', user.name || 'Sem nome');
    appendInfo('Email', user.email || 'Sem email');
    appendInfo('Tipo de Conta', tipoConta);

    if (tipo === 'aluno' || tipo === 'explicador') {
        const pontos = user.pontos || 0;
        const nivel = user.nivel || 'Iniciante';
        appendInfo('Pontos', pontos);
        appendInfo('Nível', nivel);

        const progresso = document.getElementById('progressoNivel');
        progresso.value = pontos;
        progresso.max = 200;
        const faltam = 200 - pontos;
        document.getElementById('faltamPontos').textContent = faltam > 0 ? faltam : '0';
    }

    if (tipo === 'explicador') {
        appendInfo('Disciplinas', user.disciplinas || 'Não definidas');
        appendInfo('Disponibilidade', user.disponibilidade || 'Não definida');
        appendInfo('Modalidade', user.modalidade || 'Não definida');
        appendInfo('Preço por sessão', `${user.preco || '0'} €`);
        appendInfo('Localização', user.localizacao || 'Não definida');
    }

    const favoritos = user.favoritos || [];
    const listaFavoritosEl = document.getElementById('listaFavoritos');
    favoritos.forEach(fav => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${fav.name} - €${fav.preco} (${fav.modalidade})
            <button onclick="abrirChat('${user.email}', '${fav.email}', '${fav.name}')">💬 Chat</button>
        `;
        listaFavoritosEl.appendChild(li);
    });



    const logoutElements = document.querySelectorAll('a[onclick*="logout"]');
    logoutElements.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    });

        carregarDadosParaLocalStorage();

    carregarMarcacoes(user.email);

});

function carregarMarcacoes() {
    const marcacoes = JSON.parse(localStorage.getItem('marcacoes')) || [];
    const utilizador = JSON.parse(localStorage.getItem('utilizadorAtual'));
    const lista = document.getElementById('listaMarcacoes');
    lista.innerHTML = '';

    if (!utilizador) {
        lista.innerHTML = '<li>Utilizador não autenticado.</li>';
        return;
    }

    let minhasMarcacoes = [];

    if (utilizador.type === 'aluno') {
        minhasMarcacoes = marcacoes.filter(m => m.alunoEmail === utilizador.email);
    } else if (utilizador.type === 'explicador' || utilizador.tipo === 'explicador') {
        minhasMarcacoes = marcacoes.filter(m => String(m.explainerId) === String(utilizador.id));
    }

    if (minhasMarcacoes.length === 0) {
        lista.innerHTML = '<li>Não há marcações registradas.</li>';
    } else {
        minhasMarcacoes.forEach(marcacao => {
            let outroUtilizador;

            if (utilizador.type === 'aluno') {
                outroUtilizador = buscarExplicadorPorId(marcacao.explainerId);
            } else {
                outroUtilizador = buscarAlunoPorEmail(marcacao.alunoEmail);
            }

            console.log('Outro utilizador encontrado:', outroUtilizador);

            const nomeOutro = outroUtilizador ? (outroUtilizador.name || outroUtilizador.nome) : 'Utilizador desconhecido';

            const li = document.createElement('li');
            li.textContent = `${marcacao.data} - com ${nomeOutro} às ${marcacao.hora}`;
            lista.appendChild(li);
        });
    }
}

async function carregarDadosParaLocalStorage() {
  try {
    // Buscar alunos e explicadores
    const [resUsers, resExplainers] = await Promise.all([
      fetch('http://localhost:3000/user'),
      fetch('http://localhost:3000/explainer')
    ]);

    if (!resUsers.ok || !resExplainers.ok) {
      throw new Error('Erro ao buscar dados da API');
    }

    const users = await resUsers.json();
    const explainers = await resExplainers.json();

    // Junta os dois arrays num só, com propriedade 'type' para distinguir
    const utilizadores = [
      ...users.map(u => ({ ...u, type: u.type || 'aluno', nome: u.name || u.nome })),
      ...explainers.map(e => ({ ...e, type: 'explicador', nome: e.name || e.nome }))
    ];

    // Guarda tudo no localStorage
    localStorage.setItem('utilizadores', JSON.stringify(utilizadores));
    localStorage.setItem('explicadores', JSON.stringify(explainers));

    console.log('Dados carregados para localStorage');
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

function buscarAlunoPorEmail(email) {
    const alunos = JSON.parse(localStorage.getItem('utilizadores')) || [];
    const explicadores = JSON.parse(localStorage.getItem('explicadores')) || [];

    let aluno = alunos.find(u => u.email === email);
    if (!aluno) {
        // Caso não encontre no alunos, tenta nos explicadores (se quiseres)
        aluno = explicadores.find(u => u.email === email);
    }
    return aluno;
}


function buscarExplicadorPorId(id) {
    const explicadores = JSON.parse(localStorage.getItem('explicadores')) || [];
    return explicadores.find(explicador => String(explicador.id) === String(id));
}


function toggleProfileMenu() {
    const dropdown = document.getElementById('dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function toggleUserMenu() {
    const dropdown = document.getElementById('dropdownUser');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function toggleExplainerMenu() {
    const dropdown = document.getElementById('dropdownExplainer');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function logout() {
    window.location.href = 'login.html';
}
