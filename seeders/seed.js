require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const url = process.env.MONGO_URL;
mongoose.connect(url).then(() => {
  console.log("MongoDB server started");
});

const createAdminUser = async () => {
  try {
    
    const existingAdmin = await User.findOne({ email: 'admin@neatticket.com' });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      process.exit(0);
    }


    const hashedPassword = await bcrypt.hash('admin123', 10);


    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@neatticket.com',
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
    });


    await adminUser.save();
    console.log("Admin user created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin user:", err);
    process.exit(1);
  }
};

createAdminUser();
