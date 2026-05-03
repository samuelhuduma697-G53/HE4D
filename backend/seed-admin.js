const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/huduma_ecosystem');
  
  const Admin = require('./models/admin/Admin');
  
  // Check if admin exists
  const existing = await Admin.findOne({ email: 'mutukudennis2004@gmail.com' });
  if (existing) {
    console.log('✅ Admin already exists:', existing.email);
    await mongoose.disconnect();
    return;
  }
  
  // Create super admin
  const admin = new Admin({
    name: 'Dennis Mutuku',
    email: 'mutukudennis2004@gmail.com',
    phone: '+254797406919',
    passwordHash: await bcrypt.hash('Admin@123!', 12),
    role: {
      role: 'super_admin',
      permissions: [
        'manage_admins', 'verify_helpers', 'view_audit_logs',
        'manage_safety_incidents', 'manage_content', 'view_analytics',
        'manage_system_settings', 'export_data'
      ]
    },
    assignedRegion: 'Kilifi',
    createdBy: null,
    isActive: true
  });
  
  await admin.save();
  console.log('✅ Root admin created successfully!');
  console.log('   Email: mutukudennis2004@gmail.com');
  console.log('   Password: Admin@123!');
  await mongoose.disconnect();
}

seedAdmin().catch(err => { console.error(err); process.exit(1); });
