import mongoose from 'mongoose';

const companySettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      default: 'Nexora Innovations Pvt. Ltd.',
      trim: true,
    },
    companyTagline: {
      type: String,
      default: 'Center for Advanced Industrial Training & Engineering Excellence',
      trim: true,
    },
    companyLogo: {
      type: String,
      default: '', // Base64 data URL or path to logo
    },
    address: {
      type: String,
      required: true,
      default: 'Tower B, 4th Floor, Logix Cyber Park, Sector 62, Electronic City, Noida, Uttar Pradesh 201309',
      trim: true,
    },
    email: {
      type: String,
      required: true,
      default: 'certifications@nexora-tech.com',
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      default: '+91 (080) 4567-8900',
      trim: true,
    },
    website: {
      type: String,
      required: true,
      default: 'https://nexora-innovations.com',
      trim: true,
    },
    authorizedSignatory: {
      type: String,
      required: true,
      default: 'Dr. Rajesh K. Sharma',
      trim: true,
    },
    signatoryDesignation: {
      type: String,
      required: true,
      default: 'Director of Technical Training & Development',
      trim: true,
    },
    certificatePrefix: {
      type: String,
      required: true,
      default: 'CERT',
      trim: true,
    },
    verificationDomain: {
      type: String,
      required: true,
      default: 'http://localhost:5173/verify',
      trim: true,
    },
    allowPublicDownload: {
      type: Boolean,
      default: true,
    },
    countingPolicy: {
      type: String,
      enum: ['INCLUSIVE', 'EXCLUSIVE', 'BUSINESS_DAYS_APPROX'],
      default: 'INCLUSIVE', // start day to end day inclusive = (end - start)/86400000 + 1
    },
  },
  {
    timestamps: true,
  }
);

companySettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export const CompanySettings = mongoose.model('CompanySettings', companySettingsSchema);
