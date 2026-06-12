import { Router } from 'express';
import { syncController } from '../controllers/syncController';

const router = Router();

// Health check status
router.get('/status', syncController.getStatus);

// Offline sync queue processing
router.post('/sync', syncController.postSync);

export default router;
