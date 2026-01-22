# Dento Backend V2

A comprehensive backend solution for dental clinic management, built with Node.js, Express, and Sequelize.

## Features

- **User Management**: Authentication, Roles (Admin/User), Profile Management.
- **Clinic Operations**: Patient Records, Appointment Scheduling, Visitor Tracking.
- **Treatment Protocols**: Detailed Treatment Plans, Prescriptions, Medical History.
- **Financial Ecosystem**: Billing, Transactions, Subscriptions, Payment Integration (Razorpay).
- **Analytics**: Reporting, Daily Activity Logs, Automated Notifications.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MySQL (via Sequelize ORM)
- **Caching**: Redis
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest & Supertest

## Getting Started

### Prerequisites

- Node.js & npm
- Docker & Docker Compose (optional but recommended)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/dp/dento-backend-v2.git
    cd dento-backend-v2
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    Copy `.env.example` to `.env` and update values.

4.  Start the application:
    ```bash
    npm start
    ```

### Docker Usage

```bash
docker-compose up --build
```

### Running Tests

```bash
npm test
```

## API Documentation

(Include API documentation link or details here)

## License

ISC
