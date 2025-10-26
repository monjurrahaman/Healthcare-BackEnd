import express from 'express';
import { 
  createLabResult,
  getLabResults,
  updateLabResult
} from '../controllers/labController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.post('/', authorize('doctor', 'nurse', 'admin'), createLabResult);
router.get('/', getLabResults);
router.put('/:lab_result_id', authorize('doctor', 'admin'), updateLabResult);

export default router;