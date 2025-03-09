
// Admin related functionality

// DOM Elements
const adminResponseForm = document.getElementById('admin-response-form');
const adminCreditRequests = document.getElementById('admin-credit-requests');
const noAdminRequestsMessage = document.getElementById('no-admin-requests-message');
const filterButtons = document.querySelectorAll('.btn-filter');

// Variables
let currentFilter = 'all';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    adminResponseForm.addEventListener('submit', handleAdminResponse);

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const status = button.getAttribute('data-status');
            currentFilter = status;

            // Update active class
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Reload admin data with filter
            loadAdminData();
        });
    });
});

// Load admin data
function loadAdminData() {
    // Skip if user is not admin
    if (localStorage.getItem('role') !== 'admin') {
        return;
    }

    // Show loading state
    adminCreditRequests.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-gray-500">Loading credit requests...</td></tr>';

    // Set URL based on filter
    let url = `${BASE_URL}/admin/creditsystem/getcreditrequests`;
    if (currentFilter !== 'all') {
        url += `?status=${currentFilter}`;
    }

    // Fetch credit requests
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch credit requests');
            }
            return response.json();
        })
        .then(data => {
            // Clear loading message
            adminCreditRequests.innerHTML = '';

            if (data.data && data.data.length > 0) {
                // Display credit requests
                data.data.forEach(request => {
                    const requestRow = document.createElement('tr');
                    requestRow.className = 'border-b border-gray-100';

                    // Create action button based on status
                    let actionButton = '';
                    if (request.status === 'pending') {
                        actionButton = `<button class="respond-btn btn-secondary text-xs px-2 py-1" data-request-id="${request.request_id}" data-requested-amount="${request.requested_amount}" data-reason="${request.reason}" data-user-id="${request.user_id}">Respond</button>`;
                    } else {
                        actionButton = `<span class="text-xs text-gray-500">Completed</span>`;
                    }

                    requestRow.innerHTML = `
                    <td class="py-3">${request.request_id}</td>
                    <td class="py-3">${request.user_id}</td>
                    <td class="py-3">${request.requested_amount}</td>
                    <td class="py-3">${request.reason}</td>
                    <td class="py-3">${createStatusBadge(request.status)}</td>
                    <td class="py-3 text-gray-500">${formatDate(request.request_date)}</td>
                    <td class="py-3">${actionButton}</td>
                `;
                    adminCreditRequests.appendChild(requestRow);
                });

                // Add event listeners to respond buttons
                document.querySelectorAll('.respond-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const requestId = button.getAttribute('data-request-id');
                        const requestedAmount = button.getAttribute('data-requested-amount');
                        const reason = button.getAttribute('data-reason');
                        const userId = button.getAttribute('data-user-id');

                        // Set modal values
                        document.getElementById('credit-request-id').value = requestId;
                        document.getElementById('modal-user-id').textContent = userId;
                        document.getElementById('modal-requested-amount').textContent = requestedAmount;
                        document.getElementById('modal-reason').textContent = reason;
                        document.getElementById('granted-amount').value = requestedAmount;

                        // Open modal
                        openModal('admin-response-modal');
                    });
                });

                noAdminRequestsMessage.classList.add('hidden');
            } else {
                // No credit requests
                noAdminRequestsMessage.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching credit requests:', error);
            adminCreditRequests.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-red-500">Failed to load credit requests</td></tr>';
        });
}

// Handle admin response to credit request
function handleAdminResponse(e) {
    e.preventDefault();

    const creditRequestId = document.getElementById('credit-request-id').value;
    const status = document.getElementById('response-status').value;
    const amount = document.getElementById('granted-amount').value;
    const adminNotes = document.getElementById('admin-notes').value;

    // Validate input
    if (!creditRequestId || !status || !amount || !adminNotes) {
        showToast('error', 'Please fill out all fields');
        return;
    }

    // Send admin response
    fetch(`${BASE_URL}/admin/creditsystem/managerequest`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            creditRequestId: parseInt(creditRequestId),
            status,
            amount: parseInt(amount),
            admin_notes: adminNotes
        }),
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to respond to credit request');
            }
            return response.json();
        })
        .then(data => {
            // Show success toast
            showToast('success', 'Response submitted successfully');

            // Close modal
            closeModals();

            // Reset form
            adminResponseForm.reset();

            // Reload admin data
            loadAdminData();
        })
        .catch(error => {
            console.error('Error responding to credit request:', error);
            showToast('error', 'Failed to respond to credit request. Please try again.');
        });
}
