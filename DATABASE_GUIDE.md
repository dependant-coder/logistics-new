# 🗄️ Database Guide

> **Pan-India Logistics & Warehouse Optimization Platform**  
> A practical guide to the project's MySQL and MongoDB architecture, startup process, stored data, and inspection commands.

---

## 📑 Contents

1. [Architecture Overview](#-architecture-overview)
2. [Starting the Project](#-starting-the-project)
3. [Do Database Terminals Need to Stay Open?](#-do-database-terminals-need-to-stay-open)
4. [MySQL](#-mysql)
5. [MongoDB](#-mongodb)
6. [How the Frontend Uses the Databases](#-how-the-frontend-uses-the-databases)
7. [Classroom Demonstration](#-classroom-demonstration)
8. [Useful Inspection Commands](#-useful-inspection-commands)
9. [Troubleshooting](#-troubleshooting)
10. [Important Notes](#-important-notes)

---

## 🏗️ Architecture Overview

```text
┌──────────────────────────────┐
│       React Frontend         │
│     http://localhost:3000    │
└──────────────┬───────────────┘
               │ HTTP requests
               ▼
┌──────────────────────────────┐
│   Node.js + Express Backend  │
│      backend/server.js       │
└───────────┬──────────┬───────┘
            │          │
            ▼          ▼
┌──────────────────┐  ┌──────────────────┐
│      MySQL       │  │     MongoDB      │
│ Structured data  │  │ Document data    │
├──────────────────┤  ├──────────────────┤
│ Users            │  │ Activity logs    │
│ Warehouses       │  │ Order timelines  │
│ Inventory        │  │ Special inventory│
│ Route edges      │  │                  │
│ Shipments        │  │                  │
└──────────────────┘  └──────────────────┘
```

### Simple explanation

- **MySQL** stores the application's main structured business records.
- **MongoDB** stores flexible documents such as audit logs and detailed tracking timelines.
- The **frontend never connects directly** to either database. It calls the Express API, and the backend communicates with the databases.

---

## 🚀 Starting the Project

The root [`start.bat`](start.bat) file is a Windows startup script. It:

1. Checks whether the React frontend has been built.
2. Builds the frontend when necessary.
3. Starts the Express backend.
4. Serves the frontend and API from port `3000`.

### Normal startup

Double-click:

```text
start.bat
```

Or run:

```bat
cd "D:\DEL Project\DE-Project"
start.bat
```

Then open:

```text
http://localhost:3000
```

> Keep the command window opened by `start.bat` running. Closing it stops the application server.

### Starting after restarting the computer

1. Ensure the MySQL and MongoDB Windows services are running.
2. Run `start.bat` again.
3. Open `http://localhost:3000`.

You do **not** need to reinstall dependencies or reseed the databases every time.

---

## 💻 Do Database Terminals Need to Stay Open?

**No.** MySQL Command Line Client and `mongosh` are inspection tools, not the database servers.

The actual database servers run as Windows background services:

- MySQL Server
- MongoDB Server

To inspect them:

1. Press `Win + R`.
2. Enter `services.msc`.
3. Find the MySQL and MongoDB services.
4. Confirm their status is **Running**.

The terminal clients only need to be opened when you want to inspect or demonstrate stored data.

---

# 🐬 MySQL

## Purpose

MySQL is the primary relational database. It stores structured records with relationships, constraints, and foreign keys.

### Database name

```sql
logistics_db
```

### Relevant project files

- `backend/db/mysql.js` — connection, queries, and fallback logic
- `database/schema.sql` — table definitions
- `database/seed.sql` — initial demonstration data
- `database/seed_mysql.js` — database seeder
- `backend/.env` — local connection configuration

---

## MySQL Tables

### 1. `users`

Stores application accounts and authentication information.

| Field type | Information stored |
|---|---|
| Identity | User ID and username |
| Authentication | Email and hashed password |
| Authorization | Admin, manager, or customer role |
| Profile | Full name |
| Audit | Creation timestamp |

```sql
SELECT id, username, email, role, full_name, created_at
FROM users;
```

> Passwords are stored as hashes, not plain text.

---

### 2. `warehouses`

Stores warehouse locations and capacity information.

| Information stored |
|---|
| Warehouse code and name |
| City and state |
| Latitude and longitude |
| Total and used capacity |
| Operational status |

```sql
SELECT id, code, name, city, state,
       total_capacity_sqft, used_capacity_sqft, status
FROM warehouses;
```

---

### 3. `inventory`

Stores products held at each warehouse.

| Information stored |
|---|
| Warehouse relationship |
| SKU and product name |
| Product category |
| Quantity |
| Unit price |
| Stock status |

```sql
SELECT id, warehouse_id, sku, name,
       category, quantity, unit_price, status
FROM inventory;
```

The `warehouse_id` connects each inventory item to a row in `warehouses`.

#### Inventory with warehouse details

```sql
SELECT
    i.id,
    i.sku,
    i.name AS product,
    i.quantity,
    i.unit_price,
    w.code AS warehouse_code,
    w.name AS warehouse
FROM inventory AS i
JOIN warehouses AS w ON w.id = i.warehouse_id
ORDER BY i.id DESC;
```

---

### 4. `edges`

Stores graph connections used for route calculation.

| Information stored |
|---|
| Source warehouse/location |
| Destination warehouse/location |
| Distance between them |

The backend's Dijkstra algorithm reads these connections to calculate the shortest route.

```sql
SELECT * FROM edges;
```

#### Show readable source and destination names

```sql
SELECT
    e.id,
    source.name AS source_warehouse,
    destination.name AS destination_warehouse,
    e.distance
FROM edges AS e
JOIN warehouses AS source ON source.id = e.source
JOIN warehouses AS destination ON destination.id = e.destination;
```

---

### 5. `shipments`

Stores shipment/order records.

| Information stored |
|---|
| Tracking number |
| Source warehouse |
| Destination warehouse |
| Current status |
| Urgency |
| Distance |
| Creation and update timestamps |

```sql
SELECT *
FROM shipments
ORDER BY id DESC;
```

#### Shipments with warehouse names

```sql
SELECT
    s.id,
    s.tracking_number,
    source.name AS source_warehouse,
    destination.name AS destination_warehouse,
    s.status,
    s.urgency,
    s.distance
FROM shipments AS s
JOIN warehouses AS source ON source.id = s.source_warehouse_id
JOIN warehouses AS destination ON destination.id = s.dest_warehouse_id
ORDER BY s.id DESC;
```

---

## MySQL Operations Used by the Application

| Application operation | Main table |
|---|---|
| Register or log in a user | `users` |
| Add or view a warehouse | `warehouses` |
| Add, view, or delete a product | `inventory` |
| View route connections | `edges` |
| Create or process an order | `shipments` |
| Calculate a shortest path | `edges` and warehouse/location data |

---

# 🍃 MongoDB

## Purpose

MongoDB stores flexible document-based information. It is mainly used for historical logs and detailed order-tracking records.

### Database name

```javascript
logistics_db
```

### Relevant project files

- `backend/db/mongo.js` — MongoDB connection and operations
- `backend/routes/analytics.js` — logs, tracking, and database views
- `backend/routes/orders.js` — tracking updates
- `backend/routes/inventory.js` — MongoDB buy/sell operations

---

## MongoDB Collections

### 1. `activity_logs`

Stores an audit history of application actions.

Examples include:

- User registration
- Inventory addition or deletion
- Warehouse creation
- Order creation
- Order processing
- Inventory purchase or sale

Typical document structure:

```javascript
{
  action: "Inventory added: Classroom Product (SKU: DEMO-001)",
  type: "inventory",
  timestamp: ISODate("2026-10-29T13:00:00Z")
}
```

Inspect recent logs:

```javascript
use logistics_db

db.activity_logs
  .find()
  .sort({ timestamp: -1 })
  .limit(20)
  .pretty()
```

Search for a particular SKU or action:

```javascript
db.activity_logs
  .find({ action: /DEMO-001/i })
  .sort({ timestamp: -1 })
  .pretty()
```

---

### 2. `order_tracking`

Stores detailed tracking documents for orders.

Information can include:

- Order ID
- Current status
- Timeline of events
- Calculated route
- Route distance
- Creation and completion timestamps

Typical document structure:

```javascript
{
  orderId: "7",
  status: "Delivered",
  timeline: [
    { status: "Pending", message: "Order registered in queue" },
    { status: "Delivered", message: "Order processed" }
  ],
  route: {
    distance: 1800,
    path: [1, 2, 3]
  },
  completedAt: ISODate("2026-10-29T13:10:00Z")
}
```

Inspect all tracking documents:

```javascript
use logistics_db

db.order_tracking.find().pretty()
```

Inspect one order:

```javascript
db.order_tracking.findOne({ orderId: "7" })
```

Inspect recently updated orders:

```javascript
db.order_tracking
  .find()
  .sort({ updatedAt: -1 })
  .limit(10)
  .pretty()
```

---

### 3. `inventory`

MongoDB also contains a separate inventory collection used by:

- `POST /api/inventory/buy`
- `POST /api/inventory/sell`

It can store:

- Product ID
- Product name
- Quantity
- Price

```javascript
use logistics_db

db.inventory.find().pretty()
```

Inspect one product:

```javascript
db.inventory.findOne({ id: "PRD-001" })
```

> ⚠️ **Important:** MongoDB's `inventory` collection and MySQL's `inventory` table are separate datasets. They are not automatically synchronized. The main warehouse inventory interface uses MySQL; the special buy/sell endpoints use MongoDB.

---

## MongoDB Operations Used by the Application

| Application operation | Collection |
|---|---|
| Record application actions | `activity_logs` |
| Create an order timeline | `order_tracking` |
| Update order route/status history | `order_tracking` |
| Buy or restock special inventory | `inventory` |
| Sell special inventory | `inventory` |

---

# 🖥️ How the Frontend Uses the Databases

The frontend communicates with API routes defined by the backend. It does not contain database credentials and does not execute SQL or MongoDB commands.

| Frontend area | Backend data source |
|---|---|
| Login and registration | MySQL `users` |
| Warehouse map/list | MySQL `warehouses` |
| Main inventory page | MySQL `inventory` |
| Order creation and queue | MySQL `shipments` |
| Route calculation | MySQL `edges` |
| Order tracking timeline | MongoDB `order_tracking` |
| Activity/database views | MongoDB `activity_logs` and MySQL tables |
| Special buy/sell operations | MongoDB `inventory` |

### Request flow

```text
User clicks a button in React
          ↓
Frontend sends an HTTP request
          ↓
Express route validates and processes it
          ↓
Backend reads/writes MySQL or MongoDB
          ↓
Backend returns JSON
          ↓
Frontend updates the screen
```

---

# 🎓 Classroom Demonstration

## Demonstration 1: Add inventory and prove MySQL persistence

### In the application

Add an inventory item with recognizable values:

```text
SKU: TEACHER-DEMO-01
Name: Classroom Demonstration Product
Quantity: 50
Unit price: 100
```

### In MySQL

```sql
USE logistics_db;

SELECT
    id,
    warehouse_id,
    sku,
    name,
    quantity,
    unit_price,
    status
FROM inventory
WHERE sku = 'TEACHER-DEMO-01';
```

The new row proves that the frontend action persisted in MySQL.

### In MongoDB

The backend should also create an audit log:

```javascript
use logistics_db

db.activity_logs
  .find({ action: /TEACHER-DEMO-01/i })
  .sort({ timestamp: -1 })
  .pretty()
```

This demonstrates one action producing:

- A structured product record in **MySQL**
- A historical audit record in **MongoDB**

---

## Demonstration 2: Create and track an order

1. Create an order from the frontend.
2. Note its ID or tracking number.
3. Inspect the MySQL shipment record.
4. Inspect its MongoDB tracking timeline.

### MySQL

```sql
USE logistics_db;

SELECT *
FROM shipments
ORDER BY id DESC
LIMIT 5;
```

### MongoDB

Replace `7` with the actual order ID:

```javascript
use logistics_db

db.order_tracking.findOne({ orderId: "7" })
```

This demonstrates:

- Current structured order state in MySQL
- Flexible event history and route details in MongoDB

---

## Demonstration 3: Prove persistence

1. Add a recognizable record.
2. Verify it in the database terminal.
3. Stop the application by closing its server window.
4. Run `start.bat` again.
5. Repeat the database query.

If the record remains, it proves the data is stored persistently rather than only in application memory.

---

# 🔍 Useful Inspection Commands

## MySQL quick reference

### Connect

```bat
mysql -u root -p
```

Enter the root password when prompted.

### Select the database

```sql
USE logistics_db;
```

### List databases and tables

```sql
SHOW DATABASES;
SHOW TABLES;
```

### Describe table structures

```sql
DESCRIBE users;
DESCRIBE warehouses;
DESCRIBE inventory;
DESCRIBE edges;
DESCRIBE shipments;
```

### Count records

```sql
SELECT COUNT(*) AS users FROM users;
SELECT COUNT(*) AS warehouses FROM warehouses;
SELECT COUNT(*) AS inventory_items FROM inventory;
SELECT COUNT(*) AS edges FROM edges;
SELECT COUNT(*) AS shipments FROM shipments;
```

### View recent records

```sql
SELECT * FROM users ORDER BY id DESC LIMIT 10;
SELECT * FROM warehouses ORDER BY id DESC LIMIT 10;
SELECT * FROM inventory ORDER BY id DESC LIMIT 10;
SELECT * FROM shipments ORDER BY id DESC LIMIT 10;
```

### Search inventory

```sql
SELECT * FROM inventory WHERE sku = 'TEACHER-DEMO-01';
SELECT * FROM inventory WHERE name LIKE '%Classroom%';
```

### Exit

```sql
EXIT;
```

---

## MongoDB quick reference

### Connect

```bat
mongosh
```

### Select the database

```javascript
use logistics_db
```

### List databases and collections

```javascript
show dbs
show collections
```

### Count documents

```javascript
db.activity_logs.countDocuments()
db.order_tracking.countDocuments()
db.inventory.countDocuments()
```

### View documents

```javascript
db.activity_logs.find().pretty()
db.order_tracking.find().pretty()
db.inventory.find().pretty()
```

### View recent activity

```javascript
db.activity_logs
  .find()
  .sort({ timestamp: -1 })
  .limit(10)
  .pretty()
```

### Search documents

```javascript
db.activity_logs.find({ action: /inventory/i }).pretty()
db.order_tracking.find({ status: "Delivered" }).pretty()
db.inventory.find({ quantity: { $gt: 0 } }).pretty()
```

### Exit

```javascript
exit
```

---

# 🛠️ Troubleshooting

## Check application/database health

With the backend running, open:

```text
http://localhost:3000/api/health
```

Both databases should report a connected status.

## MySQL reports offline or uses in-memory fallback

1. Open `services.msc`.
2. Start the MySQL service.
3. Check the values in `backend/.env`.
4. Restart `start.bat`.
5. Check `/api/health` again.

> When MySQL is unavailable, the application can use temporary in-memory data. Changes made in that mode disappear after restarting the backend.

## MongoDB does not connect

1. Open `services.msc`.
2. Start the MongoDB service.
3. Confirm `MONGO_URI=mongodb://localhost:27017` in `backend/.env`.
4. Restart the application.

## Port 3000 is already in use

Close the previous application command window or stop the existing Node.js process before running `start.bat` again.

---

# ⚠️ Important Notes

1. **Do not commit `backend/.env`.** It contains local database credentials.
2. Database terminals do not need to remain open.
3. MySQL and MongoDB services must be running before the backend connects to them.
4. The main inventory is stored in MySQL.
5. MongoDB's inventory collection is separate and only supports special buy/sell operations.
6. MongoDB activity logs provide evidence that application actions occurred.
7. Restarting the application does not delete properly persisted database records.
8. Avoid displaying passwords or secret configuration values during the classroom presentation.

---

## ✅ One-Minute Explanation for the Teacher

> This project uses two databases. MySQL is the primary relational database and stores structured records such as users, warehouses, inventory, route edges, and shipments. MongoDB stores flexible documents such as activity logs and detailed order-tracking timelines. The React frontend sends requests to the Express backend, and only the backend communicates with the databases. When an inventory item is added, its main record is stored in MySQL and an audit entry is stored in MongoDB. We can verify both records using the MySQL client and `mongosh`.
