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
  formExplicador.classList.remove("hidden");
  formAluno.classList.add("hidden");
  btnExplicador.classList.add("active");
  btnAluno.classList.remove("active");
});


async function carregarDisciplinas() {
  try {
    const response = await fetch("http://localhost:3000/explainer");
    const explicadores = await response.json();
    const disciplinas = [...new Set(explicadores.flatMap(e => e.disciplinas || []))];

    const select = document.getElementById("disciplinas");
    select.innerHTML = "";
    disciplinas.forEach(d => {
      const option = document.createElement("option");
      option.value = d;
      option.textContent = d;
      select.appendChild(option);
    });

    new Choices(select, {
      removeItemButton: true,
      placeholderValue: "Seleciona disciplinas"
    });
  } catch (error) {
    console.warn("Erro ao carregar disciplinas:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDisciplinas();

  formAluno.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nomeAluno").value.trim();
    const email = document.getElementById("emailAluno").value.trim().toLowerCase();
    const senha = document.getElementById("senhaAluno").value;

    if (!nome || !email || !senha) {
      alert("Preenche todos os campos!");
      return;
    }

    const novoAluno = {
      id: crypto.randomUUID(),
      name: nome,
      email,
      password: senha,
      type: "aluno",
      cidade: "",
      disciplinas: [],
      image: "https://via.placeholder.com/150",
      mensagens: []
    };

    try {
      const res = await fetch("http://localhost:3000/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoAluno),
      });

      if (!res.ok) throw new Error("Erro ao registar aluno");
      alert("Aluno registado com sucesso!");
      formAluno.reset();
      window.location.href = "login.html";
    } catch (err) {
      alert("Erro: " + err.message);
    }
  });

  formExplicador.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nomeExplicador").value.trim();
    const email = document.getElementById("emailExplicador").value.trim().toLowerCase();
    const senha = document.getElementById("senhaExplicador").value;
    const disciplinas = Array.from(document.getElementById("disciplinas").selectedOptions).map(opt => opt.value);
    const horarios = document.getElementById("horarios").value.trim();
    const modalidade = document.getElementById("modalidade").value;
    const preco = parseFloat(document.getElementById("preco").value);
    const localizacao = document.getElementById("localizacao").value.trim();

    if (!nome || !email || !senha || disciplinas.length === 0 || !horarios || !modalidade || isNaN(preco) || !localizacao) {
      alert("Preenche todos os campos corretamente!");
      return;
    }

    const novoExplicador = {
      id: crypto.randomUUID(),
      name: nome,
      email,
      password: senha,
      image: "https://via.placeholder.com/150",
      bio: "",
      disponibilidade: horarios.split(",").map(h => h.trim()),
      disciplinas,
      nivel: "Universitário",
      modalidade,
      local: localizacao,
      preco,
      classificacao: 0,
      avaliacoes: [],
      mensagens: []
    };

    try {
      const res = await fetch("http://localhost:3000/explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoExplicador),
      });

      if (!res.ok) throw new Error("Erro ao registar explicador");
      alert("Explicador registado com sucesso!");
      formExplicador.reset();
      window.location.href = "login.html";
    } catch (err) {
      alert("Erro: " + err.message);
    }
  });
});
