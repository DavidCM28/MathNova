import { Router } from 'express';
import authController from '../controllers/authController';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.get('/check-email', authController.checkEmail.bind(authController));

export default router;