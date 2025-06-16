window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

window.addEventListener('scroll', () => {
    const backToTopButton = document.getElementById('back-to-top');
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links.mobile');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('show');
});

window.addEventListener('DOMContentLoaded', () => {
    const tipo = localStorage.getItem('tipoConta');
    const loginBtn = document.getElementById('loginBtn');
    const adminProfile = document.getElementById('adminProfile');
    const userProfile = document.getElementById('userProfile');

    if (tipo === 'admin') {
        if (loginBtn) loginBtn.style.display = 'none';
        if (adminProfile) adminProfile.style.display = 'inline-block';
        if (userProfile) userProfile.style.display = 'none';
    } else if (tipo === 'aluno' || tipo === 'explicador') {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'inline-block';
        if (adminProfile) adminProfile.style.display = 'none';
    } else {
        // Nenhum login
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (adminProfile) adminProfile.style.display = 'none';
        if (userProfile) userProfile.style.display = 'none';
    }
});

function toggleProfileMenu() {
    const dropdown = document.getElementById('dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function toggleUserMenu() {
    const dropdownUser = document.getElementById('dropdownUser');
    dropdownUser.style.display = dropdownUser.style.display === 'block' ? 'none' : 'block';
}

function logout(event) {
    if (event) event.preventDefault();
    window.location.href = 'login.html';
}

window.addEventListener('click', function (e) {
    const dropdown = document.getElementById('dropdown');
    const profileIcon = document.querySelector('#adminProfile .profile-icon');
    if (dropdown && profileIcon && !profileIcon.contains(e.target)) {
        dropdown.style.display = 'none';
    }

    const dropdownUser = document.getElementById('dropdownUser');
    const userIcon = document.querySelector('#userProfile .profile-icon');
    if (dropdownUser && userIcon && !userIcon.contains(e.target)) {
        dropdownUser.style.display = 'none';
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const tipo = localStorage.getItem('tipoConta');
    const nome = localStorage.getItem('nomeUsuario') || "Aluno";
    const userProfile = document.getElementById('userProfile');
    const nomeUsuarioSpan = document.getElementById('nomeUsuario');

    if (tipo === 'aluno') {
        if (userProfile) {
            userProfile.style.display = 'inline-block';
            if (nomeUsuarioSpan) nomeUsuarioSpan.textContent = nome;
        }

        document.getElementById('mensagensContainer').style.display = 'block';
        mostrarConversasComExplicadores();
    }
});

function mostrarConversasComExplicadores() {
    const tipoConta = localStorage.getItem("tipoConta");
    const utilizadorAtual = JSON.parse(localStorage.getItem("utilizadorAtual"));
    if (tipoConta !== "aluno" || !utilizadorAtual) return;

    const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];
    const conversasPorExplicador = {};

    mensagens.forEach(msg => {
        if (msg.de === utilizadorAtual.email || msg.para === utilizadorAtual.email) {
            const outroEmail = msg.de === utilizadorAtual.email ? msg.para : msg.de;
            if (!conversasPorExplicador[outroEmail]) {
                conversasPorExplicador[outroEmail] = [];
            }
            conversasPorExplicador[outroEmail].push(msg);
        }
    });

    const container = document.getElementById("mensagensContainer");
    if (!container) return;
    container.innerHTML = "<h2>As tuas mensagens</h2>";

    if (Object.keys(conversasPorExplicador).length === 0) {
        container.innerHTML += "<p>Sem mensagens com explicadores.</p>";
        return;
    }

    const explicadores = JSON.parse(localStorage.getItem("explicadores")) || [];

    Object.entries(conversasPorExplicador).forEach(([emailExplicador, mensagensExplicador]) => {
        mensagensExplicador.sort((a, b) => new Date(a.data) - new Date(b.data));

        const div = document.createElement("div");
        div.classList.add("conversa-aluno");

        const explicadorObj = explicadores.find(e => e.email === emailExplicador);
        const nomeExplicador = explicadorObj ? explicadorObj.name : emailExplicador;

        div.innerHTML = `<h3>Conversas com: ${nomeExplicador}</h3>`;

        mensagensExplicador.forEach(msg => {
            const remetente = msg.de === utilizadorAtual.email ? "Tu (Aluno)" : nomeExplicador;
            div.innerHTML += `<p><strong>${remetente}:</strong> ${msg.mensagem}</p><hr>`;
        });

        div.innerHTML += `
      <textarea id="resposta-${emailExplicador}" placeholder="Escreve uma resposta..."></textarea>
      <button onclick="responderAoExplicador('${emailExplicador}')">Enviar Resposta</button>
    `;

        container.appendChild(div);
    });
}

function responderAoExplicador(emailExplicador) {
    const tipoConta = localStorage.getItem("tipoConta");
    const utilizadorAtual = JSON.parse(localStorage.getItem("utilizadorAtual"));
    if (tipoConta !== "aluno" || !utilizadorAtual) return alert("Apenas alunos podem responder.");

    const textarea = document.getElementById(`resposta-${emailExplicador}`);
    if (!textarea) return;

    const texto = textarea.value.trim();
    if (!texto) return alert("Escreve uma resposta antes de enviar.");

    const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];

    const novaMsg = {
        id: crypto.randomUUID(),
        de: utilizadorAtual.email,
        para: emailExplicador,
        mensagem: texto,
        data: new Date().toISOString()
    };

    mensagens.push(novaMsg);
    localStorage.setItem("mensagens", JSON.stringify(mensagens));

    alert("Mensagem enviada!");
    textarea.value = "";
    mostrarConversasComExplicadores();
}
