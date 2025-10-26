import express from 'express';
import { 
  createPrescription,
  getPrescriptions,
  updatePrescription
} from '../controllers/prescriptionController.js';
import { auth, authorize } from '../middleware/auth.js';
import { validatePrescription } from '../middleware/validation.js';

const router = express.Router();

router.use(auth);

router.post('/', authorize('doctor', 'admin'), validatePrescription, createPrescription);
router.get('/', getPrescriptions);
router.put('/:prescription_id', authorize('doctor', 'admin'), updatePrescription);

export default router;