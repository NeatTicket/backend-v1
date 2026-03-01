# NeatTicket

NeatTicket is a premium, full-stack event and venue management platform designed to provide a seamless experience for users looking to discover events, organizers managing their productions, and venue owners showcasing their spaces.

Built with modern technologies and a striking "Glassmorphism" aesthetic, NeatTicket ensures that the technical complexity of booking and managing tickets is hidden behind a beautiful, intuitive interface.

---

## 🚀 Vision
The project bridges the gap between digital convenience and real-world experiences. Whether it's a concert, a workshop, or a private lounge, NeatTicket provides the infrastructure for:
- **Discovery**: Users find the best events around them.
- **Organization**: Event organizers manage attendees and logistics.
- **Hosting**: Venue owners monetize and manage their physical spaces.
- **Administration**: A centralized dashboard for global oversight.

---

## 🛠️ Technology Stack
- **Backend**: Node.js, Express, MongoDB with Mongoose.
- **Validation**: Joi (providing robust, schema-based data integrity).
- **Authentication**: JWT (JSON Web Tokens) with role-based access control.
- **Frontend**: React + Vite, powered by SWR for efficient state management and data fetching.
- **UI/UX**: Custom CSS with CSS Variables for theme support (Light/Dark mode), smooth micro-animations, and glassmorphism.
- **Media**: Robust multi-photo upload system via Multer.

---

## ✨ Key Features

### 1. Secure Multi-Role Authentication
Four distinct roles with tailored permissions:
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

---

## 🔍 Feature Deep-Dive (Code Snippets)

### 📸 Multi-Photo Upload Logic
Both venues and events support multiple images. This is handled by a robust Multer configuration and a dedicated database schema.

```javascript
// models/Place.js Snippet
const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{ type: String }], // Array of strings to store multiple image paths
  location: { type: String, required: true },
  // ... other fields
});

// controllers/placesController.js Snippet
const handleSavePlace = async (req, res) => {
    const images = req.files ? req.files.map(file => `/uploads/places/${file.filename}`) : [];
    const placeData = { ...req.body, images };
    // Logic to save or update place...
};
```

### 🛡️ Robust Validation with Joi
We switched from simple validators to **Joi** to ensure complex data structures are always valid before hitting the database.

```javascript
// validators/authValidator.js
const registerValidation = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/) // Complex password requirement
    .required(),
  role: Joi.string().valid('user', 'place_owner', 'event_organizer', 'admin')
});
```

---

## 🧠 Business Logic (Behind the Scenes)

### 🎟️ Atomic Ticket Booking (Race Condition Security)
To prevent two users from buying the last ticket simultaneously, we use a single MongoDB operation to check availability and increment the count in one step.

```javascript
// controllers/ticketsController.js
const event = await Event.findOneAndUpdate(
  {
    _id: eventId,
    // Condition: Check if current ticketsSold + requested quantity is <= maxTickets
    $expr: { $lte: [{ $add: ["$ticketsSold", qty] }, "$maxTickets"] }
  },
  { $inc: { ticketsSold: qty } }, // Atomically increment sold count
  { new: true }
);

if (!event) {
  return next(new AppError("Not enough tickets available", 400));
}
```

### 🔔 Automated Notifications
The system proactively informs users about the status of their requests.

```javascript
// utils/notify.js
const notify = async ({ userId, type, title, message, link }) => {
    try {
        await Notification.create({ user: userId, type, title, message, link });
    } catch (err) {
        console.error("Notification failed", err.message);
    }
};

// Usage in place approval:
await notify({
  userId: place.owner,
  type: 'approval',
  title: 'Venue Approved!',
  message: `Your venue "${place.name}" has been approved.`,
  link: '/my_venues'
});
```

---

## 🎨 UI Aesthetics
NeatTicket uses a custom-built design system:
- **Glassmorphism**: Using `backdrop-filter: blur()` and semi-transparent backgrounds for a premium feel.
- **Dynamic Theming**: Support for both Dark and Light modes using CSS variables.
- **Interactivity**: Smooth CSS transitions and hover effects on every card and button.

---

## 🛠️ Setup & Installation

1. **Clone & Install**:
   ```bash
   npm install
   cd client && npm install
   ```

2. **Environment Configuration**:
   Create a `.env` in the root with:
   ```env
   MONGO_URL=your_mongodb_url
   JWT_SECRET=your_jwt_secret
   PORT=4000
   ```

3. **Run**:
   - Backend: `npm run dev`
   - Frontend: `cd client && npm run dev`
