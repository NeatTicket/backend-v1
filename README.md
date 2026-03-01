# 🎟️ NeatTicket - The Ultimate Venue & Event Powerhouse

NeatTicket is a premium, full-stack ecosystem designed for high-performance event discovery and management. Whether you're a **User** looking for the next big party, a **Venue Owner** showcasing a luxury space, or an **Organizer** managing complex logistics, NeatTicket provides a seamless, high-end experience.

Built with a stunning **Glassmorphism** aesthetic, the platform hides technical complexity behind a breathtaking, intuitive interface.

---

## � Running Everything at Once (Docker Strategy)

Stop wasting time installing Node, MongoDB, and dependencies manually. With one command, you can launch the **Backend API**, the **Frontend Client**, and the **Database** all at once.

### 🚀 Instant Launch
1. **Clone the Repo**.
2. **One Command to Rule Them All**:
   ```bash
   docker-compose up --build -d
   ```
3. **What happens?**
   - 📦 **MongoDB Container**: Boots up and handles your data.
   - ⚙️ **Backend Container**: Starts the Node.js server at `http://localhost:4000`.
   - 💻 **Frontend Container**: Launches the React client at `http://localhost:5173`.

### 🔗 Access Points
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **API Explorer**: [http://localhost:4000/api](http://localhost:4000/api)

---

## 🔥 Deep-Dive into Pro Features

NeatTicket isn't just a basic CRUD app; it's a feature-rich platform built for reality:

### 1. 🔔 Intelligent Notification System
Every critical action triggers a system-wide notification. Users aren't left guessing.
- **Approval Alerts**: When an admin approves your venue or event, you get an instant ping.
- **Rejection Logic**: If something is rejected, the user receives a notification with the **exact reason** provided by the admin.
- **Booking Confirmations**: Immediate feedback upon successful ticket purchases.
- **Real-time Counters**: A red badge on the header shows unread counts, ensuring no update is missed.

### 2. 🛡️ Role-Based Access Control (RBAC) & Security
- **4 Distinct Roles**: Admin, Event Organizer, Place Owner, and User.
- **Approval Workflow**: Organizers and Owners can't go live until an Admin verifies their identity, maintaining platform integrity.
- **Generic Login Errors**: We never leak if an account exists or not. "Invalid email or password" is our only answer to unsuccessful attempts.

### 3. 🎟️ Atomic Ticketing Engine
Our booking logic is "Race Condition Proof." 
- **Inventory integrity**: Even if 1,000 people click "Buy" at the same microsecond, our **Atomic MongoDB Increments** ensure we never sell more tickets than the venue capacity.
- **Unique Trackers**: Each ticket generates a unique code (e.g., `NT-X8K9L2`) for secure entry verification.

### 4. 📸 Multi-Media Atmosphere Galleries
Venues and Events are about vibes. 
- **Multi-Photo Upload**: High-performance image processing allows uploading multiple photos simultaneously.
- **Responsive Carousels**: Users can swipe through venue interiors or event posters in a premium, fluid gallery.

### 5. 📊 Admin Global Stats Dashboard
Admins get a "God View" of the entire system:
- **Live Metrics**: Total users, total tickets sold, and active venue counts.
- **User Management**: A centralized interface to approve operators or change roles with one click.

---

## 🔍 Code Architecture (The Engine Room)

### ⚙️ The Notification Utility
We built a fail-safe notification utility that never breaks the main execution flow.

```javascript
// utils/notify.js
const notify = async ({ userId, type, title, message, link }) => {
    try {
        // Creates a background record for the user's dashboard
        await Notification.create({ user: userId, type, title, message, link });
    } catch (err) {
        // Fail-safe: Errors here won't crash the main booking flow
        console.error("Notification Service Error", err.message);
    }
};
```

### 🎟️ The Atomic Booking Logic
Using MongoDB's `$expr` and `$inc` to handle heavy traffic without data corruption.

```javascript
// controllers/ticketsController.js
const event = await Event.findOneAndUpdate(
  {
    _id: eventId,
    // THE MAGIC: Check capacity AND current sold count in ONE atomic step
    $expr: { $lte: [{ $add: ["$ticketsSold", qty] }, "$maxTickets"] }
  },
  { $inc: { ticketsSold: qty } }, 
  { new: true }
);
```

---

## 🎨 Design Philosophy
- **Glassmorphism**: Elegant blur effects and transparency layers.
- **Micro-Animations**: Smooth transitions on hover, fade-in effects for cards, and loading skeletons.
- **Theme Engine**: Seamless toggle between Dark and Light modes using CSS variables.

---

## 🛠️ Tech Stack & Requirements
- **Runtime**: Node.js 20+
- **Database**: MongoDB (Local or Atlas)
- **Frontend**: React + Vite + SWR
- **Validation**: Joi (Strict schemas)
- **Auth**: JWT (8-hour sessions)

---

### � Manual Installation (Legacy)
If you don't use Docker:
1. `npm install` (root)
2. `cd client && npm install`
3. Set `.env` (MONGO_URL, JWT_SECRET, PORT)
4. `npm run dev` (root) & `cd client && npm run dev`
