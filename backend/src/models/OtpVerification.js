import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 600 }, // Automatically purged by MongoDB after 10 minutes
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

otpVerificationSchema.index({ email: 1 });

export const OtpVerification = mongoose.model('OtpVerification', otpVerificationSchema);
