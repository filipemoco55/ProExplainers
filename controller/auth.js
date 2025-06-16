const API_BASE_URL = 'http://localhost:3000';

export async function login(email, password) {
  try {
    const emailLower = email.toLowerCase();

    const localUsers = JSON.parse(localStorage.getItem('utilizadores')) || [];

    const localMatch = localUsers.find(
      user => user.email.toLowerCase() === emailLower && user.password === password
    );

    if (localMatch) {
      const tipo = (localMatch.type || localMatch.tipo || 'aluno').toLowerCase();

      return {
        success: true,
        user: {
          ...localMatch,
          type: tipo,
          name: localMatch.name || localMatch.nome || '',
        },
        tipo
      };
    }

    const userRes = await fetch(`${API_BASE_URL}/user?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    if (!userRes.ok) throw new Error('Erro ao buscar /user');

    const userData = await userRes.json();
    if (Array.isArray(userData) && userData.length > 0) {
      const user = userData[0];
      const tipo = (user.type || 'aluno').toLowerCase();

      return {
        success: true,
        user: {
          ...user,
          type: tipo,
        },
        tipo
      };
    }

    const explainerRes = await fetch(`${API_BASE_URL}/explainer?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    if (!explainerRes.ok) throw new Error('Erro ao buscar /explainer');

    const explainerData = await explainerRes.json();
    if (Array.isArray(explainerData) && explainerData.length > 0) {
      const explainer = explainerData[0];

      return {
        success: true,
        user: {
          ...explainer,
          type: 'explicador'
        },
        tipo: 'explicador'
      };
    }

    return {
      success: false,
      message: 'Email ou senha inválidos.'
    };

  } catch (error) {
    console.error('Erro na função login:', error);
    return {
      success: false,
      message: 'Erro ao conectar ao servidor.'
    };
  }
}
