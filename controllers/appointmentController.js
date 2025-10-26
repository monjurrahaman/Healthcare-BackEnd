import models from '../models/index.js';

export const createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, type, reason, duration } = req.body;

    // Check if patient exists
    const patient = await models.Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if doctor exists and is available
    const doctor = await models.Doctor.findByPk(doctor_id, {
      include: [{
        model: models.User,
        attributes: ['name']
      }]
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (!doctor.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available for appointments'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await models.Appointment.findOne({
      where: {
        doctor_id,
        appointment_date,
        appointment_time,
        status: ['scheduled', 'confirmed']
      }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Doctor already has an appointment at this time'
      });
    }

    const appointment = await models.Appointment.create({
      patient_id,
      doctor_id,
      created_by: req.user.user_id,
      appointment_date,
      appointment_time,
      type: type || 'in-person',
      reason,
      duration: duration || 30
    });

    const newAppointment = await models.Appointment.findByPk(appointment.appointment_id, {
      include: [
        {
          model: models.Patient,
          include: [{
            model: models.User,
            attributes: ['name', 'email', 'phone']
          }]
        },
        {
          model: models.Doctor,
          include: [{
            model: models.User,
            attributes: ['name', 'email', 'phone']
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment: newAppointment }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const { status, date, patient_id, doctor_id } = req.query;
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (date) {
      whereClause.appointment_date = date;
    }

    if (patient_id) {
      whereClause.patient_id = patient_id;
    }

    if (doctor_id) {
      whereClause.doctor_id = doctor_id;
    }

    const appointments = await models.Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: models.Patient,
          include: [{
            model: models.User,
            attributes: ['name', 'email', 'phone']
          }]
        },
        {
          model: models.Doctor,
          include: [{
            model: models.User,
            attributes: ['name', 'email', 'phone']
          }]
        }
      ],
      order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
    });

    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    const appointment = await models.Appointment.findByPk(appointment_id, {
      include: [
        {
          model: models.Patient,
          include: [{
            model: models.User,
            attributes: { exclude: ['password'] }
          }]
        },
        {
          model: models.Doctor,
          include: [{
            model: models.User,
            attributes: { exclude: ['password'] }
          }]
        },
        {
          model: models.Prescription
        },
        {
          model: models.Bill
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { appointment_date, appointment_time, type, reason, notes, duration } = req.body;

    const appointment = await models.Appointment.findByPk(appointment_id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if the user has permission to update this appointment
    if (req.user.role === 'doctor' && appointment.doctor_id !== req.user.Doctor?.doctor_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own appointments.'
      });
    }

    if (req.user.role === 'patient' && appointment.patient_id !== req.user.Patient?.patient_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own appointments.'
      });
    }

    await appointment.update({
      appointment_date: appointment_date || appointment.appointment_date,
      appointment_time: appointment_time || appointment.appointment_time,
      type: type || appointment.type,
      reason: reason || appointment.reason,
      notes: notes || appointment.notes,
      duration: duration || appointment.duration
    });

    const updatedAppointment = await models.Appointment.findByPk(appointment_id, {
      include: [
        {
          model: models.Patient,
          include: [{
            model: models.User,
            attributes: ['name', 'email', 'phone']
          }]
        },
        {
          model: models.Doctor,
          include: [{
            model: models.User,
            attributes: ['name', 'email', 'phone']
          }]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { cancellation_reason } = req.body;

    const appointment = await models.Appointment.findByPk(appointment_id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if the user has permission to cancel this appointment
    if (req.user.role === 'doctor' && appointment.doctor_id !== req.user.Doctor?.doctor_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own appointments.'
      });
    }

    if (req.user.role === 'patient' && appointment.patient_id !== req.user.Patient?.patient_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own appointments.'
      });
    }

    await appointment.update({
      status: 'cancelled',
      notes: cancellation_reason ? `Cancelled: ${cancellation_reason}` : appointment.notes
    });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};