# Movie Watchlist & Review App

This is a full-stack web application allowing users to search for movies, maintain a personal watchlist, and write/manage movie reviews. It features a dark themed frontend built with React and a backend API built with Node.js and Express.

## Features

**Core:**
*   **Movie Search:** Search for movies using the OMDB API.
*   **User Authentication:** Secure user registration and login using JWT.
*   **Movie Reviews:** Create, read, update, and delete personal movie reviews.
*   **Community Reviews:** View reviews submitted by other users for any movie.
*   **Watchlist Management:** Add movies to and remove movies from a personal watchlist.

**Frontend:**
*   **Modern UI:** Clean, professional, dark-themed user interface built with React and Tailwind CSS.
*   **User Dashboard:** Personalized welcome page showing recent activity, top-rated movie, and watchlist suggestion.
*   **SPA Navigation:** Smooth navigation between pages using React Router.
*   **Dynamic Updates:** Real-time UI updates when adding/removing from watchlist or deleting reviews (no full page reloads).
*   **Loading & Error States:** Clear feedback to the user during data fetching or when errors occur.
*   **Responsive Design:** Adapts to different screen sizes (basic responsiveness via Tailwind).

**Backend:**
*   **JWT Authentication:** Secure API endpoints requiring user login.
*   **Database Integration:** Uses MySQL and Sequelize ORM for data persistence (Users, Movies, Reviews, Watchlist).
*   **RESTful API:** Well-defined API endpoints for managing resources.
*   **Movie Data Handling:** Ensures movie data is stored locally when reviewed or added to a watchlist.

## Tech Stack

**Frontend:**
*   **React:** JavaScript library for building user interfaces.
*   **React Router:** For declarative routing within the SPA.
*   **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
*   **Axios:** Promise-based HTTP client for making API requests.

**Backend:**
*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **Sequelize:** Promise-based Node.js ORM for MySQL.
*   **MySQL:** Relational database management system.
*   **JSON Web Token (JWT):** For generating and verifying authentication tokens.
*   **bcryptjs:** For hashing user passwords.
*   **Dotenv:** For managing environment variables.

## Prerequisites

*   Node.js (v14 or later recommended)
*   npm or yarn
*   MySQL Server installed and running
*   Git

## Setup and Installation

Follow these steps to set up the project locally:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/thinkslip/movie-app.git
    cd movie-app
    ```

2.  **Backend Setup:**
    *   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    *   Install backend dependencies:
        ```bash
        npm install
        # or
        yarn install
        ```
    *   Create a `.env` file in the backend directory (or project root if no separate folder) and add the following environment variables:
        ```dotenv
        # .env (Backend)
        PORT=5000
        JWT_SECRET=your_jwt_secret_key # Use a long, random string
        DB_HOST=localhost
        DB_USER=your_mysql_username # e.g., root
        DB_PASS=your_mysql_password
        DB_NAME=movie_app_db # Choose a database name
        OMDB_API_KEY=your_omdb_api_key # Get from http://www.omdbapi.com/apikey.aspx
        ```
    *   **Database Setup:**
        *   Make sure your MySQL server is running.
        *   Connect to MySQL and create the database specified in `DB_NAME`:
            ```sql
            CREATE DATABASE movie_app_db;
            ```
        *   Run database migrations (if you have migration files setup with Sequelize CLI):
            ```bash
            # If using Sequelize CLI
            npx sequelize-cli db:migrate
            ```
            *(If you don't have migrations, the initial `npm start` might sync models if configured)*
        *   (Optional) Run database seeders (if you have seeder files):
            ```bash
            # If using Sequelize CLI
            npx sequelize-cli db:seed:all
            ```

3.  **Frontend Setup:**
    *   Navigate to the frontend directory:
        ```bash
        cd frontend
        ```
    *   Install frontend dependencies:
        ```bash
        npm install
        # or
        yarn install
        ```
    *   Create a `.env` file in the `frontend` directory:
        ```dotenv
        # client/.env (Frontend)

        # IMPORTANT: Variable MUST start with REACT_APP_ for Create React App
        REACT_APP_OMDB_API_KEY=your_omdb_api_key # Same OMDB key as backend


## Running the Application

You need to run both the backend server and the frontend development server.

1.  **Start the Backend Server:**
    *   Open a terminal in the `backend` directory.
    *   Run:
        ```bash
        npm start
        # or (if you have a dev script)
        # npm run dev
        ```
    *   The API server should now be running (usually on `http://localhost:5000`).

2.  **Start the Frontend Development Server:**
    *   Open a *separate* terminal in the `frontend` directory.
    *   Run:
        ```bash
        npm start
        # or
        # yarn start
        ```
    *   This will typically open the application in your browser at `http://localhost:3000`.


## API Endpoints

The backend provides the following API endpoints (most require `Authorization: Bearer <token>` header):

*   **Authentication**
    *   `POST /auth/signup`: Register a new user.
    *   `POST /auth/login`: Log in an existing user, returns JWT token.
*   **Users**
    *   `GET /users/me`: Get details for the currently logged-in user.
*   **Movies**
    *   `GET /movies/:id` or `/movies/:imdbID`: Get details for a specific movie stored locally *(Endpoint assumed by Reviews page logic)*.
    *   `POST /movies/ensure`: Ensures a movie exists in the local DB (creates if not found), often used before adding reviews/watchlist items.
*   **Reviews**
    *   `GET /reviews/:movieId`: Get all reviews for a specific movie ID (e.g., imdbID).
    *   `GET /reviews/me`: Get all reviews written by the logged-in user.
    *   `POST /reviews`: Add a new review for a movie.
    *   `PUT /reviews/:id`: Update a specific review owned by the logged-in user.
    *   `DELETE /reviews/:id`: Delete a specific review owned by the logged-in user.
*   **Watchlist**
    *   `GET /watchlist`: Get the logged-in user's watchlist.
    *   `POST /watchlist`: Add a movie to the logged-in user's watchlist.
    *   `DELETE /watchlist/:id`: Remove a specific entry (by watchlist entry ID) from the logged-in user's watchlist.


## Environment Variables Explained

*   **Backend (`backend/.env`)**
    *   `PORT`: Port the backend server will run on (e.g., 5000).
    *   `JWT_SECRET`: **Critical** secret key used to sign and verify JWT tokens. Keep this private and secure.
    *   `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`: Standard MySQL connection details.
    *   `OMDB_API_KEY`: Your personal API key for the OMDB service.
*   **Frontend (`frontend/.env`)**
    *   `REACT_APP_OMDB_API_KEY`: The same OMDB API key, accessible by the frontend React code (prefix `REACT_APP_` is required by Create React App).

---