import { Router } from 'express';
import {
  verifyCertificate,
  downloadPublicCertificatePdf,
  submitContact,
} from '../controllers/publicController.js';
import { verificationLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { contactSchema } from '../utils/validators.js';

const router = Router();

router.get('/verify/:certificateId', verificationLimiter, verifyCertificate);
router.get('/verify/:certificateId/pdf', verificationLimiter, downloadPublicCertificatePdf);
router.post('/contact', validate(contactSchema), submitContact);

export default router;
