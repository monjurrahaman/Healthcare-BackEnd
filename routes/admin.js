import express from 'express';
import { 
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getFinancialReports
} from '../controllers/adminController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:user_id/status', updateUserStatus);
router.get('/financial-reports', getFinancialReports);

export default router;