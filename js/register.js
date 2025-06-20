const btnAluno = document.getElementById("btnAluno");
const btnExplicador = document.getElementById("btnExplicador");
const formAluno = document.getElementById("formAluno");
const formExplicador = document.getElementById("formExplicador");

btnAluno.addEventListener("click", () => {
  formAluno.classList.remove("hidden");
  formExplicador.classList.add("hidden");
  btnAluno.classList.add("active");
  btnExplicador.classList.remove("active");
});

btnExplicador.addEventListener("click", () => {
  formAluno.classList.add("hidden");
  formExplicador.classList.remove("hidden");
  btnExplicador.classList.add("active");
  btnAluno.classList.remove("active");
});

async function carregarDisciplinas() {
  let disciplinasApi = [];

  try {
    const response = await fetch('http://localhost:3000/explainer');
    const explicadores = await response.json();
    disciplinasApi = explicadores.flatMap(e => e.disciplinas || []);
  } catch (err) {
    console.warn('Erro ao carregar disciplinas da API (pode ser offline):', err);
  }

  const disciplinasLocal = JSON.parse(localStorage.getItem('disciplinas')) || [];
  const nomesLocal = disciplinasLocal.map(d => d.nome);
  const todasDisciplinas = [...new Set([...disciplinasApi, ...nomesLocal])];

  const select = document.getElementById('disciplinas');
  select.innerHTML = '';

  todasDisciplinas.forEach(disciplina => {
    const option = document.createElement('option');
    option.value = disciplina;
    option.textContent = disciplina;
    select.appendChild(option);
  });

  new Choices("#disciplinas", {
    removeItemButton: true,
    placeholderValue: "Seleciona as disciplinas",
  });
}

document.addEventListener('DOMContentLoaded', () => {
  carregarDisciplinas();
  formAluno.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeAluno').value.trim();
    const email = document.getElementById('emailAluno').value.trim().toLowerCase();
    const senha = document.getElementById('senhaAluno').value;

    if (!nome || !email || !senha) {
      alert('Preenche todos os campos!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Insere um email válido.');
      return;
    }

    let utilizadores = JSON.parse(localStorage.getItem('utilizadores')) || [];

    if (utilizadores.some(u => u.email.toLowerCase() === email)) {
      alert('Já existe um utilizador com esse email.');
      return;
    }


    const novoAluno = {
      id: crypto.randomUUID(),
      name: nome,
      email,
      password: senha,
      type: 'aluno',
      image: 'https://via.placeholder.com/150'
    };


    utilizadores.push(novoAluno);
    localStorage.setItem('utilizadores', JSON.stringify(utilizadores));

    let alunosLocais = JSON.parse(localStorage.getItem('alunosRegistrados')) || [];
    alunosLocais.push(novoAluno);
    localStorage.setItem('alunosRegistrados', JSON.stringify(alunosLocais));

    alert('Registo efetuado com sucesso!');
    formAluno.reset();
    window.location.href = 'login.html';
  });

  formExplicador.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeExplicador').value.trim();
    const email = document.getElementById('emailExplicador').value.trim().toLowerCase();
    const senha = document.getElementById('senhaExplicador').value;
    const disciplinas = Array.from(document.getElementById('disciplinas').selectedOptions).map(opt => opt.value);
    const horarios = document.getElementById('horarios').value.trim();
    const modalidade = document.getElementById('modalidade').value;
    const preco = parseFloat(document.getElementById('preco').value);
    const localizacao = document.getElementById('localizacao').value.trim();

    if (!nome || !email || !senha || !disciplinas.length || !horarios || !modalidade || isNaN(preco) || !localizacao) {
      alert('Preenche todos os campos corretamente!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Insere um email válido.');
      return;
    }

    let utilizadores = JSON.parse(localStorage.getItem('utilizadores')) || [];
    if (utilizadores.some(u => u.email.toLowerCase() === email)) {
      alert('Já existe um utilizador com esse email.');
      return;
    }

    utilizadores.push({
      id: crypto.randomUUID(),
      nome,
      email,
      password: senha,
      tipo: 'explicador',
      disciplinas,
      horarios,
      modalidade,
      preco,
      localizacao,
      name: nome,
      image: 'https://via.placeholder.com/150'
    });

    localStorage.setItem('utilizadores', JSON.stringify(utilizadores));
    alert('Registo de explicador efetuado com sucesso!');
    formExplicador.reset();
    window.location.href = 'login.html';
  });
});