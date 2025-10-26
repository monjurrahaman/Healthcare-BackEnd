import express from 'express';
import { 
  getPatientProfile,
  updateMedicalHistory,
  getPatientAppointments,
  getPatientPrescriptions,
  getPatientLabResults,
  getPatientBills
} from '../controllers/patientController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);
router.use(authorize('patient', 'doctor', 'admin'));

router.get('/profile', getPatientProfile);
router.put('/medical-history', authorize('patient'), updateMedicalHistory);
router.get('/appointments', getPatientAppointments);
router.get('/prescriptions', getPatientPrescriptions);
router.get('/lab-results', getPatientLabResults);
router.get('/bills', getPatientBills);

export default router;