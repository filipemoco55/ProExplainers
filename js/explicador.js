window.addEventListener('DOMContentLoaded', () => {
  const tipo = localStorage.getItem('tipoConta'); 
  const nome = localStorage.getItem('nomeUsuario') || "Explicador"; 

  const loginBtn = document.getElementById('loginBtn');
  const userProfile = document.getElementById('userProfile');
  const nomeUsuarioSpan = document.getElementById('nomeUsuario');

  if (tipo === 'explicador') {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userProfile) {
      userProfile.style.display = 'inline-block';
      if (nomeUsuarioSpan) nomeUsuarioSpan.textContent = nome;
    }

    mostrarConversasComAlunos();
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (userProfile) userProfile.style.display = 'none';
  }
});

window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

function toggleUserMenu() {
  const dropdownUser = document.getElementById('dropdownUser');
  dropdownUser.style.display = dropdownUser.style.display === 'block' ? 'none' : 'block';
}

function logout() {
  window.location.href = 'login.html';
}

window.addEventListener('click', function (e) {
  const dropdownUser = document.getElementById('dropdownUser');
  const userIcon = document.querySelector('#userProfile .profile-icon');
  if (dropdownUser && userIcon && !userIcon.contains(e.target)) {
    dropdownUser.style.display = 'none';
  }
});

function mostrarConversasComAlunos() {
  const tipoConta = localStorage.getItem("tipoConta");
  const utilizadorAtual = JSON.parse(localStorage.getItem("utilizadorAtual"));

  if (tipoConta !== "explicador" || !utilizadorAtual) return;

  const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];
  
  const conversasPorAluno = {};

  mensagens.forEach(msg => {
    if (msg.de === utilizadorAtual.email || msg.para === utilizadorAtual.email) {
      // O outro email é o que não for o do explicador
      const outroEmail = msg.de === utilizadorAtual.email ? msg.para : msg.de;
      if (!conversasPorAluno[outroEmail]) {
        conversasPorAluno[outroEmail] = [];
      }
      conversasPorAluno[outroEmail].push(msg);
    }
  });

  const container = document.getElementById("mensagensContainer");
  if (!container) return;
  container.innerHTML = "";

  if (Object.keys(conversasPorAluno).length === 0) {
    container.innerHTML = "<p>Sem mensagens com alunos.</p>";
    return;
  }

  const alunos = JSON.parse(localStorage.getItem("alunos")) || [];

  Object.entries(conversasPorAluno).forEach(([emailAluno, mensagensAluno]) => {
    mensagensAluno.sort((a, b) => new Date(a.data) - new Date(b.data));

    const div = document.createElement("div");
    div.classList.add("conversa-aluno");

    const alunoObj = alunos.find(a => a.email === emailAluno);
    const nomeAluno = alunoObj ? alunoObj.name : emailAluno;

    div.innerHTML = `<h3>Conversas com: ${nomeAluno}</h3>`;

    mensagensAluno.forEach(msg => {
      const remetente = msg.de === utilizadorAtual.email ? "Tu (Explicador)" : nomeAluno;
      div.innerHTML += `
        <p><strong>${remetente}:</strong> ${msg.mensagem}</p>
      `;
      if (msg.de !== utilizadorAtual.email && msg.resposta) {
        div.innerHTML += `
          <p><em>Resposta do explicador:</em> ${msg.resposta}</p>
        `;
      }
      div.innerHTML += "<hr>";
    });

    div.innerHTML += `
      <textarea id="novaMsg-${emailAluno}" placeholder="Escreve a tua mensagem para ${nomeAluno}..."></textarea>
      <button onclick="enviarMensagemParaAluno('${emailAluno}')">Enviar Mensagem</button>
    `;

    container.appendChild(div);
  });
}

function enviarMensagemParaAluno(emailAluno) {
  const tipoConta = localStorage.getItem("tipoConta");
  const utilizadorAtual = JSON.parse(localStorage.getItem("utilizadorAtual"));
  if (tipoConta !== "explicador" || !utilizadorAtual) return alert("Apenas explicadores podem enviar mensagens.");

  const textarea = document.getElementById(`novaMsg-${emailAluno}`);
  if (!textarea) return;

  const texto = textarea.value.trim();
  if (!texto) return alert("Escreve uma mensagem antes de enviar.");

  const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];

  const novaMsg = {
    id: crypto.randomUUID(),
    de: utilizadorAtual.email,
    para: emailAluno,
    mensagem: texto,
    data: new Date().toISOString()
  };

  mensagens.push(novaMsg);
  localStorage.setItem("mensagens", JSON.stringify(mensagens));

  alert("Mensagem enviada!");
  textarea.value = "";
  mostrarConversasComAlunos(); 
}
