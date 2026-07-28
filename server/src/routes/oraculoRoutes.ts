import { Router } from 'express';
import oraculoController from '../controllers/oraculoController';

const router = Router();

router.post('/validar-espacio', oraculoController.validarEspacio.bind(oraculoController));
router.post('/validar-paso2', oraculoController.validarPaso2.bind(oraculoController));
router.post('/validar-orden', oraculoController.validarOrden.bind(oraculoController));
router.post('/validar-comparacion', oraculoController.validarComparacion.bind(oraculoController));
router.post('/validar-prediccion', oraculoController.validarPrediccion.bind(oraculoController));
router.post('/activar-final', oraculoController.activarFinal.bind(oraculoController));
router.post('/pista-consultada', oraculoController.registrarConsultaPista.bind(oraculoController));
router.get('/progreso/:id_estudiante', oraculoController.obtenerProgreso.bind(oraculoController));
router.post('/reiniciar', oraculoController.reiniciarActividad.bind(oraculoController));

export default router;