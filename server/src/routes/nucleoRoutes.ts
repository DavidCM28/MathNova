import { Router } from 'express';
import nucleoController from '../controllers/nucleoController';

const router = Router();

router.post('/validar-orden', nucleoController.validarOrden.bind(nucleoController));
router.post('/validar-media', nucleoController.validarMedia.bind(nucleoController));
router.post('/validar-mediana', nucleoController.validarMediana.bind(nucleoController));
router.post('/validar-moda', nucleoController.validarModa.bind(nucleoController));
router.post('/validar-rango', nucleoController.validarRango.bind(nucleoController));
router.post('/enviar-decision', nucleoController.enviarDecision.bind(nucleoController));
router.post('/pista-consultada', nucleoController.registrarConsultaPista.bind(nucleoController));
router.get('/progreso/:id_estudiante', nucleoController.obtenerProgreso.bind(nucleoController));
router.post('/reiniciar', nucleoController.reiniciarActividad.bind(nucleoController));

export default router;