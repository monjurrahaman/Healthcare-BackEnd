import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile 
} from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { 
  validateUserRegistration, 
  validateUserLogin 
} from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

export default router;