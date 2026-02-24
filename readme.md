# BorderlessEDU Backend API

A Node.js/Express backend for the BorderlessEDU platform, providing APIs for students, consultants, and admins to manage profiles, applications, messaging, payments, and more.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Health](#health)
  - [Global (OTP)](#global-otp)
  - [Student](#student)
  - [Consultant](#consultant)
  - [Admin](#admin)
- [Schemas/Models](#schemasmodels)
- [Services](#services)
- [Validation](#validation)
- [Middleware](#middleware)
- [Utils](#utils)
- [Testing](#testing)

## Features

- User authentication (Student, Consultant, Admin) with JWT
- Profile management for all user types
- Student applications and document uploads
- Consultant contact and messaging system
- Room-based chat between students and consultants/admins
- Admin management of programs, faculties, departments, students
- Stripe payment integration for consultants (subscription-based)
- Email notifications
- Soft delete with restore for admin resources

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Payments**: Stripe
- **Email**: SMTP (Gmail)
- **Validation**: Joi
- **File Storage**: AWS S3 (configured)

## Installation

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd borderlessEDU/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables)).

4. Start the server:
   ```bash
   npm run dev  # Development mode
   # or
   npm start    # Production mode
   ```

Server runs on `http://localhost:4000` by default.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
NODE_ENV=development
PORT=4000

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=24h

# Frontend URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=http://localhost:3000/dashboard
STRIPE_CANCEL_URL=http://localhost:3000/dashboard

# AWS (if using S3)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET=...
```

## API Endpoints

All endpoints return JSON responses with `success`, `message`, and `data` fields. Authentication uses Bearer tokens in the `Authorization` header.

### Health

- `GET /api/health` - Check server health

### Global (OTP)

- `POST /api/otp/send` - Send OTP to email
- `POST /api/otp/verify` - Verify OTP code

### Student

Base path: `/api/student`

#### Auth

- `POST /auth/signup` - Register student
- `POST /auth/signin` - Login student

#### Profile

- `GET /profile/getprofile/:email` - Get student profile by email (JWT required)
- `POST /profile/updateprofile` - Update student profile (JWT required, uses req.user.email)

#### Application

- `POST /application` - Create application
- `GET /application` - List student's applications
- `GET /application/:id` - Get application by ID

#### Documents

- `POST /documents` - Upload/add document URL
- `GET /documents` - List student's documents
- `PUT /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document

#### Saved Programs

- `POST /saved` - Add program to saved
- `GET /saved` - List saved programs
- `DELETE /saved/:programId` - Remove from saved

#### Consultant Contact

- `POST /contact` - Contact a consultant
- `GET /contact` - List contacted consultants

#### Messages

- `POST /messages` - Send message
- `GET /messages/rooms` - List conversation rooms
- `GET /messages/room/:id/messages` - Get messages in a room

### Consultant

Base path: `/api/consultant`

#### Auth

- `POST /auth/signup` - Register consultant
- `POST /auth/signin` - Login consultant (includes payment status)

#### Profile

- `GET /profile/getprofile/:email` - Get consultant profile by email (JWT required)
- `POST /profile/updateprofile` - Update consultant profile (JWT required, uses req.user.email)

#### Contact

- `GET /contact` - List contacts from students
- `PUT /contact/:id` - Respond to contact

#### Messages

- `POST /messages` - Send message
- `GET /messages/rooms` - List conversation rooms
- `GET /messages/room/:id/messages` - Get messages in a room

#### Payment

- `POST /payment/trial` - Start 7-day free trial
- `POST /payment/checkout-session` - Create Stripe checkout session
- `POST /payment/webhook` - Stripe webhook (raw body)
- `GET /payment/status` - Get payment status

### Admin

Base path: `/api/admin`

#### Auth

- `POST /auth/signup` - Register admin
- `POST /auth/signin` - Login admin

#### Profile

- `GET /profile/getprofile/:email` - Get admin profile by email (JWT required)
- `POST /profile/updateprofile` - Update admin profile (JWT required, uses req.user.email)

#### Programs

- `POST /program` - Create program
- `GET /program` - List programs
- `GET /program/:id` - Get program by ID
- `PUT /program/:id` - Update program
- `DELETE /program/:id` - Delete program (moves to DeletedProgram)
- `PATCH /program/:id/status` - Update program status
- `POST /program/:id/restore` - Restore deleted program

#### Faculty

- `POST /faculty` - Create faculty
- `GET /faculty` - List faculties
- `GET /faculty/:id` - Get faculty by ID
- `PUT /faculty/:id` - Update faculty
- `DELETE /faculty/:id` - Delete faculty (moves to DeletedFaculty)
- `POST /faculty/:id/restore` - Restore deleted faculty

#### Department

- `POST /department` - Create department
- `GET /department` - List departments
- `GET /department/:id` - Get department by ID
- `PUT /department/:id` - Update department
- `DELETE /department/:id` - Delete department (moves to DeletedDepartment)
- `POST /department/:id/restore` - Restore deleted department

#### Student Management

- `GET /student` - List students
- `GET /student/:id` - Get student profile with applications

#### Application Management

- `GET /application` - List all applications
- `GET /application/:id` - Get application by ID
- `PUT /application/:id` - Update application

#### Messages

- `POST /messages` - Send message to student/consultant
- `GET /messages/rooms` - List conversation rooms
- `GET /messages/room/:id/messages` - Get messages in a room

## Schemas/Models

### Admin

- `Admin` - Admin users
- `Profile` - Admin profiles
- `Program` - Programs
- `Faculty` - Faculties
- `Department` - Departments
- `DeletedProgram`, `DeletedFaculty`, `DeletedDepartment` - Soft deleted items

### Consultant

- `Consultant` - Consultant users
- `Profile` - Consultant profiles
- `Contact` - Student contacts to consultants
- `Payment` - Consultant payment records
- `Message` - Messages
- `Room` - Conversation rooms

### Student

- `Student` - Student users
- `Profile` - Student profiles
- `Application` - Student applications
- `Documents` - Student uploaded documents
- `SavedPrograms` - Saved programs

### Global

- `OTP` - OTP records

## Services

- `MongoService` - Wrapper for MongoDB operations (create, find, update, etc.)
- `JwtService` - JWT token generation/verification
- `EmailService` - SMTP email sending
- `StripeService` - Stripe API integration (customers, checkout, webhooks)

## Validation

- `auth.js` - Login/signup validation
- `profile.js` - Profile update validation
- `program.js` - Program validation
- `admin/faculty.js` - Faculty validation
- `consultant/message.js` - Message validation
- `student/application.js` - Application validation
- etc.

All validations use Joi schemas.

## Middleware

- `JWT.js` - Verifies JWT tokens and sets `req.user`

## Utils

- `Response.js` - Standardized API responses
- `Message.js` - Message constants
- `Helper.js` - Utility functions

## Testing

Run tests with:

```bash
npm test
```

For manual testing, use tools like Postman or curl. Ensure MongoDB and Stripe are configured.

Example curl for health check:

```bash
curl http://localhost:4000/api/health
```
