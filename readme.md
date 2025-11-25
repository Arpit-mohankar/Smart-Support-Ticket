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
cd src
node index.js
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

📁 Project Structure
``` 
project-root/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Database setup & seeding
│   │   ├── controllers/
│   │   │   ├── authController.js   # Login/register logic
│   │   │   ├── ticketController.js # Ticket CRUD operations
│   │   │   └── noteController.js   # Note operations
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   └── validate.js        # Zod validation middleware
│   │   ├── schemas/
│   │   │   └── validation.js      # Zod schemas
│   │   └── server.js              # Express app entry point
│   ├── package.json
│   └── database.db                # SQLite database (auto-generated)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TicketList.jsx     # Main ticket table
│   │   │   ├── TicketDrawer.jsx   # Side panel details
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── hooks/
│   │   │   └── useDebounce.js     # Search debouncing
│   │   ├── services/
│   │   │   └── api.js             # Axios configuration
│   │   ├── App.jsx                # Routes & protected routes
│   │   └── main.jsx               # React entry point
│   ├── package.json
│   └── index.html
│
└── README.md                       # This file

```

# ⚡ Optimistic Updates

1.Instant UI Update - When a user changes ticket status/priority or adds a note, the UI updates immediately before the API call completes
2.Background API Call - The mutation is sent to the server
3.Success Path - If successful, the cache is invalidated and fresh data is fetched
4.Error Path - If the API fails, the UI automatically rolls back to the previous state and shows an error toast

# 🔄 Auto-Refresh Implementation
```
const { data } = useQuery({
  queryKey: ['tickets', { page, status, priority, search }],
  queryFn: () => tickets.getAll({...}),
  refetchInterval: 10000, // Poll every 10 seconds
});
```

# 📉 Tradeoffs

  Decision           Reason              Limitation
  ------------------ ------------------- -----------------
  SQLite             Simple              Not scalable
  Stateless JWT      Easy                No revocation
  Polling            Avoids WebSockets   Less efficient
  Debounced search   Fewer calls         Delay
  Soft delete        Recoverable         Needs filtering

  🚀 Potential Improvements
 WebSocket Integration - Replace polling with real-time updates

 Refresh Token System - Improve security with token rotation

 Rate Limiting - Protect API from abuse (express-rate-limit)

 Input Sanitization - Enhanced XSS protection (DOMPurify)

 Error Boundaries - Graceful React error handling

# 🧰 Tech Stack

**Backend:** Node.js, Express, SQLite, JWT, bcrypt, Zod\
**Frontend:** React, TanStack Query, Tailwind, Router

👨‍💻 Author
Arpit Mohankar
