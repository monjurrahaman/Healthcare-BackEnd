import express from 'express';
import { 
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment
} from '../controllers/appointmentController.js';
import { auth, authorize } from '../middleware/auth.js';
import { validateAppointment } from '../middleware/validation.js';

const router = express.Router();

router.use(auth);

router.post('/', validateAppointment, createAppointment);
router.get('/', getAllAppointments);
router.get('/:appointment_id', getAppointmentById);
router.put('/:appointment_id', updateAppointment);
router.put('/:appointment_id/cancel', cancelAppointment);

export default router;