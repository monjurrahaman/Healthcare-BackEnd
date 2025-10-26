import models from '../models/index.js';

export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await models.Doctor.findOne({
      where: { user_id: req.user.user_id },
      include: [
        {
          model: models.User,
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.json({
      success: true,
      data: { doctor }
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const { specialization, license_number, years_of_experience, education, bio, consultation_fee, available_hours, is_available } = req.body;
    
    const doctor = await models.Doctor.findOne({ 
      where: { user_id: req.user.user_id } 
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    await doctor.update({
      specialization: specialization || doctor.specialization,
      license_number: license_number || doctor.license_number,
      years_of_experience: years_of_experience || doctor.years_of_experience,
      education: education || doctor.education,
      bio: bio || doctor.bio,
      consultation_fee: consultation_fee || doctor.consultation_fee,
      available_hours: available_hours || doctor.available_hours,
      is_available: is_available !== undefined ? is_available : doctor.is_available
    });

    const updatedDoctor = await models.Doctor.findOne({
      where: { user_id: req.user.user_id },
      include: [
        {
          model: models.User,
          attributes: { exclude: ['password'] }
        }
      ]
    });

    res.json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: { doctor: updatedDoctor }
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await models.Doctor.findOne({ 
      where: { user_id: req.user.user_id } 
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const { status, date } = req.query;
    const whereClause = { doctor_id: doctor.doctor_id };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (date) {
      whereClause.appointment_date = date;
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
        }
      ],
      order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
    });

    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { status, notes } = req.body;

    const appointment = await models.Appointment.findByPk(appointment_id, {
      include: [
        {
          model: models.Doctor,
          where: { user_id: req.user.user_id }
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await appointment.update({
      status,
      notes: notes || appointment.notes
    });

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getDoctorPatients = async (req, res) => {
  try {
    const doctor = await models.Doctor.findOne({ 
      where: { user_id: req.user.user_id } 
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get unique patients from appointments
    const appointments = await models.Appointment.findAll({
      where: { doctor_id: doctor.doctor_id },
      include: [
        {
          model: models.Patient,
          include: [{
            model: models.User,
            attributes: ['name', 'email', 'phone', 'date_of_birth']
          }]
        }
      ],
      attributes: ['patient_id'],
      group: ['patient_id']
    });

    const patients = appointments.map(appointment => appointment.Patient);

    res.json({
      success: true,
      data: { patients }
    });
  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};