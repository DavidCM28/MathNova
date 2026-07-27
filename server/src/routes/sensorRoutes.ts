import { Router } from 'express';
import sensorController from '../controllers/sensorController';

const router = Router();

router.post('/validar-absoluta', sensorController.validarAbsoluta.bind(sensorController));
router.post('/validar-relativa', sensorController.validarRelativa.bind(sensorController));
router.post('/calcular-zona', sensorController.calcularZonaOrigen.bind(sensorController));
router.post('/pista-consultada', sensorController.registrarConsultaPista.bind(sensorController));
router.get('/progreso/:id_estudiante', sensorController.obtenerProgreso.bind(sensorController));
router.post('/reiniciar', sensorController.reiniciarActividad.bind(sensorController));

export default router;