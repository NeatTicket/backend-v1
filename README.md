# NeatTicket

A premium event management and venue booking platform designed for seamless interaction between users, event organizers, and venue owners.

## Latest Updates

- Venue deep links: sharing a venue now copies a direct link in the format `/places/:id`.
- Dedicated venue details route: opening venue details now uses a standalone page at `/places/:id`.
- Event card UX: clicking the event image now opens the event details page directly.
- Venue-to-event flow: from venue details, users can start creating an event at that venue. Only `event_organizer` and `admin` are allowed; others receive a clear authorization error.

## Core Features

### Role-Based Access Control
The platform implements a sophisticated multi-role system (Admin, Event Organizer, Place Owner, and Regular User), each with a dedicated dashboard and specific permissions.

### Admin Governance & Moderation
Admins have global visibility across the platform, including:
- Provider Review: A centralized dashboard to verify and approve new organizers and venue owners.
- Content Moderation: Ability to monitor and delete any event or venue across the platform to ensure quality and security.
- Global Activity Centers: Dedicated views to manage the entire platform ecosystem distinct from personal actions.

### Search & Discovery
- Integrated Global Search: A high-performance search bar with optional category filters (Events, Venues, Providers) to find specific items instantly.
- Intelligent Filtering: Real-time results across all views, including moderation tables and discovery grids.
- XSS Security: Advanced input sanitization and React-based data binding to prevent cross-site scripting attacks.

### Venue Management
- Venue Ownership: Owners can create and manage multiple venues with detailed descriptions and images.
- Availability Logic: Integrated system to check venue availability before booking events.
- Owner Branding: Direct visibility of venue owners in administration views for better accountability.

### Event Organization
- Event Lifecycle: Full CRUD operations for organizers to manage their personal events.
- Approval Workflow: Events go through a verification queue before becoming public, manageable by administrators.
- Ticket Integration: Automated ticket generation and check-in system for attendees.

### Premium Experience
- Theme Support: Full Dark and Light mode compatibility with a persistent glassmorphism UI.
- Real-time Notifications: Instant alerts for approvals, rejections, and new bookings.
- Responsive Design: Optimized for all device sizes with modern animations and micro-interactions.

## Technology Stack
- Frontend: React.js with SWR for state management, Axios for API communication, and Vite as the bundler.
- Backend: Node.js and Express.js REST API.
- Database: MongoDB with Mongoose ODM.
- Security: JWT-based authentication and role-gated middleware.

## Getting Started

### Local Development (Manual Setup)

#### 1. Backend Setup
Navigate to the root directory and install dependencies:
```bash
npm install
```
Create a `.env` file in the root directory and add the required environment variables:
```
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=4000
```
Start the backend server:
```bash
npm run dev
```

#### 2. Frontend Setup
Open a new terminal and navigate to the `client` directory:
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory:
```
VITE_API_URL=http://localhost:4000/api/v1
```
Start the frontend development server:
```bash
npm run dev
```

### Running with Docker

You can easily run both the frontend, backend, and MongoDB database using Docker Compose. This starts everything with a single command.

1. Ensure you have Docker and Docker Compose installed on your system.
2. From the root directory of the project, run:
```bash
docker-compose up -d --build
```
3. The application will be accessible at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

To stop the containers, run:
```bash
docker-compose down
```

## Deployment to Vercel

The project is structured to be easily deployed to Vercel. Both the frontend and backend have their respective `vercel.json` configurations.

### 1. Deploy the Backend
1. Go to your Vercel dashboard and click "Add New" -> "Project".
2. Import your GitHub repository.
3. In the "Configure Project" step:
   - Leave the Framework Preset as "Other".
   - Set the Root Directory to the root of your project (where the backend `app.js` is located).
   - Add your Environment Variables (`MONGO_URL`, `JWT_SECRET`).
4. Click Deploy. Once deployed, note the production URL of your backend.

### 2. Deploy the Frontend
1. Go to your Vercel dashboard and add another new project from the same repository.
2. In the "Configure Project" step:
   - Set the Framework Preset to "Vite".
   - Set the Root Directory to `client`.
   - Add the Environment Variable `VITE_API_URL` and set its value to your newly deployed backend URL (e.g., `https://your-backend-url.vercel.app/api/v1`).
3. Click Deploy.

Your NeatTicket platform is now live!
