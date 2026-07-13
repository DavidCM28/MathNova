import { Router } from 'express';
import tripulacionController from '../controllers/tripulacionController';

const router = Router();

router.post('/validar-celda', tripulacionController.validarCelda.bind(tripulacionController));
router.post('/validar-modulo', tripulacionController.validarModulo.bind(tripulacionController));
router.get('/progreso/:id_estudiante', tripulacionController.obtenerProgreso.bind(tripulacionController));
router.post('/reiniciar', tripulacionController.reiniciarActividad.bind(tripulacionController));

export default router;