import { login } from './controller/auth.js';

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  const resultado = await login(email, password);

  if (resultado.success) {
    localStorage.setItem('userId', resultado.user.id);
    localStorage.setItem('tipoConta', resultado.tipo);
    localStorage.setItem('utilizadorAtual', JSON.stringify(resultado.user));
    alert('Login efetuado com sucesso!');

    if (resultado.tipo === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'perfil.html';
    }
  } else {
    alert(resultado.message);
  }
});
