import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['patient', 'doctor', 'nurse', 'admin']),
  handleValidationErrors
];

const validateUserLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
];

// Appointment validation rules
const validateAppointment = [
  body('patient_id').notEmpty(),
  body('doctor_id').notEmpty(),
  body('appointment_date').isISO8601(),
  body('appointment_time').notEmpty(),
  body('type').isIn(['in-person', 'video', 'phone']),
  handleValidationErrors
];

// Prescription validation rules
const validatePrescription = [
  body('patient_id').notEmpty(),
  body('doctor_id').notEmpty(),
  body('medication_name').notEmpty().trim(),
  body('dosage').notEmpty().trim(),
  body('frequency').notEmpty().trim(),
  body('duration').notEmpty().trim(),
  body('start_date').isISO8601(),
  handleValidationErrors
];

export {
  validateUserRegistration,
  validateUserLogin,
  validateAppointment,
  validatePrescription,
  handleValidationErrors
};