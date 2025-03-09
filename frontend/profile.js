// Profile related functionality

// DOM Elements
const requestCreditsBtn = document.getElementById('request-credits-btn');
const requestCreditsForm = document.getElementById('request-credits-form');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    requestCreditsBtn.addEventListener('click', () => openModal('request-credits-modal'));
    requestCreditsForm.addEventListener('submit', handleCreditRequest);
});

// Load profile data
function loadProfileData() {
    fetch(`${BASE_URL}/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }
            return response.json();
        })
        .then(userData => {
            document.getElementById('profile-username').textContent = userData.username;
            document.getElementById('profile-name').textContent = userData.name;
            document.getElementById('profile-role').textContent = localStorage.getItem('role');
            document.getElementById('profile-credits').textContent = userData.credit;
            document.getElementById('profile-max-credits').textContent = userData.limit;
            
            loadScanHistory();
            loadCreditRequestHistory();
        })
        .catch(error => console.error('Error fetching profile data:', error));
}

// Load scan history
function loadScanHistory() {
    fetch(`${BASE_URL}/profile/scans`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            const scansList = document.getElementById('scans-list');
            const noScansMessage = document.getElementById('no-scans-message');
            scansList.innerHTML = '';
            if (data.data.length > 0) {
                data.data.forEach(scan => {
                    const scanRow = document.createElement('tr');
                    scanRow.className = 'border-b border-gray-100';
                    scanRow.innerHTML = `
                        <td class="py-3">${scan.title}</td>
                        <td class="py-3 text-right text-gray-500">${formatDate(scan.upload_date)}</td>
                    `;
                    scansList.appendChild(scanRow);
                });
                noScansMessage.classList.add('hidden');
            } else {
                noScansMessage.classList.remove('hidden');
            }
        })
        .catch(error => console.error('Error fetching scan history:', error));
}

// Load credit request history
function loadCreditRequestHistory() {
    fetch(`${BASE_URL}/profile/creditrequests`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            const creditRequestsList = document.getElementById('credit-requests-list');
            const noRequestsMessage = document.getElementById('no-requests-message');
            creditRequestsList.innerHTML = '';
            if (data.data.length > 0) {
                data.data.forEach(request => {
                    const requestRow = document.createElement('tr');
                    requestRow.className = 'border-b border-gray-100';
                    requestRow.innerHTML = `
                        <td class="py-3">${request.request_id}</td>
                        <td class="py-3">${request.amount}</td>
                        <td class="py-3">${createStatusBadge(request.status)}</td>
                        <td class="py-3 text-gray-500">${formatDate(request.request_date)}</td>
                        <td class="py-3 text-gray-500">${request.response_date ? formatDate(request.response_date) : '-'}</td>
                        <td class="py-3">${request.admin_notes || '-'}</td>
                    `;
                    creditRequestsList.appendChild(requestRow);
                });
                noRequestsMessage.classList.add('hidden');
            } else {
                noRequestsMessage.classList.remove('hidden');
            }
        })
        .catch(error => console.error('Error fetching credit request history:', error));
}

// Handle credit request submission
function handleCreditRequest(e) {
    e.preventDefault();
    const amount = document.getElementById('credit-amount').value;
    const reason = document.getElementById('credit-reason').value;
    if (!amount || !reason) {
        showToast('error', 'Please provide both amount and reason');
        return;
    }
    fetch(`${BASE_URL}/credits/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            amount: parseInt(amount),
            reason
        })
    })
        .then(response => response.json())
        .then(() => {
            showToast('success', 'Credit request submitted successfully');
            closeModals();
            requestCreditsForm.reset();
            loadCreditRequestHistory();
        })
        .catch(error => console.error('Error requesting credits:', error));
}

// Initial load
loadProfileData();