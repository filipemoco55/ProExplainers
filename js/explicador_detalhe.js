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

  inicializarAvaliacao(explicador);
  inicializarReserva(explicador);
  gerarDiasSemana(explicador);

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

function inicializarAvaliacao(explicador) {
  const estrelasContainer = document.getElementById("estrelasContainer");
  const mediaEstrelas = document.getElementById("mediaEstrelas");
  const utilizadorAtual = JSON.parse(localStorage.getItem("utilizadorAtual"));

  if (!explicador.avaliacoes) explicador.avaliacoes = [];

  const avaliacaoUtilizador = explicador.avaliacoes.find(a => a.userId === utilizadorAtual?.id);
  const notaAtual = avaliacaoUtilizador ? avaliacaoUtilizador.nota : 0;

  estrelasContainer.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    const estrela = document.createElement("span");
    estrela.textContent = "★";
    estrela.style.cursor = "pointer";
    estrela.style.fontSize = "24px";
    estrela.style.color = i <= notaAtual ? "gold" : "gray";

    estrela.onclick = () => {
      avaliarExplicador(explicador.id, i);
    };

    estrelasContainer.appendChild(estrela);
  }

  // Mostra só o valor do campo classificacao, arredondado a 1 decimal
  const classificacao = explicador.classificacao ? explicador.classificacao.toFixed(1) : "0.0";
  mediaEstrelas.textContent = `${classificacao}`;
}



function avaliarExplicador(explicadorId, nota) {
  const explicadores = JSON.parse(localStorage.getItem("explicadores")) || [];
  const utilizadorAtual = JSON.parse(localStorage.getItem("utilizadorAtual"));

  if (!utilizadorAtual) {
    return alert("Precisas de estar autenticado para avaliar.");
  }

  const explicador = explicadores.find(e => e.id === explicadorId);
  if (!explicador) return alert("Explicador não encontrado.");

  if (!explicador.avaliacoes) explicador.avaliacoes = [];

  const avaliacaoExistente = explicador.avaliacoes.find(a => a.userId === utilizadorAtual.id);
  if (avaliacaoExistente) {
    // Atualiza nota do utilizador que já avaliou
    avaliacaoExistente.nota = nota;
  } else {
    // Adiciona nova avaliação
    explicador.avaliacoes.push({ userId: utilizadorAtual.id, nota });
  }

  // Recalcula a média de todas as avaliações
  const somaNotas = explicador.avaliacoes.reduce((acc, a) => acc + a.nota, 0);
  const media = somaNotas / explicador.avaliacoes.length;
  explicador.classificacao = parseFloat(media.toFixed(1)); // arredonda a 1 decimal

  // Atualiza o localStorage
  const idx = explicadores.findIndex(e => e.id === explicadorId);
  explicadores[idx] = explicador;
  localStorage.setItem("explicadores", JSON.stringify(explicadores));

  alert("Avaliação registrada!");
  inicializarAvaliacao(explicador); // Atualiza visualmente
}


function inicializarReserva(explicador) {
  const select = document.getElementById('horarioSelect');
  if (!select) return console.error('Elemento select "horarioSelect" não encontrado.');

  const reservasAtuais = explicador.reservas || [];
  const horariosDisponiveis = (explicador.disponibilidade || []).filter(h => !reservasAtuais.includes(h));

  select.innerHTML = '';

  if (horariosDisponiveis.length === 0) {
    select.disabled = true;
    select.innerHTML = '<option>Sem horários disponíveis</option>';
  } else {
    select.disabled = false;
    horariosDisponiveis.forEach(horario => {
      const option = document.createElement('option');
      option.value = horario;
      option.textContent = horario;
      select.appendChild(option);
    });
  }
}


function mostrarHorarios(explicador, dataSelecionada) {
  const horariosDiv = document.getElementById("horariosDia");
  horariosDiv.innerHTML = `<h4>Horários para ${dataSelecionada}</h4>`;

  // Obtem as reservas para esta data
  const todasMarcacoes = JSON.parse(localStorage.getItem("marcacoes")) || [];
  const reservas = todasMarcacoes.filter(
    m => m.explainerId === explicador.id && m.data === dataSelecionada
  );

  // Usa os horários que o explicador tem disponíveis
  explicador.disponibilidade.forEach(hora => {
    // Verifica se horário já está reservado neste dia
    const ocupado = reservas.some(r => r.hora === hora);

    const btn = document.createElement("button");
    btn.textContent = hora;
    btn.disabled = ocupado;
    btn.className = ocupado ? "btn-hora ocupado" : "btn-hora disponivel";

    if (!ocupado) {
      btn.onclick = () => reservarHorarioDataHora(explicador, dataSelecionada, hora);
    }

    horariosDiv.appendChild(btn);
  });
}

function reservarHorarioDataHora(explicador, dataSelecionada, horaSelecionada) {
  const utilizadorAtual = JSON.parse(localStorage.getItem("utilizadorAtual"));
  if (!utilizadorAtual) return alert("Precisas de estar autenticado para reservar.");

  // Verifica novamente se horário está ocupado (pode ter mudado)
  explicador.reservas = explicador.reservas || [];
  const jaReservado = explicador.reservas.some(r => r.data === dataSelecionada && r.hora === horaSelecionada);
  if (jaReservado) return alert("Este horário já foi reservado.");

  // Adiciona a reserva ao explicador
  explicador.reservas.push({ data: dataSelecionada, hora: horaSelecionada });

  // Guarda no localStorage o explicador atualizado
  const explicadores = JSON.parse(localStorage.getItem("explicadores")) || [];
  const idx = explicadores.findIndex(e => e.id === explicador.id);
  if (idx !== -1) {
    explicadores[idx] = explicador;
    localStorage.setItem("explicadores", JSON.stringify(explicadores));
  }

  // Guarda reserva no utilizador atual
  const marcacoes = JSON.parse(localStorage.getItem("marcacoes")) || [];

  marcacoes.push({
    id: crypto.randomUUID(),
    alunoEmail: utilizadorAtual.email,
    explainerId: explicador.id,
    data: dataSelecionada,
    hora: horaSelecionada
  });

  localStorage.setItem("marcacoes", JSON.stringify(marcacoes));
  explicador.reservas.push({ data: dataSelecionada, hora: horaSelecionada });

  alert(`Reserva feita com sucesso para dia ${dataSelecionada} às ${horaSelecionada}!`);
  mostrarHorarios(explicador, dataSelecionada);
}

function gerarDiasSemana(explicador) {
  const diasSemanaDiv = document.getElementById('diasSemana');
  diasSemanaDiv.innerHTML = '';

  // Exemplo: mostrar os próximos 7 dias a partir de hoje
  const hoje = new Date();

  for (let i = 0; i < 7; i++) {
    const dia = new Date(hoje);
    dia.setDate(hoje.getDate() + i);

    const diaStr = dia.toISOString().split('T')[0]; // formato YYYY-MM-DD

    const btn = document.createElement('button');
    btn.textContent = dia.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'numeric' });
    btn.className = 'btn-dia';
    btn.onclick = () => mostrarHorarios(explicador, diaStr);

    diasSemanaDiv.appendChild(btn);
  }
}


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
