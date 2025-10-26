import models from '../models/index.js';

export const createPrescription = async (req, res) => {
  try {
    const { patient_id, appointment_id, medication_name, dosage, frequency, duration, instructions, start_date, end_date, refills } = req.body;

    // Verify doctor has access to this patient
    const doctor = await models.Doctor.findOne({ 
      where: { user_id: req.user.user_id } 
    });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can create prescriptions'
      });
    }

    // Check if appointment exists and belongs to this doctor
    if (appointment_id) {
      const appointment = await models.Appointment.findOne({
        where: {
          appointment_id,
          doctor_id: doctor.doctor_id
        }
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found or access denied'
        });
      }
    }

    const prescription = await models.Prescription.create({
      patient_id,
      doctor_id: doctor.doctor_id,
      appointment_id: appointment_id || null,
      medication_name,
      dosage,
      frequency,
      duration,
      instructions,
      start_date,
      end_date,
      refills: refills || 0
    });

    const newPrescription = await models.Prescription.findByPk(prescription.prescription_id, {
      include: [
        {
          model: models.Patient,
          include: [{
            model: models.User,
            attributes: ['name', 'email']
          }]
        },
        {
          model: models.Doctor,
          include: [{
            model: models.User,
            attributes: ['name']
          }]
        },
        {
          model: models.Appointment
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: { prescription: newPrescription }
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const { patient_id, is_active } = req.query;
    const whereClause = {};

    if (patient_id) {
      whereClause.patient_id = patient_id;
    }

    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    // If user is a doctor, only show their prescriptions
    if (req.user.role === 'doctor') {
      const doctor = await models.Doctor.findOne({ 
        where: { user_id: req.user.user_id } 
      });
      if (doctor) {
        whereClause.doctor_id = doctor.doctor_id;
      }
    }

    // If user is a patient, only show their prescriptions
    if (req.user.role === 'patient') {
      const patient = await models.Patient.findOne({ 
        where: { user_id: req.user.user_id } 
      });
      if (patient) {
        whereClause.patient_id = patient.patient_id;
      }
    }

    const prescriptions = await models.Prescription.findAll({
      where: whereClause,
      include: [
        {
          model: models.Patient,
          include: [{
            model: models.User,
            attributes: ['name', 'email']
          }]
        },
        {
          model: models.Doctor,
          include: [{
            model: models.User,
            attributes: ['name']
          }]
        },
        {
          model: models.Appointment
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { prescriptions }
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const { prescription_id } = req.params;
    const { dosage, frequency, duration, instructions, end_date, is_active, refills } = req.body;

    const prescription = await models.Prescription.findByPk(prescription_id, {
      include: [{
        model: models.Doctor,
        where: { user_id: req.user.user_id }
      }]
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found or access denied'
      });
    }

    await prescription.update({
      dosage: dosage || prescription.dosage,
      frequency: frequency || prescription.frequency,
      duration: duration || prescription.duration,
      instructions: instructions || prescription.instructions,
      end_date: end_date || prescription.end_date,
      is_active: is_active !== undefined ? is_active : prescription.is_active,
      refills: refills !== undefined ? refills : prescription.refills
    });

    const updatedPrescription = await models.Prescription.findByPk(prescription_id, {
      include: [
        {
          model: models.Patient,
          include: [{
            model: models.User,
            attributes: ['name', 'email']
          }]
        },
        {
          model: models.Doctor,
          include: [{
            model: models.User,
            attributes: ['name']
          }]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Prescription updated successfully',
      data: { prescription: updatedPrescription }
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};