document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const explicadorId = params.get("id");
  const explicadores = JSON.parse(localStorage.getItem("explicadores")) || [];
  const explicador = explicadores.find(e => e.id === explicadorId);

  if (!explicador) {
    document.getElementById("explicadorInfo").innerHTML = "<p>Explicador não encontrado.</p>";
    document.getElementById("mensagensRecebidas").style.display = "none";
    document.getElementById("mensagemSecao").style.display = "none";
    return;
  }

  document.getElementById("explicadorInfo").innerHTML = `
    <img src="${explicador.image}" alt="${explicador.name}" class="foto-explicador" style="width:150px; border-radius:10px; margin-bottom:10px;">
    <p><strong>Nome:</strong> ${explicador.name}</p>
    <p><strong>Email:</strong> ${explicador.email}</p>
    <p><strong>Disciplinas:</strong> ${Array.isArray(explicador.disciplinas) ? explicador.disciplinas.join(', ') : explicador.disciplinas}</p>
    <p><strong>Preço:</strong> €${explicador.preco}</p>
    <p><strong>Localização:</strong> ${explicador.localizacao || explicador.local}</p>
    <p><strong>Disponibilidade:</strong> ${Array.isArray(explicador.disponibilidade) ? explicador.disponibilidade.join(', ') : explicador.disponibilidade}</p>
    <p><strong>Modalidade:</strong> ${explicador.modalidade || 'Não definida'}</p>
  `;

  const utilizadorAtual = JSON.parse(localStorage.getItem("utilizadorAtual"));
  const tipoConta = localStorage.getItem("tipoConta");

  if (tipoConta === "Explicador" && utilizadorAtual?.id === explicador.id) {
    document.getElementById("mensagensRecebidas").style.display = "block";
    mostrarMensagensRecebidas(explicador.email);
    document.getElementById("mensagemSecao").style.display = "none";
  }
});


function enviarMensagem() {
  const mensagemTexto = document.getElementById("mensagemTexto").value.trim();
  if (!mensagemTexto) return alert("Escreve uma mensagem.");

  const remetente = JSON.parse(localStorage.getItem("utilizadorAtual"));
  if (!remetente) return alert("Utilizador não autenticado.");

  const params = new URLSearchParams(window.location.search);
  const destinatarioId = params.get("id");
  const explicadores = JSON.parse(localStorage.getItem("explicadores")) || [];
  const destinatario = explicadores.find(e => e.id === destinatarioId);
  if (!destinatario) return alert("Explicador não encontrado.");

  const novaMensagem = {
    id: crypto.randomUUID(),
    de: remetente.email,
    para: destinatario.email,
    mensagem: mensagemTexto,
    resposta: ""
  };

  const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];
  mensagens.push(novaMensagem);
  localStorage.setItem("mensagens", JSON.stringify(mensagens));

  document.getElementById("mensagemTexto").value = "";
  document.getElementById("mensagemTexto").placeholder = "Mensagem enviada!";
  alert("Mensagem enviada com sucesso!");

  mostrarMensagensEnviadas(remetente.email, destinatario.email);
}

function mostrarMensagensEnviadas(emailAluno, emailExplicador) {
  const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];
  const enviadas = mensagens.filter(m => m.de === emailAluno && m.para === emailExplicador);

  const lista = document.getElementById("mensagensLista");
  lista.innerHTML = "";

  if (enviadas.length === 0) {
    lista.innerHTML = "<li>Sem mensagens enviadas.</li>";
    return;
  }

  enviadas.forEach(msg => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>Tu:</strong> ${msg.mensagem}<br>
      <small>${msg.resposta ? "Resposta: " + msg.resposta : "Sem resposta ainda"}</small>
      <hr>
    `;
    lista.appendChild(li);
  });

  document.getElementById("mensagensRecebidas").style.display = "block";
}

function mostrarMensagensRecebidas(emailExplicador) {
  const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];
  const recebidas = mensagens.filter(m => m.para === emailExplicador);

  const lista = document.getElementById("mensagensLista");
  lista.innerHTML = "";

  if (recebidas.length === 0) {
    lista.innerHTML = "<li>Sem mensagens ainda.</li>";
    return;
  }

  recebidas.forEach(msg => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${msg.de}</strong>:<br>
      ${msg.mensagem}<br>
      <small>${msg.resposta ? "Resposta: " + msg.resposta : "Sem resposta ainda"}</small><br>
      <textarea id="resposta-${msg.id}" placeholder="Responder...">${msg.resposta || ''}</textarea>
      <button onclick="responderMensagem('${msg.id}')">Responder</button>
      <hr>
    `;
    lista.appendChild(li);
  });
}

function responderMensagem(id) {
  const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];
  const msgIndex = mensagens.findIndex(m => m.id === id);
  if (msgIndex === -1) return alert('Mensagem não encontrada');

  const textarea = document.getElementById(`resposta-${id}`);
  const resposta = textarea.value.trim();

  mensagens[msgIndex].resposta = resposta;
  localStorage.setItem("mensagens", JSON.stringify(mensagens));
  alert('Resposta enviada com sucesso!');
  mostrarMensagensRecebidas(mensagens[msgIndex].para);
}

window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
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
