
<div align="center">
     <h1> 💳 SplitWise — Expense Sharing & Settlement Platform </h1>
     <br>
    <img width="300" height="200" alt="SplitWise Logo" src="image/README/1791133091866.png" />
    <br>
    A full-stack web application designed to simplify <b>shared expense management</b> among friends, roommates, and groups.
    <br>
    The platform enables users to <b>create groups</b>, <b>split expenses</b>, and <b>track balances</b> with smart debt settlement and spending analytics.
     <br>
</div>

---

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/) [![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) [![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
](LICENSE)

---

## 🚀 Overview

SplitWise helps friends, roommates, and teams manage shared expenses without manually calculating who owes whom. Members can create groups, add expenses, split costs equally or by custom amounts, and view settlement suggestions based on each person's net balance.

Along with expense tracking, the application provides a spending analytics dashboard with category-wise breakdowns, monthly trends, and member contribution insights.


---

## ✨ Features

### 👥 Group Management

- Create groups for shared expenses.
- Add registered users to a group.
- View group members, expenses, and balances in one place.
- Group creators have administrative controls for managing the group.

### 💰 Expense Tracking and Splitting

- Add expenses with a description, amount, payer, participants, and category.
- Split an expense equally among participants.
- Use custom splits when members owe different amounts.
- Validate custom shares against the total expense.
- Edit or delete expenses and keep group balances updated.
- Browse expense history grouped by month and year.

### 🧮 Smart Settlement — Greedy Cash Flow Minimization

Settling every pairwise debt separately can lead to unnecessary transfers. SplitWise calculates each participant's net balance and matches people who owe money with people who should receive money.

For example, if Alice owes Bob ₹500 and Bob owes Charlie ₹500, the optimized view can suggest one direct transfer: **Alice pays Charlie ₹500**.

The optimizer:

- Calculates net balances from the group's expenses.
- Matches the largest debtor with the largest creditor.
- Creates a transfer for the smaller of the two outstanding balances.
- Repeats until all balances are settled.
- Handles circular debts through net-balance calculation.
- Uses integer-based amount calculations to reduce floating-point rounding errors.

For `N` participants, the greedy approach produces at most `N - 1` transfers. It is designed to simplify settlements efficiently; it does not guarantee the globally minimum number of transfers for every possible balance configuration.

Users can view both:

- **Smart Settlement:** A simplified list of suggested transfers.
- **Pairwise Debts:** The original breakdown of who owes whom.

### 📊 Spending Analytics

The analytics dashboard helps members understand how group expenses are distributed.

- **Summary metrics:** Total group spending, expense count, average spending per member, and largest expense.
- **Category distribution:** Spending across Food & Dining, Transportation, Entertainment, Shopping, Utilities, Lodging, and Other.
- **Monthly spending trends:** Visualize spending over time.
- **Member contribution analysis:** Compare the amount paid by each member with their share of expenses and current net balance.

The backend uses MongoDB's `$facet` aggregation pipeline to retrieve multiple analytical views in a single database round-trip.

### 🔐 Authentication and Access Control

- User registration and login.
- JWT-based authentication with tokens stored in HTTP-only cookies.
- Password hashing using bcrypt.
- Protected application routes.
- Role-based permissions for group administration and restricted expense operations.

---

## 🧠 How the Settlement Logic Works

The settlement engine first calculates the net balance for each member:

```text
Net Balance = Total Amount Paid - Total Share Owed
```

| Balance  | Meaning                         |
| -------- | ------------------------------- |
| Positive | The member should receive money |
| Negative | The member owes money           |
| Zero     | The member is settled           |

The algorithm then repeatedly selects:

1. The member with the largest debt.
2. The member with the largest credit.
3. A transfer equal to the smaller outstanding balance.

After the transfer, both balances are updated. At least one member reaches a zero balance in each iteration, so the process terminates after at most `N - 1` transfers.

**Implementation detail:** Amounts are scaled to integer cents during optimization to avoid common floating-point precision issues.

---

## 🏗️ System Architecture

<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/3a490b0e-3a25-45fb-b037-54fddce14c78" />

### Application Responsibilities

- **Frontend:** Handles user interaction, group and expense views, settlement displays, and analytics visualizations.
- **Backend:** Provides REST APIs, validates requests, enforces access rules, manages expenses, and calculates settlements and analytics.
- **Database:** Stores user, group, and expense data using MongoDB and Mongoose.

---

## 🛠️ Tech Stack

| Layer                   | Technologies                |
| ----------------------- | --------------------------- |
| Frontend                | React 19, Vite 7            |
| Styling                 | Tailwind CSS v4             |
| Animations              | Framer Motion 12            |
| Icons and notifications | React Icons, React Toastify |
| Backend                 | Node.js, Express 5          |
| Database                | MongoDB, Mongoose 9         |
| Authentication          | JWT, bcrypt, Cookie-Parser  |

---

## ▶️ Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- MongoDB local instance or MongoDB Atlas
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Dnyaneshwar-dnyanu/Expense-Tracker.git
cd Expense-Tracker
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_KEY=your_jwt_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

The backend will be available at `http://localhost:3000`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Testing and Verification

The settlement optimizer includes a verification script for important financial and algorithmic edge cases.

Run it from the repository root:

```bash
node backend/tests/verifySettlementOptimizer.js
```

The test scenarios include:

- **Direct debt:** Verify a transfer between two participants.
- **Transitive debt:** Simplify a chain of debts into a direct transfer.
- **Circular debt:** Verify that circular balances cancel out.
- **Fractional division:** Check uneven splits without floating-point remainder errors.
- **Multiple participants:** Verify that a larger debt network is simplified within the `N - 1` transfer bound.
- **Settled expense isolation:** Ensure already settled shares are excluded from recalculation.

---

## 🎓 What This Project Demonstrates

- Full-stack application development using React, Node.js, Express, and MongoDB.
- Designing REST APIs for collaborative applications.
- Implementing a greedy algorithm to simplify group debt settlements.
- Using MongoDB aggregation pipelines for spending analytics.
- Handling authentication, password hashing, and role-based access.
- Building expense-splitting logic with attention to monetary precision.

---

## 👨‍💻 Author

**Dnyaneshwar Bhaj**
[GitHub](https://github.com/Dnyaneshwar-dnyanu)

## 📄 License

Distributed under the MIT License. See the `LICENSE` file for details.
