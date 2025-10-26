import models from '../models/index.js';

export const createLabResult = async (req, res) => {
  try {
    const { patient_id, appointment_id, test_name, test_type, test_date, result_date, results, normal_range, interpretation, lab_notes, status, is_urgent } = req.body;

    let doctor_id = null;
    
    // If user is a doctor, use their ID
    if (req.user.role === 'doctor') {
      const doctor = await models.Doctor.findOne({ 
        where: { user_id: req.user.user_id } 
      });
      if (doctor) {
        doctor_id = doctor.doctor_id;
      }
    }

    const labResult = await models.LabResult.create({
      patient_id,
      doctor_id,
      appointment_id: appointment_id || null,
      test_name,
      test_type,
      test_date: test_date || new Date(),
      result_date: result_date || new Date(),
      results,
      normal_range,
      interpretation,
      lab_notes,
      status: status || 'completed',
      is_urgent: is_urgent || false
    });

    const newLabResult = await models.LabResult.findByPk(labResult.lab_result_id, {
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
      message: 'Lab result created successfully',
      data: { labResult: newLabResult }
    });
  } catch (error) {
    console.error('Create lab result error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getLabResults = async (req, res) => {
  try {
    const { patient_id, status, test_type } = req.query;
    const whereClause = {};

    if (patient_id) {
      whereClause.patient_id = patient_id;
    }

    if (status) {
      whereClause.status = status;
    }

    if (test_type) {
      whereClause.test_type = test_type;
    }

    // If user is a patient, only show their lab results
    if (req.user.role === 'patient') {
      const patient = await models.Patient.findOne({ 
        where: { user_id: req.user.user_id } 
      });
      if (patient) {
        whereClause.patient_id = patient.patient_id;
      }
    }

    const labResults = await models.LabResult.findAll({
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
        }
      ],
      order: [['test_date', 'DESC']]
    });

    res.json({
      success: true,
      data: { labResults }
    });
  } catch (error) {
    console.error('Get lab results error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateLabResult = async (req, res) => {
  try {
    const { lab_result_id } = req.params;
    const { results, normal_range, interpretation, lab_notes, status, is_urgent } = req.body;

    const labResult = await models.LabResult.findByPk(lab_result_id);

    if (!labResult) {
      return res.status(404).json({
        success: false,
        message: 'Lab result not found'
      });
    }

    // Only allow doctors or admins to update lab results
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors and admins can update lab results.'
      });
    }

    await labResult.update({
      results: results || labResult.results,
      normal_range: normal_range || labResult.normal_range,
      interpretation: interpretation || labResult.interpretation,
      lab_notes: lab_notes || labResult.lab_notes,
      status: status || labResult.status,
      is_urgent: is_urgent !== undefined ? is_urgent : labResult.is_urgent
    });

    const updatedLabResult = await models.LabResult.findByPk(lab_result_id, {
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
      message: 'Lab result updated successfully',
      data: { labResult: updatedLabResult }
    });
  } catch (error) {
    console.error('Update lab result error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};