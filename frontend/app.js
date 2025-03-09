// Global variables
const BASE_URL = 'http://localhost:3000';
let currentPage = 'scan';
let lastScannedDocId = null;
let userData = null;

// DOM Elements
const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const navLinks = document.querySelectorAll('.nav-link');
const userName = document.getElementById('user-name');
const userCredits = document.getElementById('user-credits');
const userMaxCredits = document.getElementById('user-max-credits');
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseButtons = document.querySelectorAll('.modal-close');
const goToScanBtn = document.getElementById('go-to-scan-btn');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // Tab switching in auth forms
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    registerTab.addEventListener('click', () => switchAuthTab('register'));

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            navigateTo(targetPage);
        });
    });

    // Logout
    logoutBtn.addEventListener('click', logout);

    // Modal close buttons
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });

    // Modal overlay click to close
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModals();
        }
    });

    // Go to scan button
    goToScanBtn.addEventListener('click', () => navigateTo('scan'));
});

// Initialize the application
function initApp() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        fetchUserData();
    } else {
        showAuthSection();
    }
}

// Show auth section and hide main section
function showAuthSection() {
    authSection.classList.remove('hidden');
    mainSection.classList.add('hidden');
}

// Show main section and hide auth section
function showMainSection() {
    authSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
    // Set initial page
    navigateTo('scan');
}

// Switch between login and register tabs
function switchAuthTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('border-blue-500', 'text-blue-600');
        loginTab.classList.remove('border-transparent', 'text-gray-500');
        registerTab.classList.remove('border-blue-500', 'text-blue-600');
        registerTab.classList.add('border-transparent', 'text-gray-500');

        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        registerTab.classList.add('border-blue-500', 'text-blue-600');
        registerTab.classList.remove('border-transparent', 'text-gray-500');
        loginTab.classList.remove('border-blue-500', 'text-blue-600');
        loginTab.classList.add('border-transparent', 'text-gray-500');

        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

// Navigate to a specific page
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));

    // Show the selected page
    document.getElementById(`${page}-page`).classList.remove('hidden');

    // Update active nav link
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Set current page
    currentPage = page;

    // Load page-specific data
    loadPageData(page);
}

// Load data for specific pages
function loadPageData(page) {
    switch (page) {
        case 'profile':
            loadProfileData();
            break;
        case 'admin':
            loadAdminData();
            break;
        case 'matches':
            loadMatchesData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
    }
}

// Fetch and display user data
function fetchUserData() {
    fetch(`${BASE_URL}/profile/userdata`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return response.json();
        })
        .then(data => {
            userData = data;

            // Update UI with user data
            userName.textContent = data.name;
            userCredits.textContent = data.credit;
            userMaxCredits.textContent = data.limit;

            // Show admin links if user is admin
            const isAdmin = localStorage.getItem('role') === 'admin';
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(element => {
                if (isAdmin) {
                    element.classList.remove('hidden');
                } else {
                    element.classList.add('hidden');
                }
            });

            showMainSection();
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            // If failed to fetch user data, assume not logged in
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            showAuthSection();
        });
}

// Logout function
function logout() {
    fetch(`${BASE_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Logout failed');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);

            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');

            // Show auth section
            showAuthSection();

            // Show success toast
            showToast('success', 'Successfully logged out');
        })
        .catch(error => {
            console.error('Error during logout:', error);

            // Clear local storage anyway
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');

            // Show auth section
            showAuthSection();
        });
}

// Open modal
function openModal(modalId) {
    modalOverlay.classList.remove('hidden');
    document.getElementById(modalId).style.display = 'block';

    // Hide other modals
    document.querySelectorAll('.modal').forEach(modal => {
        if (modal.id !== modalId) {
            modal.style.display = 'none';
        }
    });
}

// Close all modals
function closeModals() {
    modalOverlay.classList.add('hidden');
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Show toast notification
function showToast(type, message) {
    const toastContainer = document.getElementById('toast-container');

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Create icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            break;
        case 'error':
            icon = '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
            break;
        case 'warning':
            icon = '<svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
            break;
        default:
            icon = '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    }

    // Set toast content
    toast.innerHTML = `
        ${icon}
        <span class="toast-message">${message}</span>
    `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Helper function to create status badge
function createStatusBadge(status) {
    return `<span class="status-badge status-${status.toLowerCase()}">${status}</span>`;
}
