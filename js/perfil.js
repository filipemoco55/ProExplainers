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

    carregarMensagens(user.email);

    // Agora o logout só redireciona, NÃO apaga nada do localStorage
    const logoutElements = document.querySelectorAll('a[onclick*="logout"]');
    logoutElements.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            // localStorage.clear();  <-- REMOVIDO para não apagar nada
            window.location.href = 'login.html';
        });
    });

    carregarMarcacoes(user.email);
});

function abrirChat(de, para, nomePara) {
    const chatKey = `chat_${de}_${para}`;
    const historico = JSON.parse(localStorage.getItem(chatKey)) || [];
    const novaMensagem = prompt(`Mensagem para ${nomePara}:`);

    if (!novaMensagem) return;

    historico.push({ de, para, texto: novaMensagem, data: new Date().toISOString() });
    localStorage.setItem(chatKey, JSON.stringify(historico));

    alert('Mensagem enviada!');
    location.reload();
}

function carregarMensagens(emailAluno) {
    const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];
    const todasAsConversas = mensagens.filter(m => m.de === emailAluno || m.para === emailAluno);

    const agrupadasPorExplicador = {};

    todasAsConversas.forEach(msg => {
        const outroEmail = msg.de === emailAluno ? msg.para : msg.de;
        if (!agrupadasPorExplicador[outroEmail]) {
            agrupadasPorExplicador[outroEmail] = [];
        }
        agrupadasPorExplicador[outroEmail].push(msg);
    });

    const section = document.createElement('section');
    section.className = 'mensagens-section';
    section.innerHTML = '<h2>📩 Conversas com Explicadores</h2>';

    Object.entries(agrupadasPorExplicador).forEach(([emailExplicador, conversas]) => {
        const div = document.createElement('div');
        div.classList.add('mensagem-card');

        const explicador = buscarExplicadorPorEmail(emailExplicador);
        const nomeExplicador = explicador ? explicador.name : emailExplicador;

        const titulo = document.createElement('h3');
        titulo.textContent = `📨 ${nomeExplicador}`;
        div.appendChild(titulo);

        conversas.forEach(msg => {
            const bloco = document.createElement('div');
            bloco.innerHTML = `
                <p><strong>Tu:</strong> ${msg.mensagem}</p>
                <p><strong>${nomeExplicador}:</strong> ${msg.resposta || '<i>Sem resposta ainda</i>'}</p>
                <hr>
            `;
            div.appendChild(bloco);
        });

        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Responder ao explicador...';
        div.appendChild(textarea);

        const btn = document.createElement('button');
        btn.textContent = 'Enviar resposta';
        btn.onclick = () => {
            const novaMensagem = textarea.value.trim();
            if (!novaMensagem) return;

            const nova = {
                id: crypto.randomUUID(),
                de: emailAluno,
                para: emailExplicador,
                mensagem: novaMensagem,
                resposta: ""
            };

            mensagens.push(nova);
            localStorage.setItem("mensagens", JSON.stringify(mensagens));
            alert('Mensagem enviada!');
            location.reload();
        };

        div.appendChild(btn);
        section.appendChild(div);
    });

    document.querySelector('.container').appendChild(section);
}

function carregarMarcacoes(emailAluno) {
    const marcacoes = JSON.parse(localStorage.getItem('marcacoes')) || [];
    const minhasMarcacoes = marcacoes.filter(m => m.alunoEmail === emailAluno);

    const lista = document.getElementById('listaMarcacoes');
    lista.innerHTML = '';

    if (minhasMarcacoes.length === 0) {
        lista.innerHTML = '<li>Não há marcações registradas.</li>';
    } else {
        minhasMarcacoes.forEach(marcacao => {
            const explicador = buscarExplicadorPorId(marcacao.explainerId);
            const nomeExplicador = explicador ? explicador.name : `Explicador ${marcacao.explainerId}`;

            const li = document.createElement('li');
            li.textContent = `${marcacao.data} - com ${nomeExplicador} às ${marcacao.hora}`;
            lista.appendChild(li);
        });
    }
}



function buscarExplicadorPorEmail(email) {
    const explicadores = JSON.parse(localStorage.getItem("explicadores")) || [];
    return explicadores.find(e => e.email === email);
}

function buscarExplicadorPorId(id) {
    const explicadores = JSON.parse(localStorage.getItem("explicadores")) || [];
    return explicadores.find(e => e.id == id);
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
    // Se usares este logout diretamente no onclick de um botão, faz só isto:
    window.location.href = 'login.html';
}
