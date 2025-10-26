import models from '../models/index.js';

export const getPatientProfile = async (req, res) => {
  try {
    const patient = await models.Patient.findOne({
      where: { user_id: req.user.user_id },
      include: [
        {
          model: models.User,
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      data: { patient }
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateMedicalHistory = async (req, res) => {
  try {
    const { allergies, current_medications, medical_conditions } = req.body;
    const patient = await models.Patient.findOne({ 
      where: { user_id: req.user.user_id } 
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    await patient.update({
      allergies: allergies || patient.allergies,
      current_medications: current_medications || patient.current_medications,
      medical_conditions: medical_conditions || patient.medical_conditions
    });

    res.json({
      success: true,
      message: 'Medical history updated successfully',
      data: { patient }
    });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const patient = await models.Patient.findOne({ 
      where: { user_id: req.user.user_id } 
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const appointments = await models.Appointment.findAll({
      where: { patient_id: patient.patient_id },
      include: [
        {
          model: models.Doctor,
          include: [{
            model: models.User,
            attributes: ['name', 'email', 'phone']
          }]
        },
        {
          model: models.Patient,
          include: [{
            model: models.User,
            attributes: ['name', 'email', 'phone']
          }]
        }
      ],
      order: [['appointment_date', 'DESC']]
    });

    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getPatientPrescriptions = async (req, res) => {
  try {
    const patient = await models.Patient.findOne({ 
      where: { user_id: req.user.user_id } 
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const prescriptions = await models.Prescription.findAll({
      where: { patient_id: patient.patient_id },
      include: [
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
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getPatientLabResults = async (req, res) => {
  try {
    const patient = await models.Patient.findOne({ 
      where: { user_id: req.user.user_id } 
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const labResults = await models.LabResult.findAll({
      where: { patient_id: patient.patient_id },
      include: [
        {
          model: models.Doctor,
          include: [{
            model: models.User,
            attributes: ['name']
          }]
        }
      ],
      order: [['test_date', 'DESC']]
    });

    res.json({
      success: true,
      data: { labResults }
    });
  } catch (error) {
    console.error('Get patient lab results error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getPatientBills = async (req, res) => {
  try {
    const patient = await models.Patient.findOne({ 
      where: { user_id: req.user.user_id } 
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const bills = await models.Bill.findAll({
      where: { patient_id: patient.patient_id },
      include: [
        {
          model: models.Appointment
        }
      ],
      order: [['bill_date', 'DESC']]
    });

    res.json({
      success: true,
      data: { bills }
    });
  } catch (error) {
    console.error('Get patient bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};