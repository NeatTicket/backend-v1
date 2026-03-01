# NeatTicket

Backend API for users, places, events, and ticket booking, plus a React GUI to test the API.

## Stack
- Node.js + Express + MongoDB (backend)
- React + Vite (test GUI)

## Requirements
- Node.js 18+
- MongoDB

## Setup
1. Install backend dependencies:
```bash
npm install
```
2. Create `.env` in the project root:
```env
MONGO_URL=mongodb://localhost:27017/neatticket
JWT_SECRET=your-secret-key
PORT=4000
```
3. Start backend:
```bash
npm run dev
```

## React GUI
1. Open client folder:
```bash
cd client
```
2. Install client dependencies:
```bash
npm install
```
3. Start client:
```bash
npm run dev
```
4. Open `http://localhost:5173`.

## Main Features
- Auth with JWT (`register`, `login`)
- Profile management
- User admin controls (approve + role assignment)
- Place creation and management with search + pagination
- Event creation and management with search/filter/sort + pagination
- Ticket booking and cancellation
- Admin overview statistics endpoint
- React test console for end-to-end manual testing

## API Summary
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Users
- `GET /api/users` (admin)
- `GET /api/users/:userId` (admin or owner)
- `POST /api/users` (admin)
- `PATCH /api/users/:userId/role` (admin)
- `PATCH /api/users/:userId` (admin or owner)
- `DELETE /api/users/:userId` (admin)
- `POST /api/users/:userId/upload` (admin or owner)
- `PATCH /api/users/:userId/approve` (admin)

### Profile
- `GET /api/profile`
- `PUT /api/profile`

### Places
- `GET /api/places`
- `GET /api/places/:placeId`
- `POST /api/places` (approved `place_owner` or `admin`)
- `PATCH /api/places/:placeId` (owner)
- `DELETE /api/places/:placeId` (owner)

### Events
- `GET /api/events`
- `GET /api/events/:eventId`
- `POST /api/events` (`event_organizer` or `admin`)
- `PATCH /api/events/:eventId` (organizer)
- `DELETE /api/events/:eventId` (organizer)

### Tickets
- `GET /api/tickets/me`
- `POST /api/tickets/events/:eventId`
- `DELETE /api/tickets/:ticketId`

### Stats
- `GET /api/stats/overview` (admin)

