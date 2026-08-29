# MERN Expense Tracker

A full-stack expense tracker built with MongoDB, Express, React, and Node.js — with authentication and 3 unique features.

## Unique Features

1. **Smart Budget Predictor** — Set a monthly budget and get a live projection of your end-of-month spend, calculated from your average daily spending pace so far. Shows color-coded alerts (info / warning / danger) as you approach or exceed your budget.
2. **Spending Heatmap Calendar** — A GitHub-contributions-style calendar that visualizes daily spending intensity for the month, so you can spot high-spend days at a glance.
3. **Bill Splitting (mini-Splitwise)** — Split any expense among multiple people (evenly or by custom shares), track who has paid, and see a running list of settled/unsettled balances.

## Tech Stack
- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express, JWT auth, bcrypt
- **Database:** MongoDB with Mongoose

## Project Structure
```
expense-tracker/
├── backend/
│   ├── models/         (User, Expense, Budget, SplitExpense)
│   ├── routes/         (auth, expenses, budget, split)
│   ├── middleware/      (JWT auth middleware)
│   ├── utils/           (budget prediction logic)
│   └── server.js
└── frontend/
    └── src/
        ├── api/          (axios instance)
        ├── context/      (AuthContext)
        ├── components/   (ExpenseForm, ExpenseList, HeatmapCalendar, BudgetPredictor, SplitExpense, Navbar)
        ├── pages/        (Login, Register, Dashboard, BudgetPage, SplitPage)
        └── App.js
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB running locally, or a MongoDB Atlas connection string

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and a JWT secret
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if your backend runs on a different URL
npm start
```
Frontend runs on `http://localhost:3000`.

### 3. Use the App
1. Register a new account.
2. Add expenses from the Dashboard.
3. Set a monthly budget on the "Budget Predictor" page to see spend projections.
4. Use "Split Bills" to split any expense with friends and track settlements.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/expenses | List expenses (filter by ?month&year) |
| POST | /api/expenses | Add expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/expenses/heatmap/data | Daily totals for heatmap |
| GET | /api/budget | Get budget for a month |
| POST | /api/budget | Set/update budget |
| GET | /api/budget/predict | Get spend prediction |
| GET | /api/split | List split expenses |
| POST | /api/split | Create split expense |
| PATCH | /api/split/:id/settle/:participantIndex | Toggle settled status |
| DELETE | /api/split/:id | Delete a split |
| GET | /api/split/summary/balances | Aggregate balances by person |

## Notes
- All expense/budget/split routes require a `Authorization: Bearer <token>` header (handled automatically by the frontend once logged in).
- Passwords are hashed with bcrypt; tokens are signed JWTs valid for 7 days.

