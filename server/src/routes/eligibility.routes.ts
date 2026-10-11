import { Router } from 'express';
import { checkEligibility } from '../controllers/eligibility.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Student project eligibility evaluation (Cached)
router.get('/check', verifyToken, checkEligibility);

export default router;
