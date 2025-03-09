/* script.js */
(function () {
    "use strict";

    // Utility functions
    function getUsers() {
        return JSON.parse(localStorage.getItem("users")) || [];
    }
    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }
    function getLoggedInUser() {
        return JSON.parse(localStorage.getItem("loggedInUser"));
    }
    function setLoggedInUser(user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
    }
    function removeLoggedInUser() {
        localStorage.removeItem("loggedInUser");
    }
    function getCreditRequests() {
        return JSON.parse(localStorage.getItem("creditRequests")) || [];
    }
    function saveCreditRequests(requests) {
        localStorage.setItem("creditRequests", JSON.stringify(requests));
    }
    function updateUser(updatedUser) {
        let users = getUsers();
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === updatedUser.username) {
                users[i] = updatedUser;
                break;
            }
        }
        saveUsers(users);
        setLoggedInUser(updatedUser); // update session as well
    }
    function redirectIfNotLoggedIn() {
        if (!getLoggedInUser()) {
            window.location.href = "login.html";
        }
    }
    function getDocumentCounter() {
        return parseInt(localStorage.getItem("documentCounter") || "1", 10);
    }
    function incrementDocumentCounter() {
        let count = getDocumentCounter();
        localStorage.setItem("documentCounter", count + 1);
        return count;
    }

    // Registration - POST /auth/register
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const name = document.getElementById("regName").value.trim();
            const username = document.getElementById("regUsername").value.trim();
            const password = document.getElementById("regPassword").value;
            const role = document.getElementById("regRole").value;
            let users = getUsers();
            if (users.find((u) => u.username === username)) {
                alert("Username already exists.");
                return;
            }
            const newUser = {
                name,
                username,
                password,
                role,
                credits: 20,
                limit: 20,
                scanHistory: []
            };
            users.push(newUser);
            saveUsers(users);
            alert("User registered successfully");
            // Simulated API response:
            console.log({
                message: "User registered successfully",
                name: newUser.name,
                username: newUser.username,
                role: newUser.role
            });
            window.location.href = "login.html";
        });
    }

    // Login - POST /auth/login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;
            let users = getUsers();
            const user = users.find(
                (u) => u.username === username && u.password === password
            );
            if (user) {
                setLoggedInUser(user);
                // Simulated API response:
                console.log({
                    message: "Login successful",
                    username: user.username,
                    name: user.name,
                    role: user.role
                });
                window.location.href = "dashboard.html";
            } else {
                alert("Invalid credentials.");
            }
        });
    }

    // Logout - GET /auth/logout
    const logoutLinks = document.querySelectorAll("#logoutLink");
    if (logoutLinks) {
        logoutLinks.forEach((link) => {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                removeLoggedInUser();
                console.log({ message: "Logout successful" });
                window.location.href = "login.html";
            });
        });
    }

    // Dashboard – load profile info and scan history (GET /profile/userdata & /profile/scans)
    if (document.getElementById("profileInfo")) {
        redirectIfNotLoggedIn();
        const user = getLoggedInUser();
        const profileDiv = document.getElementById("profileInfo");
        profileDiv.innerHTML = `<p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Credits:</strong> ${user.credits} (Daily Limit: ${user.limit})</p>`;
        if (user.role === "admin") {
            document.getElementById("adminLink").innerHTML = `<a href="admin.html" class="mr-4">Admin Panel</a>`;
        }
        const scanHistoryDiv = document.getElementById("scanHistory");
        if (user.scanHistory && user.scanHistory.length > 0) {
            let historyHTML = '<ul class="list-disc ml-5">';
            user.scanHistory.forEach((scan) => {
                historyHTML += `<li>${scan.title} - <small>${scan.upload_date}</small></li>`;
            });
            historyHTML += "</ul>";
            scanHistoryDiv.innerHTML = historyHTML;
        } else {
            scanHistoryDiv.innerHTML = "<p>No scans yet.</p>";
        }
    }

    // Scan Document - POST /scan
    const scanForm = document.getElementById("scanForm");
    if (scanForm) {
        redirectIfNotLoggedIn();
        scanForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const user = getLoggedInUser();
            if (user.credits <= 0) {
                alert("No credits left. Please request additional credits or wait for daily reset.");
                return;
            }
            const title = document.getElementById("docTitle").value.trim();
            const fileInput = document.getElementById("docFile");
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const content = e.target.result;
                    // Deduct one credit
                    user.credits -= 1;
                    // Create scan record with document_id, title, upload_date, and content
                    const document_id = incrementDocumentCounter();
                    const upload_date = new Date().toISOString();
                    const scanRecord = { document_id, title, upload_date, content };
                    user.scanHistory.push(scanRecord);
                    updateUser(user);
                    // Store last scanned document id and content for matching
                    sessionStorage.setItem("lastScannedDocId", document_id);
                    sessionStorage.setItem("lastScannedContent", content);
                    // Simulated API response:
                    console.log({
                        message: "Document added successfully",
                        document_id: document_id,
                        remaining_credits: user.credits
                    });
                    alert("Document scanned successfully!");
                    window.location.href = "matches.html";
                };
                reader.readAsText(file);
            }
        });
    }

    // Matches Page – GET /matches/{docId}
    if (document.getElementById("matchesList")) {
        redirectIfNotLoggedIn();
        const docId = sessionStorage.getItem("lastScannedDocId");
        const scannedContent = sessionStorage.getItem("lastScannedContent") || "";
        const matchesDiv = document.getElementById("matchesList");
        // Simulate similar document matching (static response)
        const similar_documents = [
            {
                id: 2,
                title: "Story Summary",
                similarity_score: "0.80"
            }
        ];
        let html = '<h3 class="text-xl mb-2">Matching Results for Document ID ' + docId + '</h3>';
        if (similar_documents.length > 0) {
            html += '<ul class="list-disc ml-5">';
            similar_documents.forEach((doc) => {
                html += `<li><strong>${doc.title}</strong> - Similarity: ${doc.similarity_score}</li>`;
            });
            html += "</ul>";
        } else {
            html += "<p>No matching documents found.</p>";
        }
        matchesDiv.innerHTML = html;
    }

    // Credit Request - POST /credits/request
    const creditRequestForm = document.getElementById("creditRequestForm");
    if (creditRequestForm) {
        redirectIfNotLoggedIn();
        creditRequestForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const amount = parseInt(document.getElementById("creditAmount").value);
            const reason = document.getElementById("creditReason").value.trim();
            if (isNaN(amount) || amount <= 0 || reason === "") {
                alert("Please enter a valid credit amount and reason.");
                return;
            }
            let requests = getCreditRequests();
            const request_id = Date.now();
            const request_date = new Date().toISOString();
            const creditRequest = {
                request_id,
                amount,
                reason,
                status: "pending",
                request_date,
                response_date: null,
                admin_notes: null,
                user_id: getLoggedInUser().username
            };
            requests.push(creditRequest);
            saveCreditRequests(requests);
            console.log({
                message: "Credit requested successfully",
                requested_credit: amount
            });
            document.getElementById("creditRequestResult").innerText = "Credit request submitted successfully.";
            creditRequestForm.reset();
        });
    }

    // Admin Page – manage credit requests - GET /admin/creditsystem/getcreditrequests
    if (document.getElementById("pendingRequests")) {
        redirectIfNotLoggedIn();
        const user = getLoggedInUser();
        if (user.role !== "admin") {
            document.getElementById("pendingRequests").innerText = "Access Denied. Admins only.";
        } else {
            let requests = getCreditRequests();
            // Optionally filter by pending status if query parameter is provided
            const urlParams = new URLSearchParams(window.location.search);
            const statusFilter = urlParams.get("status");
            if (statusFilter) {
                requests = requests.filter((r) => r.status === statusFilter);
            }
            const pendingDiv = document.getElementById("pendingRequests");
            if (requests.length === 0) {
                pendingDiv.innerHTML = "<p>No pending requests.</p>";
            } else {
                let html = '<ul class="list-disc ml-5">';
                requests.forEach((req) => {
                    html += `<li>
              <strong>Request ID:</strong> ${req.request_id} - 
              <strong>User:</strong> ${req.user_id} - 
              <strong>Requested Amount:</strong> ${req.amount} - 
              <strong>Reason:</strong> ${req.reason} - 
              <strong>Status:</strong> ${req.status} - 
              <strong>Request Date:</strong> ${req.request_date}
              <br/>
              <button class="approve bg-green-500 text-white py-1 px-2 rounded mt-2" data-id="${req.request_id}">Approve</button>
              <button class="deny bg-red-500 text-white py-1 px-2 rounded mt-2" data-id="${req.request_id}">Deny</button>
            </li>`;
                });
                html += "</ul>";
                pendingDiv.innerHTML = html;
                const approveButtons = document.querySelectorAll(".approve");
                approveButtons.forEach((button) => {
                    button.addEventListener("click", function () {
                        const reqId = this.getAttribute("data-id");
                        manageCreditRequest(reqId, true);
                    });
                });
                const denyButtons = document.querySelectorAll(".deny");
                denyButtons.forEach((button) => {
                    button.addEventListener("click", function () {
                        const reqId = this.getAttribute("data-id");
                        manageCreditRequest(reqId, false);
                    });
                });
            }
        }
    }

    function manageCreditRequest(reqId, isApproved) {
        let requests = getCreditRequests();
        const requestIndex = requests.findIndex((r) => r.request_id == reqId);
        if (requestIndex > -1) {
            const request = requests[requestIndex];
            // Simulate PATCH /admin/creditsystem/managerequest
            let admin_notes = prompt("Enter admin notes:", isApproved ? "Approved" : "Denied");
            if (admin_notes === null) return; // cancel if no input
            request.status = isApproved ? "approved" : "denied";
            request.response_date = new Date().toISOString();
            request.admin_notes = admin_notes;
            if (isApproved) {
                // Update the user's credits
                let users = getUsers();
                let userToUpdate = users.find((u) => u.username === request.user_id);
                if (userToUpdate) {
                    userToUpdate.credits += request.amount;
                    updateUser(userToUpdate);
                }
            }
            console.log({ message: "Credit request updated successfully" });
            requests.splice(requestIndex, 1); // remove request after processing
            saveCreditRequests(requests);
            location.reload();
        }
    }

    // Analytics Page – GET /admin/creditsystem/getcreditrequests (for overall analytics)
    if (document.getElementById("analyticsData")) {
        redirectIfNotLoggedIn();
        const users = getUsers();
        let totalScans = 0;
        let userScans = [];
        users.forEach((u) => {
            const scans = u.scanHistory ? u.scanHistory.length : 0;
            totalScans += scans;
            userScans.push({ username: u.username, scans });
        });
        let html = `<p><strong>Total Scans:</strong> ${totalScans}</p>`;
        html += '<h3 class="text-xl mt-4">Scans per User:</h3><ul class="list-disc ml-5">';
        userScans.forEach((us) => {
            html += `<li>${us.username}: ${us.scans}</li>`;
        });
        html += "</ul>";
        document.getElementById("analyticsData").innerHTML = html;
    }

    // Daily Credit Reset (simulation)
    function dailyCreditReset() {
        let users = getUsers();
        users.forEach((u) => {
            u.credits = u.limit;
        });
        saveUsers(users);
    }
    // Uncomment below to simulate a daily reset on page load (for testing)
    // dailyCreditReset();
})();
