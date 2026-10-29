import { Router } from 'express';
import { getCompanySettings, updateCompanySettings } from '../controllers/companyController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { companySettingsSchema } from '../utils/validators.js';

const router = Router();

// Publicly readable company branding
router.get('/', getCompanySettings);

// Authenticated admin modifications
router.patch('/', authenticate, validate(companySettingsSchema), updateCompanySettings);

export default router;
