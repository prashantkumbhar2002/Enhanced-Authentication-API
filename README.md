# Enhanced Authentication API
## Authentication API with Node.js

This project is an authentication API built with Node.js using Express.js, MongoDB (with Mongoose), and JWT for user authentication and authorization. It includes features such as user registration, login, OAuth login with Google, profile management, and admin privileges.

## Features

- User registration with avatar upload
- User login with email and password
- OAuth login using Google
- Refreshing access tokens with refresh tokens
- User profile management (update details, change password, update photo)
- User profile visibility settings (public or private)
- Admin functionality to view all user profiles
- Error handling and validation
- API documentation with Swagger

## Installation

1. **Clone the repository**
 ```bash
   git clone https://github.com/prashantkumbhar2002/Enhanced-Authentication-API.git
```

2. **Navigate to the project directory**
```bash
   cd authentication-api-node
```
3. **Install dependencies**
```bash
   npm install
```

4. **Set up environment variables**
Create a `.env` file in the root directory with the following variables:
  PORT=3000
  MONGO_URI=mongodb://localhost:27017/authentication
  JWT_SECRET=your_jwt_secret
  GOOGLE_CLIENT_ID=your_google_client_id

Replace `MONGO_URI`,` JWT_SECRET`, and `GOOGLE_CLIENT_ID` with your MongoDB URI, JWT secret key, and Google OAuth client ID, respectively.

5. **Start the server**
### Development Mode
```bash
  npm run dev
```

### Production Mode
```bash
  npm start
```

# API Documentation
After starting the server, you can access the API documentation at:
```bash
  http://localhost:3000/api-docs
```

This documentation is generated using Swagger and provides detailed information about the available endpoints and how to interact with them.

# Usage
1. **User Registration**
Register a new user by sending a `POST` request to:
```bash
  http://localhost:3000/api/v1/auth/register
```

2. **User Login**
Log in with email and password using a `POST` request to:
```bash
  http://localhost:3000/api/v1/auth/login
```

3. **Update User Profile**
Update the name, bio, and phone number of the authenticated user.
```bash
  http://localhost:3000/api/v1/users/updateAccount
```

4. **Update User Photo**
Update the photo/image of the authenticated user.
```bash
  http://localhost:3000/api/v1/users/avatar
```

5. **Update Profile visibility**
Toggle the visibility (public/private) of the authenticated user's profile.
```bash
  http://localhost:3000/api/v1/users/profile/visibility
```

6. **Change Password**
```bash
  http://localhost:3000/api/v1/auth/changePassword
```

7. **View User Profiles - For Admin Only**
It is accessible only to Admin users.
```bash
  http://localhost:3000/api/v1/users/profiles
```


# Admin Promotion Script
At the initial step we don't have any user as admin.
So, we can promote user as Admin by running following script: `seedAdminUser.js`

**Usage:**
From server root path:

```bash
  node src/private/promoteUserToAdmin.js <userEmail>
```
Please replace `userEmail` with the email address of the user you want to promote to admin.

**This script should be run only once to bootstrap the admin user. Make sure to keep this script secure and execute it in a controlled environment.**


### Thank you !