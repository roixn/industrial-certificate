import bcrypt from 'bcryptjs';
import { Certificate } from '../models/Certificate.js';
import { Admin } from '../models/Admin.js';
import { CompanySettings } from '../models/CompanySettings.js';
import { AuditLog } from '../models/AuditLog.js';
import { OtpVerification } from '../models/OtpVerification.js';

let fallbackEnabled = false;

// In-Memory Data Collections
let inMemoryAdmins = [];
let inMemoryCompanySettings = null;
let inMemoryCertificates = [];
let inMemoryAuditLogs = [];
let inMemoryOtps = [];

function makeObjectId() {
  const chars = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function initData() {
  const adminId = makeObjectId();
  const hashedPassword = bcrypt.hashSync('Admin@Pass2026!', 10);

  inMemoryAdmins = [
    {
      _id: adminId,
      name: 'Dr. Rajesh K. Sharma',
      email: 'admin@nexora-tech.com',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: async function (candidate) {
        return bcrypt.compare(candidate, this.password);
      },
      toJSON: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      },
      save: async function () {
        return this;
      },
    },
  ];

  inMemoryCompanySettings = {
    _id: makeObjectId(),
    companyName: 'Nexora Innovations Pvt. Ltd.',
    companyTagline: 'Center for Advanced Industrial Training & Engineering Excellence',
    companyLogo: '',
    address: 'Tower B, 4th Floor, Logix Cyber Park, Sector 62, Electronic City, Noida, Uttar Pradesh 201309',
    email: 'certifications@nexora-tech.com',
    phone: '+91 (080) 4567-8900',
    website: 'https://nexora-innovations.com',
    authorizedSignatory: 'Dr. Rajesh K. Sharma',
    signatoryDesignation: 'Director of Technical Training & Development',
    certificatePrefix: 'CERT',
    verificationDomain: process.env.PUBLIC_VERIFY_BASE_URL || 'https://nut-disturbed-favourites-situated.trycloudflare.com/credentials',
    allowPublicDownload: true,
    countingPolicy: 'INCLUSIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    save: async function () {
      return this;
    },
  };

  const companySnapshot = {
    name: inMemoryCompanySettings.companyName,
    tagline: inMemoryCompanySettings.companyTagline,
    address: inMemoryCompanySettings.address,
    email: inMemoryCompanySettings.email,
    phone: inMemoryCompanySettings.phone,
    website: inMemoryCompanySettings.website,
    logo: inMemoryCompanySettings.companyLogo,
  };

  const domain = inMemoryCompanySettings.verificationDomain.replace(/\/+$/, '');

  inMemoryCertificates = [
    {
      _id: makeObjectId(),
      certificateId: 'CERT-2026-0001',
      traineeName: 'Aarav Patel',
      fatherName: 'Vikram Patel',
      institution: 'National Institute of Technology, Karnataka (NITK)',
      degree: 'Bachelor of Technology',
      branch: 'Computer Science and Engineering',
      enrollmentNumber: 'NITK2023CS1042',
      trainingDomain: 'Full Stack Cloud Native Web Architecture',
      trainingStartDate: new Date('2026-06-01T00:00:00.000Z'),
      trainingEndDate: new Date('2026-07-15T00:00:00.000Z'),
      durationDays: 45,
      trainingMode: 'Hybrid',
      performanceGrade: 'Distinction (A+)',
      remarks: 'Demonstrated exceptional competence in modern microservices and high-concurrency systems.',
      issueDate: new Date('2026-07-16T10:00:00.000Z'),
      status: 'ISSUED',
      signatoryName: inMemoryCompanySettings.authorizedSignatory,
      signatoryDesignation: inMemoryCompanySettings.signatoryDesignation,
      companySnapshot,
      qrVerificationUrl: `${domain}/CERT-2026-0001`,
      createdBy: adminId,
      issuedAt: new Date('2026-07-16T10:00:00.000Z'),
      issuedBy: adminId,
      createdAt: new Date('2026-07-16T10:00:00.000Z'),
      updatedAt: new Date('2026-07-16T10:00:00.000Z'),
      save: async function () { return this; },
    },
    {
      _id: makeObjectId(),
      certificateId: 'CERT-2026-0002',
      traineeName: 'Priya Sundaram',
      fatherName: 'K. Sundaram',
      institution: 'Vellore Institute of Technology (VIT)',
      degree: 'Master of Science',
      branch: 'Artificial Intelligence & Machine Learning',
      enrollmentNumber: 'VIT22MSAI0048',
      trainingDomain: 'Applied Generative AI & Deep Learning Systems',
      trainingStartDate: new Date('2026-07-01T00:00:00.000Z'),
      trainingEndDate: new Date('2026-08-14T00:00:00.000Z'),
      durationDays: 45,
      trainingMode: 'Online',
      performanceGrade: 'Grade A (Outstanding)',
      remarks: 'Developed production-grade LLM retrieval augmentation framework.',
      issueDate: new Date('2026-08-15T11:30:00.000Z'),
      status: 'ISSUED',
      signatoryName: inMemoryCompanySettings.authorizedSignatory,
      signatoryDesignation: inMemoryCompanySettings.signatoryDesignation,
      companySnapshot,
      qrVerificationUrl: `${domain}/CERT-2026-0002`,
      createdBy: adminId,
      issuedAt: new Date('2026-08-15T11:30:00.000Z'),
      issuedBy: adminId,
      createdAt: new Date('2026-08-15T11:30:00.000Z'),
      updatedAt: new Date('2026-08-15T11:30:00.000Z'),
      save: async function () { return this; },
    },
    {
      _id: makeObjectId(),
      certificateId: 'CERT-2026-0003',
      traineeName: 'Rohan Mehra',
      fatherName: 'Sanjay Mehra',
      institution: 'Delhi Technological University (DTU)',
      degree: 'Bachelor of Technology',
      branch: 'Information Technology',
      enrollmentNumber: 'DTU21IT051',
      trainingDomain: 'DevOps & Kubernetes Infrastructure Engineering',
      trainingStartDate: new Date('2026-06-01T00:00:00.000Z'),
      trainingEndDate: new Date('2026-07-15T00:00:00.000Z'),
      durationDays: 45,
      trainingMode: 'Offline',
      performanceGrade: 'Incomplete',
      remarks: 'Revoked due to disciplinary review.',
      issueDate: new Date('2026-07-16T10:00:00.000Z'),
      status: 'REVOKED',
      signatoryName: inMemoryCompanySettings.authorizedSignatory,
      signatoryDesignation: inMemoryCompanySettings.signatoryDesignation,
      companySnapshot,
      qrVerificationUrl: `${domain}/CERT-2026-0003`,
      createdBy: adminId,
      issuedAt: new Date('2026-07-16T10:00:00.000Z'),
      issuedBy: adminId,
      revokedAt: new Date('2026-08-01T14:20:00.000Z'),
      revokedBy: adminId,
      revocationReason: 'Academic integrity violation: Unauthorized duplicate submission of capstone project repository.',
      createdAt: new Date('2026-07-16T10:00:00.000Z'),
      updatedAt: new Date('2026-08-01T14:20:00.000Z'),
      save: async function () { return this; },
    },
    {
      _id: makeObjectId(),
      certificateId: 'CERT-2026-0004',
      traineeName: 'Ananya Sharma',
      fatherName: 'Dinesh Sharma',
      institution: 'BITS Pilani',
      degree: 'Bachelor of Engineering',
      branch: 'Electronics and Communications',
      enrollmentNumber: 'BITS2023EC789',
      trainingDomain: 'Embedded IoT & Edge AI Firmware Development',
      trainingStartDate: new Date('2026-07-01T00:00:00.000Z'),
      trainingEndDate: new Date('2026-08-14T00:00:00.000Z'),
      durationDays: 45,
      trainingMode: 'Hybrid',
      performanceGrade: 'Distinction (A+)',
      remarks: 'Draft pending final supervisor assessment sign-off.',
      issueDate: new Date(),
      status: 'DRAFT',
      signatoryName: inMemoryCompanySettings.authorizedSignatory,
      signatoryDesignation: inMemoryCompanySettings.signatoryDesignation,
      companySnapshot,
      qrVerificationUrl: `${domain}/CERT-2026-0004`,
      createdBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function () { return this; },
    },
    {
      _id: makeObjectId(),
      certificateId: 'CERT-2026-0005',
      traineeName: 'Imran Ali',
      fatherName: 'Mustafa Ali',
      institution: 'PCD Global Tech Solutions',
      degree: 'Professional Diploma',
      branch: 'Computer Science & Python Development',
      enrollmentNumber: 'PCD-PY-2026-88',
      trainingDomain: '45 Days of Python programming with DSA',
      trainingStartDate: new Date('2026-04-25T00:00:00.000Z'),
      trainingEndDate: new Date('2026-06-08T00:00:00.000Z'),
      durationDays: 45,
      trainingMode: 'Hybrid',
      performanceGrade: 'Distinction (A+)',
      remarks: 'Successfully built real-world enterprise algorithms and full-stack backend systems.',
      issueDate: new Date('2026-10-29T14:20:13.233Z'),
      status: 'ISSUED',
      signatoryName: inMemoryCompanySettings.authorizedSignatory,
      signatoryDesignation: inMemoryCompanySettings.signatoryDesignation,
      companySnapshot,
      qrVerificationUrl: `${domain}/f3e7b730-f86d-49ba-b5d0-19e0cbc3d103`,
      createdBy: adminId,
      issuedAt: new Date('2026-10-29T14:20:13.233Z'),
      issuedBy: adminId,
      createdAt: new Date('2026-10-29T14:20:13.233Z'),
      updatedAt: new Date('2026-10-29T14:20:13.233Z'),
      save: async function () { return this; },
    },
  ];

  inMemoryAuditLogs = [
    {
      _id: makeObjectId(),
      action: 'CERTIFICATE_ISSUED',
      certificateId: 'CERT-2026-0001',
      performedBy: { id: adminId, name: 'Dr. Rajesh K. Sharma', email: 'admin@nexora-tech.com' },
      reason: 'Initial demo issuance for Aarav Patel',
      createdAt: new Date('2026-07-16T10:00:00.000Z'),
    },
  ];
}

/**
 * Filter helper for basic MongoDB query matching
 */
function matchQuery(item, query = {}) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, value] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(value)) {
      const orMatched = value.some((subQuery) => matchQuery(item, subQuery));
      if (!orMatched) return false;
      continue;
    }

    if (key === '$and' && Array.isArray(value)) {
      const andMatched = value.every((subQuery) => matchQuery(item, subQuery));
      if (!andMatched) return false;
      continue;
    }

    const itemVal = item[key];

    if (value instanceof RegExp) {
      if (!value.test(String(itemVal || ''))) return false;
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      if (value.$regex) {
        const flags = value.$options || '';
        const re = new RegExp(value.$regex, flags);
        if (!re.test(String(itemVal || ''))) return false;
        continue;
      }
      if (value.$in && Array.isArray(value.$in)) {
        if (!value.$in.includes(itemVal)) return false;
        continue;
      }
      if (value.$ne !== undefined) {
        if (itemVal === value.$ne) return false;
        continue;
      }
    }

    if (itemVal !== value) {
      // String case-insensitive fallback if both strings
      if (typeof itemVal === 'string' && typeof value === 'string') {
        if (itemVal.toLowerCase() !== value.toLowerCase()) return false;
      } else {
        return false;
      }
    }
  }

  return true;
}

/**
 * Creates chainable Query simulator for Mongoose
 */
function createQueryChain(resultData) {
  let data = Array.isArray(resultData) ? [...resultData] : resultData;

  const chain = {
    sort: function (sortObj) {
      if (Array.isArray(data) && sortObj) {
        const [field, direction] = Object.entries(sortObj)[0] || [];
        if (field) {
          const mult = direction === -1 || direction === 'desc' ? -1 : 1;
          data.sort((a, b) => {
            if (a[field] < b[field]) return -1 * mult;
            if (a[field] > b[field]) return 1 * mult;
            return 0;
          });
        }
      }
      return chain;
    },
    skip: function (num) {
      if (Array.isArray(data) && typeof num === 'number') {
        data = data.slice(num);
      }
      return chain;
    },
    limit: function (num) {
      if (Array.isArray(data) && typeof num === 'number') {
        data = data.slice(0, num);
      }
      return chain;
    },
    select: function () {
      return chain;
    },
    populate: function () {
      return chain;
    },
    lean: function () {
      return chain;
    },
    exec: async function () {
      return data;
    },
    then: function (resolve, reject) {
      return Promise.resolve(data).then(resolve, reject);
    },
    catch: function (reject) {
      return Promise.resolve(data).catch(reject);
    },
  };

  return chain;
}

/**
 * Activates in-memory data store for serverless / zero-cloud-database environments
 */
export function enableMemoryFallback() {
  if (fallbackEnabled) return;
  fallbackEnabled = true;

  initData();
  console.log('[Memory Fallback] ACTIVATED: Standalone In-Memory Datastore ready (Zero Cloud Database required).');

  // --- 1. Patch Certificate Model ---
  Certificate.findOne = function (query) {
    const item = inMemoryCertificates.find((c) => matchQuery(c, query));
    return createQueryChain(item || null);
  };

  Certificate.findById = function (id) {
    const item = inMemoryCertificates.find((c) => String(c._id) === String(id));
    return createQueryChain(item || null);
  };

  Certificate.find = function (query) {
    const matched = inMemoryCertificates.filter((c) => matchQuery(c, query));
    return createQueryChain(matched);
  };

  Certificate.deleteMany = async function (query) {
    inMemoryCertificates = inMemoryCertificates.filter((c) => !matchQuery(c, query));
    return { deletedCount: 1 };
  };

  Certificate.countDocuments = async function (query) {
    return inMemoryCertificates.filter((c) => matchQuery(c, query)).length;
  };

  Certificate.distinct = async function (field) {
    const values = inMemoryCertificates.map((c) => c[field]).filter(Boolean);
    return [...new Set(values)];
  };

  Certificate.exists = async function (query) {
    const item = inMemoryCertificates.find((c) => matchQuery(c, query));
    return item ? { _id: item._id } : null;
  };

  Certificate.aggregate = async function (pipeline = []) {
    // Basic domain counts aggregator
    const domainMap = {};
    for (const c of inMemoryCertificates) {
      const d = c.trainingDomain || 'General';
      domainMap[d] = (domainMap[d] || 0) + 1;
    }
    return Object.entries(domainMap).map(([domain, count]) => ({ _id: domain, count }));
  };

  Certificate.create = async function (docData) {
    if (docData.certificateId && inMemoryCertificates.some((c) => c.certificateId === docData.certificateId)) {
      const err = new Error(`E11000 duplicate key error collection: certificates index: certificateId_1 dup key: { certificateId: "${docData.certificateId}" }`);
      err.code = 11000;
      throw err;
    }
    const newDoc = {
      _id: makeObjectId(),
      ...docData,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function () { return this; },
    };
    inMemoryCertificates.unshift(newDoc);
    return newDoc;
  };

  // --- 2. Patch Admin Model ---
  Admin.findOne = function (query) {
    const item = inMemoryAdmins.find((a) => matchQuery(a, query));
    return createQueryChain(item || null);
  };

  Admin.findById = function (id) {
    const item = inMemoryAdmins.find((a) => String(a._id) === String(id));
    return createQueryChain(item || null);
  };

  Admin.find = function (query) {
    const matched = inMemoryAdmins.filter((a) => matchQuery(a, query));
    return createQueryChain(matched);
  };

  Admin.deleteMany = async function (query) {
    inMemoryAdmins = inMemoryAdmins.filter((a) => !matchQuery(a, query));
    return { deletedCount: 1 };
  };

  Admin.countDocuments = async function () {
    return inMemoryAdmins.length;
  };

  Admin.create = async function (adminData) {
    const hashedPassword = bcrypt.hashSync(adminData.password, 10);
    const newAdmin = {
      _id: makeObjectId(),
      ...adminData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: async function (candidate) {
        return bcrypt.compare(candidate, this.password);
      },
      toJSON: function () {
        const copy = { ...this };
        delete copy.password;
        return copy;
      },
      save: async function () { return this; },
    };
    inMemoryAdmins.push(newAdmin);
    return newAdmin;
  };

  // --- 3. Patch CompanySettings Model ---
  CompanySettings.findOne = function () {
    return createQueryChain(inMemoryCompanySettings);
  };

  CompanySettings.getSettings = async function () {
    return inMemoryCompanySettings;
  };

  CompanySettings.create = async function (data) {
    inMemoryCompanySettings = {
      ...inMemoryCompanySettings,
      ...data,
      updatedAt: new Date(),
      save: async function () { return this; },
    };
    return inMemoryCompanySettings;
  };

  // --- 4. Patch AuditLog Model ---
  AuditLog.create = async function (logData) {
    const log = {
      _id: makeObjectId(),
      ...logData,
      createdAt: new Date(),
    };
    inMemoryAuditLogs.unshift(log);
    return log;
  };

  AuditLog.find = function (query) {
    const matched = inMemoryAuditLogs.filter((l) => matchQuery(l, query));
    return createQueryChain(matched);
  };

  AuditLog.countDocuments = async function (query) {
    return inMemoryAuditLogs.filter((l) => matchQuery(l, query)).length;
  };

  // --- 5. Patch OtpVerification Model ---
  OtpVerification.create = async function (otpData) {
    const otp = {
      _id: makeObjectId(),
      ...otpData,
      createdAt: new Date(),
    };
    inMemoryOtps.unshift(otp);
    return otp;
  };

  OtpVerification.findOne = function (query) {
    const item = inMemoryOtps.find((o) => matchQuery(o, query));
    return createQueryChain(item || null);
  };

  OtpVerification.deleteMany = async function (query) {
    inMemoryOtps = inMemoryOtps.filter((o) => !matchQuery(o, query));
    return { deletedCount: 1 };
  };
}
