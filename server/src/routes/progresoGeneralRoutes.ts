import { Router } from 'express';
import progresoGeneralController from '../controllers/progresoGeneralController';

const router = Router();

router.get('/:id_estudiante', progresoGeneralController.obtenerEstadoActividades.bind(progresoGeneralController));

export default router;