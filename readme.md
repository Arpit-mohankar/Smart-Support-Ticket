# 🚀 Support Ticket System --- Full Setup Guide

## 📌 Prerequisites

-   **Node.js** ≥ 18\
-   **npm** or **yarn**

# 🖥️ Backend Setup

``` bash
cd backend
npm install
```

### 📄 Create `.env`

    PORT=5000
    JWT_SECRET=YOUR_SECRET

### ▶️ Start Server

``` bash
npm run dev
```

### ⚙️ Backend Features

-   Auto-creates **SQLite database (`database.db`)**
-   Seeds **50 realistic support tickets**
-   Runs Express server at **http://localhost:5000**

# 💻 Frontend Setup

``` bash
cd frontend
npm install
npm run dev
```

# 🔑 API Endpoints

## 1. Authentication

-   **POST /auth/register** --- Register
-   **POST /auth/login** --- Login + JWT

## 2. Tickets

-   **GET /tickets** --- Pagination + filters + search\
-   **GET /tickets/:id** --- Single ticket\
-   **PATCH /tickets/:id** --- Update\
-   **DELETE /tickets/:id** --- Soft delete

## 3. Notes

-   **GET /tickets/:id/notes** --- List notes\
-   **POST /tickets/:id/notes** --- Add note (auth)

> All ticket/note routes require JWT in Authorization header.

# ⚡ Optimistic Updates

-   Instant UI update\
-   Background API call\
-   Rollback on failure\
-   Uses React Query: `onMutate`, `onError`, cache sync

# 🔄 Auto-Refresh

-   Polls every **10 seconds**\
-   Keeps filters, search, pagination, scroll\
-   Shows non-intrusive "Updating..."

# 📉 Tradeoffs

  Decision           Reason              Limitation
  ------------------ ------------------- -----------------
  SQLite             Simple              Not scalable
  Stateless JWT      Easy                No revocation
  Polling            Avoids WebSockets   Less efficient
  Debounced search   Fewer calls         Delay
  Soft delete        Recoverable         Needs filtering

# 🛠️ Roadmap

### High Priority

-   WebSockets\
-   Refresh tokens\
-   Rate limiting\
-   DOMPurify

### Medium

-   `/stats` endpoint\
-   Assignment\
-   Email alerts\
-   File attachments

### Nice to Have

-   Keyboard shortcuts\
-   Bulk actions\
-   Advanced search\
-   CSV export

# 🧰 Tech Stack

**Backend:** Node.js, Express, SQLite, JWT, bcrypt, Zod\
**Frontend:** React, TanStack Query, Tailwind, Router
