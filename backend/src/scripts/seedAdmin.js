import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import dotenv from 'dotenv';
dotenv.config();

async function seedAdmin() {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@nexora-tech.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@Pass2026!';
    const name = process.env.ADMIN_NAME || 'Principal Certification Admin';

    let admin = await Admin.findOne({ email });
    if (admin) {
      console.log(`[Seed] Administrator account (${email}) already exists.`);
    } else {
      admin = new Admin({
        name,
        email,
        password,
        role: 'superadmin',
        isActive: true,
      });
      await admin.save();
      console.log(`[Seed] Created new administrator account:`);
      console.log(`       Email:    ${email}`);
      console.log(`       Password: ${password}`);
      console.log(`       Role:     superadmin`);
    }

    await disconnectDB();
    console.log('[Seed] Admin initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
}

seedAdmin();
