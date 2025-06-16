const API_BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/user';

export async function getAllUsers() {
    const res = await fetch(`${API_BASE_URL}${ENDPOINT}`);
    return await res.json();
}

export async function getUserById(id) {
    const res = await fetch(`${API_BASE_URL}${ENDPOINT}/${id}`);
    return await res.json();
}