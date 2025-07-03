
# 💼 Roxiler MERN Stack Coding Challenge

This project is a full-stack MERN application that fetches product transaction data from a third-party API and provides various analytics like transaction listing, statistics, and charts based on the selected month.

---

## 🧩 Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB
- **Others:** Axios, Chart.js / Recharts

---

## 📦 Project Features

### 🔁 Backend APIs

- **Seed API:** Fetches data from third-party JSON and stores it in MongoDB
- **Transactions API:** Lists transactions with search and pagination
- **Statistics API:** Total sale amount, total sold items, not sold items (by month)
- **Bar Chart API:** Shows count of items in price ranges (by month)
- **Pie Chart API:** Shows item counts per category (by month)
- **Combined API:** Aggregates statistics, bar chart, and pie chart into one response

### 🖥️ Frontend Features

- Month selection dropdown (January to December, default: **March**)
- Search box to filter transactions by title, description, or price
- Paginated transaction table
- Statistics display cards (total sale, sold, not sold)
- Bar chart and pie chart for the selected month

---

## 🚀 Getting Started

### 📁 Backend Setup

1. Go to the backend folder:
   ```bash
   cd task-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   node index.js
   ```

> ⚠️ Make sure MongoDB is running. Update MongoDB URI in `.env` if needed.

---

### 🌐 Frontend Setup

1. Go to the frontend folder:
   ```bash
   cd task-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

---

## 🔗 API Source

- **Third Party API (Seed Data):**
  ```
  https://s3.amazonaws.com/roxiler.com/product_transaction.json
  ```

---

## 📊 Default Settings

- **Month dropdown default:** March
- **Pagination defaults:** page = 1, per page = 10

---

## 🗂️ Folder Structure

```
Roxiler-Task/
│
├── task-backend/
│   ├── index.js        # Entry point for backend
│   └── ...             # Other backend files
│
├── task-frontend/
│   ├── src/
│   └── ...             # React frontend components
│
└── README.md           # This file

