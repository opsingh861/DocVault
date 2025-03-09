// Base URL for API requests
const BASE_URL = 'https://localhost:3000';

// DOM Elements
const loginFormElement = document.getElementById('login-form');
const registerFormElement = document.getElementById('register-form');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkSession(); // Check if user is already logged in

    if (loginFormElement) loginFormElement.addEventListener('submit', handleLogin);
    if (registerFormElement) registerFormElement.addEventListener('submit', handleRegister);
});

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showToast('error', 'Please enter both username and password');
        return;
    }

    fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // Send cookies with request
    })
        .then(response => {
            if (!response.ok) throw new Error('Login failed');
            return response.json();
        })
        .then(data => {
            showToast('success', 'Login successful! Welcome back.');
            loginFormElement.reset();
            checkSession(); // Fetch user data and update UI
        })
        .catch(error => {
            console.error('Login error:', error);
            showToast('error', 'Login failed. Please check your credentials.');
        });
}

// Handle register form submission
function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (!name || !username || !password) {
        showToast('error', 'Please fill out all fields');
        return;
    }

    fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password }),
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) throw new Error('Registration failed');
            return response.json();
        })
        .then(data => {
            showToast('success', 'Registration successful! You can now log in.');
            switchAuthTab('login');
            registerFormElement.reset();
        })
        .catch(error => {
            console.error('Registration error:', error);
            showToast('error', 'Registration failed. Username might already be taken.');
        });
}

// Check session status (user authentication)
function checkSession() {
    fetch(`${BASE_URL}/profile/userdata`, {
        method: 'GET',
        credentials: 'include' // Ensure cookies are sent
    })
        .then(response => {
            if (!response.ok) throw new Error('Not authenticated');
            return response.json();
        })
        .then(data => {
            // If session exists, update UI accordingly
            showToast('success', `Welcome, ${data.name}!`);
            updateUIForLoggedInUser(data);
        })
        .catch(() => {
            // If not logged in, show login form
            updateUIForLoggedOutUser();
        });
}

// Handle logout
function handleLogout() {
    fetch(`${BASE_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include' // Send cookies to clear session
    })
        .then(response => response.json())
        .then(() => {
            showToast('success', 'Logged out successfully.');
            updateUIForLoggedOutUser();
        })
        .catch(error => {
            console.error('Logout error:', error);
            showToast('error', 'Logout failed.');
        });
}

// Update UI based on authentication status
function updateUIForLoggedInUser(userData) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-section').style.display = 'block';
    document.getElementById('welcome-message').textContent = `Hello, ${userData.name}!`;
}

function updateUIForLoggedOutUser() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('main-section').style.display = 'none';
}
