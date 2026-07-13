import { Router } from 'express';
import rampasController from '../controllers/rampasController';

const router = Router();

router.post('/verificar', rampasController.verificarRespuestas.bind(rampasController));
router.get('/progreso/:id_estudiante', rampasController.obtenerProgreso.bind(rampasController));
router.post('/reiniciar', rampasController.reiniciarActividad.bind(rampasController));

export default router;