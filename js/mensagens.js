window.addEventListener('DOMContentLoaded', () => {
  const tipo = localStorage.getItem('tipoConta');
  const nome = localStorage.getItem('nomeUsuario') || "Aluno";
  const userProfile = document.getElementById('userProfile');
  const nomeUsuarioSpan = document.getElementById('nomeUsuario');

  // Mostra perfil correto se for aluno
  if (tipo === 'aluno') {
    if (userProfile) {
      userProfile.style.display = 'inline-block';
      if (nomeUsuarioSpan) nomeUsuarioSpan.textContent = nome;
    }

    document.getElementById('mensagensContainer').style.display = 'block';
    mostrarConversasComExplicadores();
  } else {
    document.getElementById('mensagensContainer').innerHTML = `
      <p style="color: red;">Apenas alunos têm acesso a esta secção.</p>
    `;
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
      const dataFormatada = new Date(msg.data).toLocaleString('pt-PT', {
        dateStyle: 'short',
        timeStyle: 'short'
      });

      div.innerHTML += `
        <p><strong>${remetente}</strong> <small>${dataFormatada}</small>:<br>${msg.mensagem}</p><hr>`;
    });

    div.innerHTML += `
      <textarea id="resposta-${emailExplicador}" placeholder="Escreve uma resposta..." rows="3"></textarea>
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

  textarea.value = "";
  mostrarConversasComExplicadores();
}
