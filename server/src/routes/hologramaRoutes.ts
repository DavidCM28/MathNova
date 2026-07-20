import { Router } from 'express';
import hologramaController from '../controllers/hologramaController';

const router = Router();

router.post('/validar-barra', hologramaController.validarBarra.bind(hologramaController));
router.post('/validar-sector', hologramaController.validarSector.bind(hologramaController));
router.post('/activar', hologramaController.activar.bind(hologramaController));
router.post('/pista-consultada', hologramaController.registrarConsultaPista.bind(hologramaController));
router.get('/progreso/:id_estudiante', hologramaController.obtenerProgreso.bind(hologramaController));
router.post('/reiniciar', hologramaController.reiniciarActividad.bind(hologramaController));

export default router;