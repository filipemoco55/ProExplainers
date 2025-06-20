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

