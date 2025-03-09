/* script.js */
(function () {
    "use strict";

    const BASE_URL = "http://localhost:3000";
    let authToken = localStorage.getItem("authToken") || null;

    // Utility functions
    async function apiRequest(endpoint, method = "GET", data = null) {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
            "Content-Type": "application/json"
        };

        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }

        const options = {
            method,
            headers,
            credentials: "include"
        };

        if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "API request failed");
            }

            return result;
        } catch (error) {
            console.error("API Request Error:", error);
            throw error;
        }
    }

    function getLoggedInUser() {
        return JSON.parse(localStorage.getItem("loggedInUser"));
    }

    function setLoggedInUser(user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
    }

    function removeLoggedInUser() {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("authToken");
    }

    function redirectIfNotLoggedIn() {
        if (!getLoggedInUser() || !authToken) {
            window.location.href = "login.html";
        }
    }

    // Registration - POST /auth/register
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const name = document.getElementById("regName").value.trim();
            const username = document.getElementById("regUsername").value.trim();
            const password = document.getElementById("regPassword").value;

            try {
                const response = await apiRequest("/auth/register", "POST", {
                    name,
                    username,
                    password
                });

                alert("User registered successfully");
                console.log(response);
                window.location.href = "scan.html";
            } catch (error) {
                alert(error.message || "Registration failed. Please try again.");
            }
        });
    }

    // Login - POST /auth/login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;

            try {
                const response = await apiRequest("/auth/login", "POST", {
                    username,
                    password
                });

                authToken = response.token;
                localStorage.setItem("authToken", authToken);
                setLoggedInUser(response.user);

                console.log(response);
                window.location.href = "dashboard.html";
            } catch (error) {
                alert("Invalid credentials.");
            }
        });
    }

    // Logout - GET /auth/logout
    const logoutLinks = document.querySelectorAll("#logoutLink");
    if (logoutLinks) {
        logoutLinks.forEach((link) => {
            link.addEventListener("click", async function (e) {
                e.preventDefault();

                try {
                    await apiRequest("/auth/logout", "GET");
                    removeLoggedInUser();
                    console.log({ message: "Logout successful" });
                    window.location.href = "login.html";
                } catch (error) {
                    console.error("Logout failed:", error);
                    // Force logout even if API fails
                    removeLoggedInUser();
                    window.location.href = "login.html";
                }
            });
        });
    }

    // Dashboard – load profile info and scan history (GET /profile/userdata & /profile/scans)
    if (document.getElementById("profileInfo")) {
        redirectIfNotLoggedIn();

        async function loadProfileData() {
            try {
                const userData = await apiRequest("/profile/userdata", "GET");
                const user = userData.user;

                const profileDiv = document.getElementById("profileInfo");
                profileDiv.innerHTML = `<p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                <p><strong>Credits:</strong> ${user.credits} (Daily Limit: ${user.limit})</p>`;

                if (user.role === "admin") {
                    document.getElementById("adminLink").innerHTML = `<a href="admin.html" class="mr-4">Admin Panel</a>`;
                }

                setLoggedInUser(user); // Update local storage with latest user data

                // Get scan history
                const scansData = await apiRequest("/profile/scans", "GET");
                const scanHistoryDiv = document.getElementById("scanHistory");

                if (scansData.scans && scansData.scans.length > 0) {
                    let historyHTML = '<ul class="list-disc ml-5">';
                    scansData.scans.forEach((scan) => {
                        historyHTML += `<li>${scan.title} - <small>${scan.upload_date}</small></li>`;
                    });
                    historyHTML += "</ul>";
                    scanHistoryDiv.innerHTML = historyHTML;
                } else {
                    scanHistoryDiv.innerHTML = "<p>No scans yet.</p>";
                }
            } catch (error) {
                console.error("Failed to load profile data:", error);
                alert("Failed to load profile data. Please try logging in again.");
                window.location.href = "login.html";
            }
        }

        loadProfileData();
    }

    // Scan Document - POST /scan
    const scanForm = document.getElementById("scanForm");
    if (scanForm) {
        redirectIfNotLoggedIn();
        scanForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const title = document.getElementById("docTitle").value.trim();
            const fileInput = document.getElementById("docFile");
            const file = fileInput.files[0];

            if (!file) {
                alert("Please select a file to scan.");
                return;
            }

            try {
                // Check user credits first
                const userData = await apiRequest("/profile/userdata", "GET");
                if (userData.user.credits <= 0) {
                    alert("No credits left. Please request additional credits or wait for daily reset.");
                    return;
                }

                const reader = new FileReader();
                reader.onload = async function (e) {
                    const content = e.target.result;

                    try {
                        const scanResponse = await apiRequest("/scan", "POST", {
                            title,
                            content
                        });

                        // Store document ID for matches page
                        sessionStorage.setItem("lastScannedDocId", scanResponse.document_id);

                        alert("Document scanned successfully!");
                        console.log(scanResponse);
                        window.location.href = "matches.html";
                    } catch (error) {
                        alert("Scan failed: " + (error.message || "Unknown error"));
                    }
                };
                reader.readAsText(file);
            } catch (error) {
                alert("Error checking credits: " + (error.message || "Unknown error"));
            }
        });
    }

    // Matches Page – GET /matches/{docId}
    if (document.getElementById("matchesList")) {
        redirectIfNotLoggedIn();

        async function loadMatches() {
            const docId = sessionStorage.getItem("lastScannedDocId");
            if (!docId) {
                document.getElementById("matchesList").innerHTML = "<p>No recent scan found. Please scan a document first.</p>";
                return;
            }

            try {
                const matchesData = await apiRequest(`/matches/${docId}`, "GET");
                const matchesDiv = document.getElementById("matchesList");

                let html = '<h3 class="text-xl mb-2">Matching Results for Document ID ' + docId + '</h3>';

                if (matchesData.similar_documents && matchesData.similar_documents.length > 0) {
                    html += '<ul class="list-disc ml-5">';
                    matchesData.similar_documents.forEach((doc) => {
                        html += `<li><strong>${doc.title}</strong> - Similarity: ${doc.similarity_score}</li>`;
                    });
                    html += "</ul>";
                } else {
                    html += "<p>No matching documents found.</p>";
                }

                matchesDiv.innerHTML = html;
            } catch (error) {
                console.error("Failed to load matches:", error);
                document.getElementById("matchesList").innerHTML = "<p>Failed to load matching results. Please try again.</p>";
            }
        }

        loadMatches();
    }

    // Credit Request - POST /credits/request
    const creditRequestForm = document.getElementById("creditRequestForm");
    if (creditRequestForm) {
        redirectIfNotLoggedIn();
        creditRequestForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const amount = parseInt(document.getElementById("creditAmount").value);
            const reason = document.getElementById("creditReason").value.trim();

            if (isNaN(amount) || amount <= 0 || reason === "") {
                alert("Please enter a valid credit amount and reason.");
                return;
            }

            try {
                const response = await apiRequest("/credits/request", "POST", {
                    amount,
                    reason
                });

                console.log(response);
                document.getElementById("creditRequestResult").innerText = "Credit request submitted successfully.";
                creditRequestForm.reset();
            } catch (error) {
                alert("Credit request failed: " + (error.message || "Unknown error"));
            }
        });
    }

    // Admin Page – manage credit requests - GET /admin/creditsystem/getcreditrequests
    if (document.getElementById("pendingRequests")) {
        redirectIfNotLoggedIn();

        async function loadCreditRequests() {
            try {
                const user = getLoggedInUser();
                if (user.role !== "admin") {
                    document.getElementById("pendingRequests").innerText = "Access Denied. Admins only.";
                    return;
                }

                // Get status filter from URL if available
                const urlParams = new URLSearchParams(window.location.search);
                const statusFilter = urlParams.get("status");

                let endpoint = "/admin/creditsystem/getcreditrequests";
                if (statusFilter) {
                    endpoint += `?status=${statusFilter}`;
                }

                const requestsData = await apiRequest(endpoint, "GET");
                const pendingDiv = document.getElementById("pendingRequests");

                if (!requestsData.requests || requestsData.requests.length === 0) {
                    pendingDiv.innerHTML = "<p>No pending requests.</p>";
                    return;
                }

                let html = '<ul class="list-disc ml-5">';
                requestsData.requests.forEach((req) => {
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

                // Add event listeners for approve/deny buttons
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
            } catch (error) {
                console.error("Failed to load credit requests:", error);
                document.getElementById("pendingRequests").innerHTML = "<p>Failed to load credit requests. Please try again.</p>";
            }
        }

        loadCreditRequests();
    }

    async function manageCreditRequest(reqId, isApproved) {
        let admin_notes = prompt("Enter admin notes:", isApproved ? "Approved" : "Denied");
        if (admin_notes === null) return; // cancel if no input

        try {
            const response = await apiRequest("/admin/creditsystem/managerequest", "PATCH", {
                request_id: reqId,
                status: isApproved ? "approved" : "denied",
                admin_notes
            });

            console.log(response);
            alert("Credit request " + (isApproved ? "approved" : "denied") + " successfully.");
            location.reload();
        } catch (error) {
            alert("Failed to process credit request: " + (error.message || "Unknown error"));
        }
    }

    // Analytics Page – GET /admin/analytics
    if (document.getElementById("analyticsData")) {
        redirectIfNotLoggedIn();

        async function loadAnalyticsData() {
            try {
                const user = getLoggedInUser();
                if (user.role !== "admin") {
                    document.getElementById("analyticsData").innerText = "Access Denied. Admins only.";
                    return;
                }

                const analyticsData = await apiRequest("/admin/analytics", "GET");

                let html = `<p><strong>Total Scans:</strong> ${analyticsData.totalScans}</p>`;
                html += '<h3 class="text-xl mt-4">Scans per User:</h3><ul class="list-disc ml-5">';

                analyticsData.userScans.forEach((us) => {
                    html += `<li>${us.username}: ${us.scans}</li>`;
                });

                html += "</ul>";
                document.getElementById("analyticsData").innerHTML = html;
            } catch (error) {
                console.error("Failed to load analytics data:", error);
                document.getElementById("analyticsData").innerHTML = "<p>Failed to load analytics data. Please try again.</p>";
            }
        }

        loadAnalyticsData();
    }
})();