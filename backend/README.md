# 📌 DocVault

## 🚀 Overview
This is a backend application built with **Node.js** that provides APIs for authentication, credit management, user profiles, and more. The project follows a modular structure for scalability and maintainability.

## 📂 Folder Structure
```
backend/
├── .env                 # Environment variables
├── .env.example         # Example environment variables (exclude secrets)
├── database.sqlite      # SQLite database file
├── package.json         # Dependencies and scripts
├── server.js            # Main entry point of the backend
├── sessions.sqlite      # Session storage for authentication
├── config/
│   └── app.js           # Application configuration settings
├── logs/
│   ├── app.log          # Application logs
│   └── error.log        # Error logs
├── setup/
│   ├── db.sql           # SQL file for database initialization
│   └── setupAdmin.js    # Script to set up an admin user
├── src/
│   ├── api/             # API endpoints categorized by feature
│   │   ├── admin/       # Admin-related endpoints
│   │   ├── auth/        # Authentication logic
│   │   ├── credit/      # Credit-related operations
│   │   ├── match/       # Matching logic
│   │   ├── profile/     # User profile management
│   │   └── scan/        # Scanning operations
│   ├── middlewares/     # Middleware functions
│   │   ├── auth.middleware.js       # Authentication middleware
│   │   ├── creditCheck.middleware.js # Credit validation middleware
│   │   ├── error.middleware.js      # Global error handling
│   │   └── logging.middleware.js    # Request logging
│   ├── model/          # Database models
│   │   ├── credit.model.js          # Credit schema
│   │   ├── creditRequest.model.js    # Credit request schema
│   │   └── ...                       # Other models
│   ├── services/       # Business logic services
│   │   └── ...  
│   └── utils/          # Utility/helper functions
│       └── ...  
└── uploads/            # Uploaded files storage
    ├── 5c7012cd-1258-481d-ae21-a97d69f0438c.txt
    └── 660f8d22-d5b7-46f7-9824-67e758390761.txt
```

## 🛠️ Setup & Installation
### Prerequisites
- **Node.js** (v16 or later)
- **npm** or **yarn**

### Installation Steps
1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo/backend
   ```
2. **Install dependencies:**
   ```sh
   npm install  # or yarn install
   ```
3. **Set up environment variables:**
   - Copy the `.env.example` file and rename it to `.env`.
   - Update the `.env` file with the necessary configurations.
4. **Run database migrations (if applicable):**
   ```sh
   node setup/setupAdmin.js  # Setup an admin user
   ```
5. **Start the server:**
   ```sh
   npm start  # or node server.js
   ```

## 🔥 API Endpoints
<!-- - [Contributing](./documentation/apidoc.md) -->
<iframe src="./documentation/apidoc.md" width="100%" height="500px"></iframe>

## 🛡️ Middleware
- **Authentication Middleware** → Protects routes from unauthorized access.
- **Credit Check Middleware** → Ensures users meet credit requirements.
- **Error Middleware** → Centralized error handling.
- **Logging Middleware** → Logs API requests for debugging.

## 📖 Contribution Guidelines
Contributions are welcome! Follow these steps to contribute:
1. **Fork the repository**
2. **Create a new branch:**
   ```sh
   git checkout -b feature-branch
   ```
3. **Make your changes and commit:**
   ```sh
   git commit -m "Add new feature"
   ```
4. **Push to your branch:**
   ```sh
   git push origin feature-branch
   ```
5. **Create a Pull Request** on GitHub.


