# Document Scanning & Matching System

## Overview
This is a self-contained document scanning and matching system with a built-in credit system. Users have a daily limit of 20 free scans, and additional scans require requesting more credits. The system supports basic text-matching and offers an optional AI-powered matching feature.

## Features
- **User Authentication & Role Management**
  - User registration & login
  - Roles: Regular users & admins
  - Profile section displaying credits, past scans, and requests

- **Credit System**
  - 20 free scans per user per day (auto-reset at midnight)
  - Users must request additional credits if they exceed their limit
  - Admins can approve or deny credit requests
  - Each document scan deducts 1 credit

- **Document Scanning & Matching**
  - Users upload plain text files for scanning
  - System compares files against stored documents using basic text similarity algorithms
  - Optional AI-powered matching using OpenAI, Gemini, or DeepSeek

- **Smart Analytics Dashboard**
  - Tracks scans per user per day
  - Identifies common scanned document topics
  - Displays top users by scan and credit usage
  - Generates credit usage statistics for admins

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript (Vanilla, no frameworks)
- **Backend:** Node.js (Express) or Python (Flask/Django) without external libraries
- **Database:** SQLite (or JSON files for lightweight storage)
- **File Storage:** Local storage for documents
- **Authentication:** Basic username-password login (hashed passwords)
- **Text Matching:** Custom algorithm using Levenshtein distance, word frequency, etc.

## Project Structure
```
root/
├── backend/          # Backend code and APIs
│   ├── README.md     # Backend-specific documentation
│   ├── src/         
│   ├── config/
│   ├── database/
│   ├── logs/
│   ├── setup/
│   └── uploads/
├── frontend/         # Frontend (Vanilla JS, HTML, CSS)
│   ├── README.md     # Frontend-specific documentation
│   ├── assets/
│   ├── scripts/
│   ├── styles/
│   └── index.html
├── documentation/    # Additional documentation
│   ├── database.md   # DB design & schema
│   ├── API.md        # API endpoints
│   └── setup.md      # Setup instructions
├── README.md         # Main project documentation (this file)
└── .gitignore
```

## Getting Started
### Prerequisites
- Node.js (if using Express)
- SQLite installed

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/opsingh861/DocVault.git
   cd DocVault
   ```
2. Install dependencies for the backend:
   ```sh
   cd backend
   npm install
   ```
3. Start the backend server:
   ```sh
   npm start
   ```
4. Open `index.html` inside the frontend folder to access the UI.


## Additional Documentation
- **[Backend Documentation](backend/README.md)**
- **[Frontend Documentation](frontend/README.md)**
- **[Database Design](backend/documentation/db.md)**
- **[API Reference](backend/documentation/apidoc.md)**
- **[Postman Documentation](https://documenter.getpostman.com/view/28605239/2sAYdoG7iW)**

## License
This project is licensed under the MIT License.

