import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    certificateId: {
      type: String,
      index: true,
      default: null,
    },
    performedBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    reason: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
