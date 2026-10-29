# 🚚 Pan-India Logistics & Warehouse Optimization Platform

**Enterprise Full-Stack Logistics Dashboard powered by React 19, Leaflet (OpenStreetMap India), Node.js/Express, a Native Dijkstra Shortest-Path Engine, and a Dual Database Architecture (MySQL Relational + MongoDB NoSQL).**

> 📖 **Database setup, inspection commands, and architecture details:** see [DATABASE_GUIDE.md](DATABASE_GUIDE.md)

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Architecture](#️-architecture)
4. [Technology Stack](#-technology-stack)
5. [Database Responsibilities](#️-database-responsibilities)
6. [Prerequisites](#-prerequisites)
7. [Installation](#-installation)
8. [Backend Environment Setup](#-backend-environment-setup)
9. [Database Seeding](#-database-seeding)
10. [Running the Application](#-running-the-application)
11. [Application URLs](#-application-urls)
12. [Demo Credentials](#-demo-credentials)
13. [Database Verification](#-database-verification)
14. [Project Structure](#-project-structure)

---

## 🌐 Overview

The **Pan-India Logistics & Warehouse Optimization Platform** is a full-stack enterprise web application for managing freight warehouses, inventory, shipments, and delivery routing across India. It combines a real-time geospatial map, a native Dijkstra shortest-path engine, role-based authentication, and a dual-database architecture (MySQL + MongoDB) into a single unified dashboard.

---

## ✨ Features

- **Interactive Pan-India Map** — 14 real-world freight warehouse locations rendered on OpenStreetMap with no external API keys required.
- **Warehouse Capacity Color-Coding** — 🟢 Available (< 70%), 🟠 Near Full (70–90%), 🔴 Full (> 90%).
- **Marker Clustering** — `leaflet.markercluster` groups nearby facilities at low zoom levels.
- **Inventory Side Drawer** — Click any warehouse to fly to it and view live SKU counts, space utilization, and contact details.
- **Dijkstra Shortest-Path Routing** — Native Node.js implementation calculates optimal delivery routes between hubs in real time.
- **FIFO / Priority Order Queue** — Dispatch orders with animated truck routing across the highway network.
- **Database Live View** — Browse live MySQL tables (`warehouses`, `inventory`, `orders`, `edges`, `users`) directly from the dashboard.
- **Role-Based Authentication** — `admin`, `manager`, and `customer` roles with bcrypt-hashed passwords and JWT bearer sessions.
- **Resilient Fallback** — If MySQL is offline, the backend starts automatically with in-memory data for all 14 warehouses.
- **Analytics Dashboard** — Charts powered by Recharts for inventory and shipment analytics.
- **Windows One-Click Startup** — `start.bat` builds the frontend if needed and launches the full stack.

---

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│       React Frontend         │
│     http://localhost:3000    │
└──────────────┬───────────────┘
               │ HTTP / REST
               ▼
┌──────────────────────────────┐
│   Node.js + Express Backend  │
│      backend/server.js       │
│   Dijkstra Route Engine      │
└───────────┬──────────┬───────┘
            │          │
            ▼          ▼
┌──────────────────┐  ┌──────────────────┐
│      MySQL       │  │     MongoDB      │
│  Structured data │  │  Document data   │
├──────────────────┤  ├──────────────────┤
│ users            │  │ activity_logs    │
│ warehouses       │  │ order_tracking   │
│ inventory        │  │ special inventory│
│ edges (routes)   │  │                  │
│ shipments        │  │                  │
└──────────────────┘  └──────────────────┘
```

The frontend **never connects directly** to either database — all data flows through the Express REST API.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| **Mapping** | Leaflet 1.9, react-leaflet 5, leaflet.markercluster |
| **Charts** | Recharts 3 |
| **Animations** | Framer Motion 12 |
| **HTTP Client** | Axios |
| **Backend** | Node.js, Express 5, TypeScript |
| **Routing Algorithm** | Native Dijkstra + Priority Queue (Node.js) |
| **Relational DB** | MySQL 8 (mysql2 driver) |
| **Document DB** | MongoDB 6 (Node.js driver) |
| **Auth** | bcryptjs, JSON Web Tokens (jsonwebtoken) |
| **Environment** | dotenv |

---

## 🗄️ Database Responsibilities

### MySQL — Structured Relational Data
Stores the core business records with foreign-key relationships and constraints:

| Table | Contents |
|---|---|
| `users` | Accounts, roles (`admin`/`manager`/`customer`), bcrypt-hashed passwords |
| `warehouses` | 14 Indian freight hubs, geospatial coordinates, capacity (sq ft) |
| `inventory` | Products, categories, unit prices, quantities, warehouse FK |
| `edges` | Weighted highway distances between warehouse vertices |
| `shipments` | Dispatch orders, priority urgency, delivery status |

### MongoDB — Document / Flexible Data
Stores unstructured and time-series records:

| Collection | Contents |
|---|---|
| `activity_logs` | Audit trail of user and system actions |
| `order_tracking` | Detailed delivery timeline events per shipment |
| `inventory` | Supplementary / special inventory documents |

> For full schema details, inspection commands, and troubleshooting, see [DATABASE_GUIDE.md](DATABASE_GUIDE.md).

---

## 📦 Prerequisites

Before running the project, ensure the following are installed and running:

- **Node.js** v18 or later
- **npm** v9 or later
- **MySQL 8** — Windows service must be running (`services.msc`)
- **MongoDB 6** — Windows service must be running (`services.msc`)
- **Git**

---

## 🔧 Installation

```bash
# 1. Clone the repository
git clone https://github.com/dependant-coder/logisctics.git
cd logisctics

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

---

## ⚙️ Backend Environment Setup

The backend reads its configuration from `backend/.env`. This file is **not committed to the repository** — you must create it locally.

Copy the provided example and fill in your local values:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your local credentials:

```env
# Server
PORT=3000

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=logistics_db

# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=logistics_db
```

> ⚠️ **Never commit `backend/.env` to version control.** It is listed in `.gitignore` and must stay local.

---

## 🌱 Database Seeding

Run the seeder once to create all tables and populate them with 14 Indian warehouses, inventory, route edges, and demo users:

```bash
cd backend
npm run seed
```

Alternatively, import the SQL files directly:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

> **Resilient fallback**: If MySQL is not yet configured, the backend starts automatically with in-memory data — no crash, no manual intervention needed.

---

## 🚀 Running the Application

### Option A — `start.bat` (Windows, Recommended)

Double-click `start.bat` in the project root, or run:

```bat
start.bat
```

What it does:
1. Detects whether the React frontend has been built (`frontend/dist/index.html`).
2. Runs `npm run build` in `frontend/` if the build is missing.
3. Opens `http://localhost:3000` in your default browser.
4. Starts the unified Node.js backend server (`backend/server.js`).

> Keep the command window open — closing it stops the server.

### Option B — Development Mode (Hot Reload)

```bat
start-dev.bat
```

Or manually in two terminals:

```bash
# Terminal 1 — Backend (with file-watch reload)
cd backend
npm run dev

# Terminal 2 — Frontend (Vite dev server)
cd frontend
npm run dev
```

---

## 🌍 Application URLs

| Mode | URL |
|---|---|
| Production (start.bat) | http://localhost:3000 |
| Vite dev server | http://localhost:5173 |
| Backend API base | http://localhost:3000/api |

---

## 🎭 Demo Credentials

These accounts are created by the database seeder and are intended for demonstration purposes only:

| Role | Email | Password |
|---|---|---|
| 🛡️ Admin | `admin@logistics.in` | `admin123` |
| 🏬 Manager | `manager@logistics.in` | `manager123` |
| 🚚 Customer | `customer@client.in` | `customer123` |

---

## 🔍 Database Verification

After seeding, verify the data is loaded correctly:

**MySQL:**
```sql
-- Connect
mysql -u root -p logistics_db

-- Quick checks
SELECT COUNT(*) FROM warehouses;   -- expect 14
SELECT COUNT(*) FROM inventory;
SELECT username, role FROM users;
SELECT COUNT(*) FROM edges;
```

**MongoDB:**
```js
// Connect
mongosh

use logistics_db
db.activity_logs.countDocuments()
db.order_tracking.countDocuments()
```

> For a full inspection guide, see [DATABASE_GUIDE.md](DATABASE_GUIDE.md).

---

## 📁 Project Structure

```text
DE-Project/
├── backend/                  # Node.js + Express API server
│   ├── db/
│   │   ├── mysql.js          # MySQL connection, queries, fallback logic
│   │   └── mongo.js          # MongoDB connection
│   ├── routes/               # Express route handlers
│   │   ├── auth.js
│   │   ├── warehouses.js
│   │   ├── inventory.js
│   │   ├── orders.js
│   │   ├── edges.js
│   │   ├── routing.js        # Dijkstra API endpoint
│   │   ├── analytics.js
│   │   └── locations.js
│   ├── services/
│   │   └── dijkstra.js       # Native Dijkstra + Priority Queue
│   ├── scripts/
│   │   └── seed_mysql.js     # Database seeder
│   ├── server.js             # Entry point
│   ├── .env.example          # Environment variable template
│   └── package.json
├── frontend/                 # React 19 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── views/        # Page-level view components
│   │   │   └── layout/       # Sidebar, Topbar, AppLayout
│   │   ├── contexts/
│   │   │   └── LogisticsContext.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── database/                 # SQL schema and seed files
│   ├── schema.sql
│   └── seed.sql
├── start.bat                 # Windows one-click production launcher
├── start-dev.bat             # Windows dual dev-mode launcher
├── DATABASE_GUIDE.md         # Full database guide ← start here
├── DB_CHANGES.md             # Database changelog
└── package.json              # Root scripts
```

---

## 📄 License

This project is for educational and demonstration purposes.
