# 🔐 User Registration, Login & JWT Authentication

An Express.js RESTful API application implementing secure user registration, credential authentication, and protected route authorization using **JSON Web Tokens (JWT)** and **MongoDB Atlas** (or local MongoDB). Passwords are cryptographically salted and hashed using **bcrypt** before persistence. Private endpoints are safeguarded by a custom **JWT Bearer Token authentication middleware**.

---

## 🚀 Key Features

- **Robust Registration (`POST /register`)**: Validates required fields (`name`, `email`, `password`), enforces unique email constraints, and securely hashes user passwords using `bcrypt` (10 salt rounds).
- **Secure Authentication (`POST /login`)**: Verifies credentials using `bcrypt.compare()` and issues a digitally signed JWT token valid for 1 hour.
- **Protected Profile Route (`GET /profile`)**: Enforces authentication via custom middleware (`authMiddleware.js`), extracting and verifying `Authorization: Bearer <token>`.
- **Unhashed Password Protection**: Plain-text passwords are never stored in the database.
- **Complete Postman Suite**: Pre-configured collection with automatic token extraction and test runners.

---

## 📁 Project Structure

```text
auth-assignment/
├── middleware/
│   └── authMiddleware.js          # JWT verification & Bearer token parsing
├── models/
│   └── User.js                    # Mongoose schema (name, unique email, hashed password)
├── screenshots/                   # Verification and testing screenshots
│   ├── 01_server_terminal.png
│   ├── 02_postman_register_success.png
│   ├── 03_postman_login_success.png
│   ├── 04_postman_profile_valid_token.png
│   ├── 05_postman_profile_no_token.png
│   ├── 06_postman_profile_invalid_token.png
│   ├── 07_mongodb_compass_user_document.png
│   ├── 08_postman_duplicate_email_error.png
│   └── 09_project_folder_structure.png
├── .env                           # Environment configuration (ignored in git)
├── .env.example                   # Sample environment template
├── .gitignore                     # Git ignore rules (node_modules, .env, .DS_Store)
├── package.json                   # Project metadata and dependencies
├── package-lock.json              # Dependency lockfile
├── postman_collection.json        # Postman test collection
├── README.md                      # Project documentation with screenshots
└── server.js                      # Express application entrypoint
```

![Project Structure](./screenshots/09_project_folder_structure.png)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/tiyag1608/User-Registration-Login-JWT-Authentication-Using-Express.js.git
cd User-Registration-Login-JWT-Authentication-Using-Express.js
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root (reference `.env.example`):
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/authdb
JWT_SECRET=supersecretjwtkey_auth_assignment_2026
```
> **Note:** You can use local MongoDB (`mongodb://127.0.0.1:27017/authdb`) or your **MongoDB Atlas** connection string.

### 4. Start the Application
```bash
npm start
```

When connected successfully, your terminal will confirm:
```text
Server running on port 3000
MongoDB Atlas connected
```

![Server & MongoDB Atlas Terminal](./screenshots/01_server_terminal.png)

---

## 📡 API Reference & Verification

### 1. Register User

- **Method**: `POST`
- **Endpoint**: `/register`
- **Description**: Validates input, checks for duplicate email, hashes password with `bcrypt` (10 rounds), and stores user in MongoDB.

#### Request Body
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "Rahul@123"
}
```

#### Success Response (`201 Created`)
```json
{
  "message": "User registered successfully"
}
```

![POST /register Success](./screenshots/02_postman_register_success.png)

#### Duplicate Email Error Response (`400 Bad Request`)
```json
{
  "message": "Email already exists"
}
```

![POST /register Duplicate Email Error](./screenshots/08_postman_duplicate_email_error.png)

---

### 2. User Login

- **Method**: `POST`
- **Endpoint**: `/login`
- **Description**: Validates credentials using `bcrypt.compare()` and returns a signed JWT token valid for 1 hour.

#### Request Body
```json
{
  "email": "rahul@example.com",
  "password": "Rahul@123"
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZjJiN2Q0OGMxZTlhM2Q3YTAwMWExMiIsImVtYWlsIjoicmFodWxAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTg3MjMxNDIsImV4cCI6MTc1ODcyNjc0Mn0.Uq9_M3LwR3d_X2f6XvO1eG5sH6y8A0t9C4p7R3b2"
}
```

![POST /login Success](./screenshots/03_postman_login_success.png)

---

### 3. Protected Profile Endpoint

- **Method**: `GET`
- **Endpoint**: `/profile`
- **Access**: Protected by `authMiddleware.js`
- **Required Header**: `Authorization: Bearer <JWT_TOKEN>`

#### Case A: Valid Token Provided (`200 OK`)
When a valid signed JWT is supplied in the `Authorization` header:

```json
{
  "message": "Welcome to your private profile",
  "user": {
    "id": "66f2b7d48c1e9a3d7a001a12",
    "email": "rahul@example.com"
  }
}
```

![GET /profile Valid Token](./screenshots/04_postman_profile_valid_token.png)

#### Case B: Missing Authorization Header (`401 Unauthorized`)
When no token or authorization header is included:

```json
{
  "message": "Unauthorized: No token provided"
}
```

![GET /profile No Token](./screenshots/05_postman_profile_no_token.png)

#### Case C: Invalid or Tampered Token (`401 Unauthorized`)
When the token signature is invalid, modified, or expired:

```json
{
  "message": "Unauthorized: Invalid or expired token"
}
```

![GET /profile Invalid Token](./screenshots/06_postman_profile_invalid_token.png)

---

## 🍃 MongoDB Database Verification

Passwords are never stored in plain text. Instead, `bcrypt.hash()` converts the password into a 60-character cryptographic hash (`$2b$10$...`) with built-in salting before writing to MongoDB.

Document structure inside `authdb.users`:

![MongoDB Compass Verification](./screenshots/07_mongodb_compass_user_document.png)

---

## 🧪 Postman Collection Setup & Test Order

A complete Postman collection is included in [`postman_collection.json`](./postman_collection.json).

### Steps to Test:
1. Open **Postman** and click **Import** -> Select `postman_collection.json`.
2. Execute the requests sequentially:
   - **`1. Register`**: Registers test user `rahul@example.com` (`201 Created`).
   - **`2. Login`**: Validates credentials and automatically extracts & saves JWT in `{{token}}` variable (`200 OK`).
   - **`3. Profile - No Token`**: Validates missing token rejection (`401 Unauthorized`).
   - **`4. Profile - Invalid Token`**: Validates invalid token rejection (`401 Unauthorized`).
   - **`5. Profile - Valid Token`**: Sends `Authorization: Bearer {{token}}` to retrieve profile (`200 OK`).

---

## 🔒 Security Architecture Highlights

| Layer | Implementation | Security Benefit |
|---|---|---|
| **Password Storage** | `bcrypt` (10 rounds) | Prevents rainbow table attacks; plain text is never exposed |
| **Authentication** | `jsonwebtoken` (HS256) | Stateless session management with 1-hour expiration |
| **Route Protection** | Custom `authMiddleware` | Reusable express middleware checking `Bearer <token>` pattern |
| **Data Sanitation** | Mongoose Schema | Trims whitespace, enforces lowercase email uniqueness |
| **Config Security** | `dotenv` & `.gitignore` | Prevents database credentials and secrets from leaking into Git |

---

## 👩‍💻 Author

**Tiya Gupta**  
GitHub: [@tiyag1608](https://github.com/tiyag1608)
