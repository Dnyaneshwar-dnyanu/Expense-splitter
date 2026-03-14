# 💳 SplitWise - Expense Splitter App

SplitWise is a modern, full-stack web application designed to take the headache out of shared expenses. Whether you're splitting bills with roommates, organizing an event, or managing group dinners, this app tracks who paid, who owes whom, and simplifies the settlement process.

## ✨ Features

- **User Authentication**: Secure signup and login system using JWT and bcrypt.
- **Group Management**: Create dedicated groups for different occasions and invite friends.
- **Smart Splitting Engine**: 
  - Add expenses easily.
  - Choose between **Equal Split** (automatic math) or **Custom Split** (you define exact amounts).
- **Expense History & Management**: View expenses grouped by month. Edit, delete, or bulk-delete past transactions.
- **Automated Invoices**: Automatically calculates "Who Owes Who" and gives you a clear "Net Balance".
- **Settle Up**: Clear debts between specific users with a single click without losing the group's financial history.
- **Modern UI**: A beautiful, responsive "Glassmorphism" interface built with Tailwind CSS and smooth animations powered by Framer Motion.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- React Router (Navigation)
- React Toastify (Notifications)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Database)
- JSON Web Tokens (JWT) for secure cookies
- Bcrypt for password hashing

---

## 🚀 Getting Started

Follow these instructions to set up the project on your local machine.

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or a free cluster on MongoDB Atlas)

### 1. Clone the repository
```bash
git clone <your-github-repo-url>
cd expense-splitter
```

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add the following variables:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string_here
   JWT_KEY=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```
   *(Replace `your_mongodb_connection_string_here` with your actual MongoDB URI).*
4. Start the backend server:
   ```bash
   node server.js
   ```
   *(Or use `nodemon server.js` if you have it installed for hot-reloading).*

### 3. Frontend Setup
1. Open a **new** terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory and point it to your backend:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 4. You're ready! 🎉
Open your browser and go to the local address provided by Vite (usually `http://localhost:5173`). Create an account and start splitting expenses!

---

## 📂 Project Structure

```text
Expense-Splitter/
├── backend/                  # Node.js + Express server
│   ├── config/               # Database connection
│   ├── controllers/          # Business logic for routes
│   ├── middleware/           # JWT verification
│   ├── models/               # Mongoose schemas (User, Group, Expense)
│   ├── routes/               # API endpoints
│   ├── utils/                # Helper functions (Token generation)
│   └── server.js             # Entry point for backend
│
└── frontend/                 # React frontend
    ├── public/               # Static assets
    ├── src/                  
    │   ├── components/       # Reusable UI parts (Modals, Cards, Lists)
    │   ├── pages/            # Main views (Home, Dashboard, GroupDetails)
    │   ├── App.jsx           # Main routing setup
    │   └── main.jsx          # React entry point
    └── tailwind.config.js    # Tailwind configuration
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).