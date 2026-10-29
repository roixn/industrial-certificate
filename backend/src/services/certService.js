import { Certificate } from '../models/Certificate.js';
import { CompanySettings } from '../models/CompanySettings.js';

/**
 * Validates whether the given start and end dates fulfill the required duration (45 days)
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @param {string} policy 'INCLUSIVE' | 'EXCLUSIVE'
 * @returns {{ isValid: boolean, calculatedDays: number, error?: string }}
 */
export function validateTrainingDuration(startDate, endDate, policy = 'INCLUSIVE') {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return { isValid: false, calculatedDays: 0, error: 'Invalid start date format' };
  }
  if (isNaN(end.getTime())) {
    return { isValid: false, calculatedDays: 0, error: 'Invalid completion date format' };
  }

  // Remove time component to compare clean calendar dates in UTC
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  if (endUtc < startUtc) {
    return { isValid: false, calculatedDays: 0, error: 'Training completion date cannot be earlier than start date' };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const rawDiffDays = Math.round((endUtc - startUtc) / msPerDay);
  
  // Inclusive policy: start day + end day = rawDiffDays + 1
  const calculatedDays = policy === 'INCLUSIVE' ? rawDiffDays + 1 : rawDiffDays;

  if (calculatedDays !== 45) {
    return {
      isValid: false,
      calculatedDays,
      error: `Configured duration requires exactly 45 days. Current dates span ${calculatedDays} day${calculatedDays === 1 ? '' : 's'}.`,
    };
  }

  return { isValid: true, calculatedDays };
}

/**
 * Calculates recommended 45-day end date given a start date
 * @param {Date|string} startDate 
 * @param {string} policy 
 * @returns {Date}
 */
export function calculateRecommendedEndDate(startDate, policy = 'INCLUSIVE') {
  const start = new Date(startDate);
  const daysToAdd = policy === 'INCLUSIVE' ? 44 : 45;
  const end = new Date(start);
  end.setDate(end.getDate() + daysToAdd);
  return end;
}

/**
 * Generates the next sequential unique Certificate ID
 * Format: {PREFIX}-{YEAR}-{PADDED_SEQUENCE} e.g. CERT-2026-0001
 * @param {string} [customPrefix]
 * @returns {Promise<string>}
 */
export async function generateUniqueCertificateId(customPrefix) {
  const settings = await CompanySettings.getSettings();
  const prefix = (customPrefix || settings.certificatePrefix || 'CERT').toUpperCase();
  const currentYear = new Date().getFullYear();

  // Find all certificates for this prefix and year to determine next sequence number
  const regex = new RegExp(`^${prefix}-${currentYear}-(\\d+)$`);
  const certs = await Certificate.find({ certificateId: regex }, { certificateId: 1 }).lean();

  let maxSeq = 0;
  for (const cert of certs) {
    const match = cert.certificateId.match(regex);
    if (match && match[1]) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidateId = `${prefix}-${currentYear}-${String(nextSeq).padStart(4, '0')}`;

  // Verify candidate uniqueness in case of race condition
  while (await Certificate.exists({ certificateId: candidateId })) {
    nextSeq++;
    candidateId = `${prefix}-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
  }

  return candidateId;
}
