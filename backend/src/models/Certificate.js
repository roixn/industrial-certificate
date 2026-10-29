import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      uppercase: true,
    },
    traineeName: {
      type: String,
      required: [true, 'Trainee full name is required'],
      trim: true,
      maxlength: 120,
    },
    fatherName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    institution: {
      type: String,
      required: [true, 'College or University name is required'],
      trim: true,
      maxlength: 200,
    },
    degree: {
      type: String,
      required: [true, 'Degree / Course is required'],
      trim: true,
      maxlength: 100,
    },
    branch: {
      type: String,
      required: [true, 'Branch or Specialization is required'],
      trim: true,
      maxlength: 100,
    },
    enrollmentNumber: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    trainingDomain: {
      type: String,
      required: [true, 'Training domain is required'],
      trim: true,
      maxlength: 150,
    },
    trainingStartDate: {
      type: Date,
      required: [true, 'Training start date is required'],
    },
    trainingEndDate: {
      type: Date,
      required: [true, 'Training completion date is required'],
    },
    durationDays: {
      type: Number,
      required: true,
      default: 45,
    },
    trainingMode: {
      type: String,
      enum: ['Online', 'Offline', 'Hybrid'],
      default: 'Hybrid',
      required: true,
    },
    performanceGrade: {
      type: String,
      trim: true,
      default: 'Distinction (A+)',
    },
    remarks: {
      type: String,
      trim: true,
      default: 'Successfully completed real-world project modules and practical evaluations.',
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ISSUED', 'REVOKED'],
      default: 'DRAFT',
      index: true,
    },
    signatoryName: {
      type: String,
      required: true,
      trim: true,
    },
    signatoryDesignation: {
      type: String,
      required: true,
      trim: true,
    },
    companySnapshot: {
      name: { type: String, required: true },
      tagline: { type: String, default: '' },
      address: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      website: { type: String, required: true },
      logo: { type: String, default: '' },
    },
    qrVerificationUrl: {
      type: String,
      required: true,
    },
    pdfFileReference: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    issuedAt: {
      type: Date,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    revokedAt: {
      type: Date,
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    revocationReason: {
      type: String,
      trim: true,
    },
    amendmentHistory: [
      {
        amendedAt: { type: Date, default: Date.now },
        amendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        reason: { type: String, required: true },
        previousData: { type: Object },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for searching & filtering
certificateSchema.index({ traineeName: 'text', certificateId: 'text', institution: 'text' });
certificateSchema.index({ status: 1, trainingDomain: 1, issueDate: -1 });

export const Certificate = mongoose.model('Certificate', certificateSchema);
