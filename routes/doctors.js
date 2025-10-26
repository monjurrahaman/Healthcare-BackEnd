import express from 'express';
import { 
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
  getDoctorPatients
} from '../controllers/doctorController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);
router.use(authorize('doctor', 'admin'));

router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);
router.get('/appointments', getDoctorAppointments);
router.put('/appointments/:appointment_id/status', updateAppointmentStatus);
router.get('/patients', getDoctorPatients);

export default router;