require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Agency = require('../models/Agency');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Clear existing data (optional, but good for a fresh start)
    // await User.deleteMany({});
    // await Agency.deleteMany({});

    // 2. Check if admin exists
    console.log('--- Debug: About to check Admin user ---');
    const adminExists = await User.findOne({ email: 'admin@disaster.com' });
    if (!adminExists) {
      console.log('--- Debug: Admin user not found, creating new one ---');
      const adminUser = new User({
        name: 'System Admin',
        email: 'admin@disaster.com',
        password: 'admin12345',
        role: 'admin'
      });
      console.log('--- Debug: About to save Admin user ---');
      await adminUser.save();
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists.');
    }

    console.log('--- Debug: About to check Agency user ---');
    const agencyEmail = 'agency@disaster.com';
    const agencyUserExists = await User.findOne({ email: agencyEmail });
    
    if (!agencyUserExists) {
      console.log('--- Debug: Agency user not found, creating agency and user ---');
      const sampleAgency = new Agency({
        name: 'Global Rescue Force',
        type: 'NDRF',
        email: agencyEmail,
        phone: '+91 9999999999',
        location: {
          lat: 28.6139,
          lng: 77.2090,
          address: 'Main Disaster Command Center, New Delhi'
        },
        status: 'active',
        resources: ['Ambulances', 'Boats', 'Drones'],
        verified: true
      });
      console.log('--- Debug: About to save Sample Agency ---');
      await sampleAgency.save();
      console.log('Sample Agency created successfully!');

      const agencyUser = new User({
        name: 'NDRF Unit 1',
        email: agencyEmail,
        password: 'agency12345',
        role: 'agency',
        agencyId: sampleAgency._id
      });
      console.log('--- Debug: About to save Agency user ---');
      await agencyUser.save();
      console.log('Agency user created successfully!');
    } else {
      console.log('Agency user already exists.');
    }

    console.log('Seeding complete! You can now log in.');
    process.exit(0);
  } catch (error) {
    console.error('CRITICAL SEED ERROR:');
    if (error.name === 'ValidationError') {
      console.error('- Validation Error Details:');
      for (let field in error.errors) {
        console.error(`  - ${field}: ${error.errors[field].message}`);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
};

seedData();
