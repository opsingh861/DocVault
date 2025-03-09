
// Scan related functionality

// DOM Elements
const scanForm = document.getElementById('scan-form');
const documentTitleInput = document.getElementById('document-title');
const documentFileInput = document.getElementById('document-file');
const fileNameDisplay = document.getElementById('file-name');
const noCreditsMessage = document.getElementById('no-credits-message');
const scanBtn = document.getElementById('scan-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    scanForm.addEventListener('submit', handleScan);

    // File input change event
    documentFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            fileNameDisplay.classList.remove('hidden');
        } else {
            fileNameDisplay.classList.add('hidden');
        }
    });
});

// Handle scan form submission
function handleScan(e) {
    e.preventDefault();

    const title = documentTitleInput.value;
    const file = documentFileInput.files[0];

    // Validate input
    if (!title || !file) {
        showToast('error', 'Please provide both title and file');
        return;
    }

    // Check if user has credits
    if (userData.credit <= 0) {
        showToast('error', 'You don\'t have enough credits to scan. Please request more.');
        noCreditsMessage.classList.remove('hidden');
        return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    // Disable form while processing
    scanBtn.disabled = true;
    scanBtn.textContent = 'Processing...';

    // Send scan request
    fetch(`${BASE_URL}/scan`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Scan failed');
            }
            return response.json();
        })
        .then(data => {
            // Update credits
            userData.credit = data.remaining_credits;
            userCredits.textContent = data.remaining_credits;

            // Store last scanned document ID
            lastScannedDocId = data.document_id;

            // Show success toast
            showToast('success', 'Document scanned successfully!');

            // Reset form
            scanForm.reset();
            fileNameDisplay.classList.add('hidden');

            // Navigate to matches page
            navigateTo('matches');
        })
        .catch(error => {
            console.error('Scan error:', error);
            showToast('error', 'Failed to scan document. Please try again.');
        })
        .finally(() => {
            // Re-enable form
            scanBtn.disabled = false;
            scanBtn.textContent = 'Scan Document';
        });
}

// Load matches for a document
function loadMatchesData() {
    const noDocumentScanned = document.getElementById('no-document-scanned');
    const matchesResults = document.getElementById('matches-results');
    const similarDocuments = document.getElementById('similar-documents');
    const noMatchesMessage = document.getElementById('no-matches-message');

    // Clear previous results
    similarDocuments.innerHTML = '';

    if (!lastScannedDocId) {
        // No document has been scanned yet
        noDocumentScanned.classList.remove('hidden');
        matchesResults.classList.add('hidden');
        return;
    }

    // Show loading state
    noDocumentScanned.classList.add('hidden');
    matchesResults.classList.remove('hidden');
    similarDocuments.innerHTML = '<div class="col-span-full text-center py-4">Loading matches...</div>';

    // Fetch matches
    fetch(`${BASE_URL}/matches/${lastScannedDocId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch matches');
            }
            return response.json();
        })
        .then(data => {
            // Clear loading message
            similarDocuments.innerHTML = '';

            if (data.similar_documents && data.similar_documents.length > 0) {
                // Display matches
                data.similar_documents.forEach(doc => {
                    const docCard = document.createElement('div');
                    docCard.className = 'card hover:shadow-md transition-shadow';
                    docCard.innerHTML = `
                    <h4 class="font-medium mb-2">${doc.title}</h4>
                    <div class="mb-4 text-sm text-gray-500">Document #${doc.id}</div>
                    <div class="flex items-center justify-between">
                        <div class="text-sm">Similarity</div>
                        <div class="text-lg font-medium">${Math.round(parseFloat(doc.similarity_score) * 100)}%</div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div class="bg-blue-500 h-2 rounded-full" style="width: ${parseFloat(doc.similarity_score) * 100}%"></div>
                    </div>
                `;
                    similarDocuments.appendChild(docCard);
                });

                noMatchesMessage.classList.add('hidden');
            } else {
                // No matches found
                noMatchesMessage.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching matches:', error);
            similarDocuments.innerHTML = '<div class="col-span-full text-center py-4 text-red-500">Failed to load matches. Please try again.</div>';
        });
}
