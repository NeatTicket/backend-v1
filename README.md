# NeatTicket

NeatTicket is a premium, full-stack event and venue management platform designed to provide a seamless experience for users looking to discover events, organizers managing their productions, and venue owners showcasing their spaces.

Built with modern technologies and a striking "Glassmorphism" aesthetic, NeatTicket ensures that the technical complexity of booking and managing tickets is hidden behind a beautiful, intuitive interface.

---

## 🚀 Vision
The project bridges the gap between digital convenience and real-world experiences. Whether it's a concert, a workshop, or a private lounge, NeatTicket provides the infrastructure for:
- **Discovery**: Users find the best events around them with advanced search and filters.
- **Organization**: Event organizers manage attendees, ticket sales, and venue availability.
- **Hosting**: Venue owners monetize and manage their physical spaces with multi-photo galleries.
- **Administration**: A centralized dashboard for user management, global oversight, and approval workflows.

---

## � Docker Setup (Recommended)

You can run the entire NeatTicket stack (Frontend, Backend, and MongoDB) without installing dependencies locally:

1. **Start the containers**:
   ```bash
   docker-compose up --build -d
   ```

2. **Access the application**:
   - **Web Interface**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)

---

## ✨ Key Features

### 1. Secure Multi-Role Authentication
Four distinct roles with tailored permissions and **Generic Security** (no user enumeration on login):
- **User**: Search, discover, and book tickets.
- **Place Owner**: Add and manage venues (requires admin approval).
- **Event Organizer**: Create events, select venues, and track sales (requires admin approval).
- **Admin**: Approve/Reject venues and events, manage users, and view global statistics.

### 2. Dynamic Venue & Event Management
- **Multi-Photo Galleries**: Every venue and event can showcase its atmosphere with high-quality image carousels.
- **Approval Workflow**: Ensuring quality and security through a manual review process.
- **Availability Check**: Organizers can only book venues that aren't already hosting other events on the same date.

### 3. Intelligent Ticketing System
- **Atomic Booking**: Prevention of "over-selling" tickets through atomic MongoDB operations.
- **Unique Ticket Generation**: Every ticket generates a unique, trackable code (QR-ready).
- **Check-In System**: Organizers can mark tickets as "used" to prevent double entry.

### 4. Integrated Notification Center
Users receive real-time updates regarding their account status, ticket bookings, and approval/rejection of their submitted venues or events.

### 5. Advanced Administration & Stats
- **Global Overview**: Admins can see total users, active venues, and revenue stats (if applicable).
- **User Management**: Approve organizers and place owners to ensure platform quality.

---

## 🔍 Feature Deep-Dive (Code Snippets)

### 🛡️ Generic Login Security
To prevent user enumeration, we use generic error messages for both non-existent users and incorrect passwords.

```javascript
// services/authService.js
static async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid email or password", 401);
    }
    // ...
}
```

### 🎟️ Atomic Ticket Booking (Race Condition Security)
To prevent two users from buying the last ticket simultaneously, we use a single MongoDB operation to check availability and increment the count in one step.

```javascript
// controllers/ticketsController.js
const event = await Event.findOneAndUpdate(
  {
    _id: eventId,
    $expr: { $lte: [{ $add: ["$ticketsSold", qty] }, "$maxTickets"] }
  },
  { $inc: { ticketsSold: qty } },
  { new: true }
);

if (!event) {
  return next(new AppError("Not enough tickets available", 400));
}
```

---

## 🎨 UI Aesthetics
NeatTicket uses a custom-built design system with brand new **NeatTicket Logo**:
- **Glassmorphism**: Using `backdrop-filter: blur()` and semi-transparent backgrounds for a premium feel.
- **Dynamic Theming**: Support for both Dark and Light modes using CSS variables.
- **Premium Branding**: Custom favicon and global site title.

---

## 🛠️ Manual Installation (Development)

1. **Install Dependencies**:
   ```bash
   npm install
   cd client && npm install
   ```

2. **Environment Configuration**:
   Create a `.env` in the root with your MongoDB credentials and JWT secrets.

3. **Run**:
   - Backend: `npm run dev`
   - Frontend: `cd client && npm run dev`
