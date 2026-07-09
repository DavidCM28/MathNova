import { Router } from 'express';
import proporcionalidadController from '../controllers/proporcionalidadController';

const router = Router();

router.post('/validar-tabla', proporcionalidadController.validarTabla.bind(proporcionalidadController));
router.post('/prediccion', proporcionalidadController.validarPrediccion.bind(proporcionalidadController));
router.get('/progreso/:id_estudiante', proporcionalidadController.obtenerProgreso.bind(proporcionalidadController));
router.post('/guardar-progreso', proporcionalidadController.guardarProgreso.bind(proporcionalidadController));
router.post('/finalizar', proporcionalidadController.finalizarActividad.bind(proporcionalidadController));
router.post('/reiniciar', proporcionalidadController.reiniciarActividad.bind(proporcionalidadController)); // ✅ NUEVO

export default router;