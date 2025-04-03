# Movie App

This a movie review application which allows users to create accounts, review movies, and manage watchlists

---

## Features
- User authentication (JWT-based)
- CRUD operations for movies, reviews, and watchlists
- Role-based authorization (admin features)
- MySQL database integreation with Sequelize ORM

---

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/thinkslip/movie-app.git
   cd movie-app

2. Install dependencies
   npm install

3. Create a .env file and add:
   PORT=5000
   JWT_SECRET=your_secret_key
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=movie_app
   OMDB_API_KEY=your_omdb_api_key

4. Start the server:
   npm start

---

## API Endpoints

### Authentication
- **POST** `/auth/register` - Register a user
- **POST** `/auth/login` - Login a user

### Movies
- **GET** `/movies` - Get all movies
- **POST** `/movies` - Add a movie (admin only)

### Reviews
- **POST** `/reviews` - Add a review
- **GET** `/reviews/:movieId` - Get reviews for a movie
- **GET** `/reviews/me` - Get all reviews by the logged-in user
- **DELETE** `/reviews/:id` - Delete user's review

---

## Technologies Used

- **Node.js** - JavaScript runtime used to build the backend.
- **Express.js** - Web framework for building the API.
- **Sequelize** - ORM for interacting with the MySQL database.
- **MySQL** - Relational database used to store movie data, reviews, and user information.
- **JWT (JSON Web Tokens)** - Used for authentication and securing API routes.
- **Postman** - Tool for testing API endpoints.