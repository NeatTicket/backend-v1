# Neat Ticket

## Introduction
This project is part of an event and place management system. It includes an API for managing users, places, and events.

## Requirements
- Node.js
- MongoDB

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/username/backend-v1.git
    cd backend-v1
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    - Create a `.env` file in the root directory of the project and add the following variables:
        ```env
        MONGO_URL=mongodb://localhost:27017/your-database-name
        JWT_SECRET=your-secret-key
        PORT=4000
        ```

## Running the Server




To start the server, use the following command:
```bash
npm start
```

## Routes
### Authentication
- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Login a user

### Users
- **GET /api/users**: Get all users (admin only)
- **GET /api/users/:userId**: Get a specific user by ID (admin or the user themselves)
- **POST /api/users**: Create a new user (admin only)
- **PATCH /api/users/:userId/role**: Update a user's role by ID (admin only)
- **PATCH /api/users/:userId**: Update a user's details by ID (admin or the user themselves)
- **DELETE /api/users/:userId**: Delete a user by ID (admin only)
- **POST /api/users/:userId/upload**: Upload a profile image for a user (user themselves only)
- **PATCH /api/users/:userId/approve**: Approve a user by ID (admin only)

### Places
- **GET /api/places**: Get all places
- **GET /api/places/:placeId**: Get a specific place by ID
- **POST /api/places**: Create a new place (approved users with the role "place_owner" only)
- **PATCH /api/places/:placeId**: Update a place by ID (owner only)
- **DELETE /api/places/:placeId**: Delete a place by ID (owner only)

### Events
- **GET /api/events**: Get all events
- **GET /api/events/:eventId**: Get a specific event by ID
- **POST /api/events**: Add a new event (approved users with the role "event_organizer" only)
- **PATCH /api/events/:eventId**: Update an event by ID (organizer only)
- **DELETE /api/events/:eventId**: Delete an event by ID (organizer only)

### Profile
- **GET /api/profile**: Get the authenticated user's profile
- **PUT /api/profile**: Update the authenticated user's profile

## Contribution
If you would like to contribute to this project, please open a pull request or create a new issue.


## FAQ
### How do I register a new user?
- Send a POST request to /api/auth/register with the user's details.

### How do I create a new place?
- Send a POST request to /api/places with the place's details.
- Make sure you are authenticated and have the role "place_owner".

