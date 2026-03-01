const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const config = require('../config');
const logger = require('../utils/logger');
const dns = require('dns');

// Force Google DNS to bypass local DNS restrictions
dns.setServers(['8.8.8.8', '1.1.1.1']);

const url = config.mongoose.url;
mongoose.connect(url).then(() => {
  logger.info("MongoDB server started for seeding");
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
