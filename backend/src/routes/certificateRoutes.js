import { Router } from 'express';
import {
  createCertificate,
  getCertificates,
  getCertificateById,
  updateCertificate,
  issueCertificate,
  revokeCertificate,
  downloadCertificatePdf,
  getStats,
} from '../controllers/certificateController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createCertificateSchema,
  updateCertificateSchema,
  revokeCertificateSchema,
} from '../utils/validators.js';

const router = Router();

router.use(authenticate);

router.get('/stats', getStats);
router.post('/', validate(createCertificateSchema), createCertificate);
router.get('/', getCertificates);
router.get('/:certificateId', getCertificateById);
router.patch('/:certificateId', validate(updateCertificateSchema), updateCertificate);
router.post('/:certificateId/issue', issueCertificate);
router.post('/:certificateId/revoke', validate(revokeCertificateSchema), revokeCertificate);
router.get('/:certificateId/pdf', downloadCertificatePdf);

export default router;
