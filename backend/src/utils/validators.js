import { z } from 'zod';

export const loginSchema = {
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
};

export const createCertificateSchema = {
  body: z.object({
    traineeName: z.string().min(2, 'Trainee full name must be at least 2 characters').max(120),
    fatherName: z.string().max(120).optional().default(''),
    institution: z.string().min(2, 'Institution name must be at least 2 characters').max(200),
    degree: z.string().min(2, 'Degree/course must be specified').max(100),
    branch: z.string().min(2, 'Branch/specialization must be specified').max(100),
    enrollmentNumber: z.string().max(80).optional().default(''),
    trainingDomain: z.string().min(2, 'Training domain is required').max(150),
    trainingStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid training start date is required',
    }),
    trainingEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid training completion date is required',
    }),
    trainingMode: z.enum(['Online', 'Offline', 'Hybrid']).default('Hybrid'),
    performanceGrade: z.string().max(50).optional().default('Distinction (A+)'),
    remarks: z.string().max(500).optional().default('Successfully completed 45 days practical curriculum and evaluations.'),
    issueImmediately: z.boolean().optional().default(false),
  }),
};

export const updateCertificateSchema = {
  body: z.object({
    traineeName: z.string().min(2).max(120).optional(),
    fatherName: z.string().max(120).optional(),
    institution: z.string().min(2).max(200).optional(),
    degree: z.string().min(2).max(100).optional(),
    branch: z.string().min(2).max(100).optional(),
    enrollmentNumber: z.string().max(80).optional(),
    trainingDomain: z.string().min(2).max(150).optional(),
    trainingStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }).optional(),
    trainingEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid completion date' }).optional(),
    trainingMode: z.enum(['Online', 'Offline', 'Hybrid']).optional(),
    performanceGrade: z.string().max(50).optional(),
    remarks: z.string().max(500).optional(),
    amendmentReason: z.string().min(5, 'A valid reason (minimum 5 characters) is required when modifying a certificate').optional(),
  }),
};

export const revokeCertificateSchema = {
  body: z.object({
    reason: z.string().min(5, 'A detailed revocation reason (minimum 5 characters) is mandatory'),
  }),
};

export const companySettingsSchema = {
  body: z.object({
    companyName: z.string().min(2).max(150).optional(),
    companyTagline: z.string().max(200).optional(),
    address: z.string().min(5).max(300).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).max(40).optional(),
    website: z.string().url().optional(),
    authorizedSignatory: z.string().min(2).max(100).optional(),
    signatoryDesignation: z.string().min(2).max(100).optional(),
    certificatePrefix: z.string().min(2).max(10).toUpperCase().optional(),
    verificationDomain: z.string().url().optional(),
    allowPublicDownload: z.boolean().optional(),
    countingPolicy: z.enum(['INCLUSIVE', 'EXCLUSIVE']).optional(),
  }),
};

export const contactSchema = {
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    subject: z.string().min(3, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters long'),
  }),
};
