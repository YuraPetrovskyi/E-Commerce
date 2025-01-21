# E-Commerce Project

## Overview
This E-Commerce application is a versatile online shopping platform built with a modern tech stack. It offers a range of features including user authentication, product browsing, a shopping cart, order management, and a payment gateway integrated with Stripe in test mode. Initially deployed on Render with PostgreSQL, the application was later adapted for Hostinger with MySQL.

<p align="center">
  <img src="/frontend/public/images/ecommerce.jpg" alt="Application Screenshot" width="200"/>
  <img src="/frontend/public/images/ecommerce1.jpg" alt="Application Screenshot" width="300"/>
  <img src="/frontend/public/images/ecommerce2.jpg" alt="Application Screenshot" width="300"/>
</p>

### Features
1. **User Authentication and Authorization**
   - Login and registration with JWT and Passport.
   - Google OAuth for easy access.
2. **Shopping Experience**
   - Browse and view detailed product pages.
   - Add products to the cart and manage quantities.
   - Checkout functionality with order tracking.
3. **Payment Integration**
   - Stripe integration in test mode for secure transactions.
4. **Database Compatibility**
   - PostgreSQL support (for Render).
   - MySQL support (for Hostinger).

### Technologies Used
- **Frontend:** React, React Router, Context API.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL, MySQL.
- **Authentication:** Passport.js, JWT, Google OAuth.
- **Payments:** Stripe.
- **Hosting:** Render, Hostinger.
- **Environment Management:** dotenv.

---

## Getting Started
Follow these steps to set up and run the project locally or on a server.

### Prerequisites
- Node.js
- PostgreSQL or MySQL
- A configured `.env` file with required variables
- It is recommended to first run the application locally and populate the database with appropriate data.
- To create the database, use the commands provided in the `.txt` files in the `db` folder.
- Database connection is configured using `pool.js` in the `db` folder. This can be a local PostgreSQL database, a database hosted on Render, or MySQL. Configure the connection using the `.env` file.

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd e-commerce
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the environment variables:
   - Create `.env` files for the server and frontend based on the `.env-example` file provided below.

4. Run the server:
   ```bash
   npm run test
   ```
   The application will start on the server.

5. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

### Deployment
To deploy on Render or Hostinger, configure your `.env` file with the respective database credentials and server URLs.

---

## Environment Variables
Below is the `.env-example` file template.

### Backend `.env-example`
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SECRET=any-random-string-of-characters
USER=your-database-user
PASSWORD=your-database-password

# Stripe
SECRET_KEY=your-stripe-secret-key
WEB_HOOK_SECRET=your-webhook-secret

# Server Configuration
SERVER_HOST=http://localhost:3000
WEB_APP_URL=http://localhost:3001
WEB_APP_URL_REDIRECT_GOOGLE=http://localhost:3001/auth/google/callback

# Database Configuration (PostgreSQL or MySQL)
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=your-db-name
DB_TYPE=mysql  # or postgres

# JWT
JWT_SECRET=your-jwt-secret

# Email - for sending emails to customers using Nodemailer
EMAIL_SEND_NAME=your-email-name
EMAIL_SEND_PASSWORD=your-email-app-password
```

### Frontend `.env-example`
```env
REACT_APP_PUBLISHABLE_KEY=your-stripe-publishable-key
REACT_APP_SERVER_HOST=http://localhost:3000  or https://e-commerce-...qw.onrender.com
```

---

## Important Notes
- Ensure `.env` files are kept private and never shared publicly.
- Use secure credentials for your database, Google OAuth, and Stripe integrations.
- Replace placeholders in `.env-example` with actual values relevant to your environment.

For more details or contributions, please refer to the project repository or contact the developer.

This is a learning project where I practiced using various technologies and integrations. Therefore, you may find commented-out code as I plan to experiment further in the future. :)
