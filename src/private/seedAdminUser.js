/*
This script should be run only once to bootstrap the admin user. 
Make sure to keep this script secure and execute it in a controlled environment.
*/

import mongoose from 'mongoose';
import { User } from '../models/user.models.js';
import dotenv from 'dotenv';
dotenv.config();

async function promoteUserToAdmin(userEmail) {
  try {
    await mongoose.connect(`${process.env.MONGOURI}/${process.env.DB_Name}`);
    const user = await User.findOne({ email: userEmail });
    console.log(userEmail)
    if (!user) {
      console.log(`User with email ${userEmail} not found.`);
      return;
    }
    user.isAdmin = true;
    await user.save();

    console.log(`User ${userEmail} promoted to admin successfully.`);
  } catch (error) {
    console.error('Error promoting user to admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Usage: node src/private/promoteUserToAdmin.js <userEmail>
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Usage {From server root path}: node src/private/promoteUserToAdmin.js <userEmail>');
  process.exit(1);
}

promoteUserToAdmin(userEmail);
