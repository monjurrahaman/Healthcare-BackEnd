import models from '../models/index.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalPatients = await models.Patient.count();
    const totalDoctors = await models.Doctor.count();
    const totalNurses = await models.Nurse.count();
    
    // Get appointment statistics
    const totalAppointments = await models.Appointment.count();
    const todayAppointments = await models.Appointment.count({
      where: {
        appointment_date: new Date().toISOString().split('T')[0]
      }
    });
    
    const pendingAppointments = await models.Appointment.count({
      where: { status: 'scheduled' }
    });

    // Get revenue statistics (from bills)
    const revenueResult = await models.Bill.findOne({
      attributes: [
        [models.sequelize.fn('SUM', models.sequelize.col('total_amount')), 'total_revenue'],
        [models.sequelize.fn('SUM', models.sequelize.col('paid_amount')), 'total_paid']
      ]
    });

    const totalRevenue = parseFloat(revenueResult.get('total_revenue')) || 0;
    const totalPaid = parseFloat(revenueResult.get('total_paid')) || 0;

    // Get recent appointments
    const recentAppointments = await models.Appointment.findAll({
      include: [
        {
          model: models.Patient,
          include: [{
            model: models.User,
            attributes: ['name']
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
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalPatients,
          totalDoctors,
          totalNurses,
          totalAppointments,
          todayAppointments,
          pendingAppointments,
          totalRevenue,
          totalPaid,
          outstandingBalance: totalRevenue - totalPaid
        },
        recentAppointments
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role, is_active } = req.query;
    const whereClause = {};

    if (role) {
      whereClause.role = role;
    }

    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    const users = await models.User.findAll({
      where: whereClause,
      include: [
        { model: models.Patient },
        { model: models.Doctor },
        { model: models.Nurse }
      ],
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { is_active } = req.body;

    const user = await models.User.findByPk(user_id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ is_active });

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getFinancialReports = async (req, res) => {
  try {
    const { start_date, end_date, status } = req.query;
    const whereClause = {};

    if (start_date && end_date) {
      whereClause.bill_date = {
        [models.Sequelize.Op.between]: [start_date, end_date]
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const bills = await models.Bill.findAll({
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
          model: models.Appointment
        }
      ],
      order: [['bill_date', 'DESC']]
    });

    // Calculate summary
    const summary = await models.Bill.findOne({
      where: whereClause,
      attributes: [
        [models.sequelize.fn('SUM', models.sequelize.col('total_amount')), 'total_amount'],
        [models.sequelize.fn('SUM', models.sequelize.col('paid_amount')), 'paid_amount'],
        [models.sequelize.fn('SUM', models.sequelize.col('insurance_covered')), 'insurance_covered'],
        [models.sequelize.fn('COUNT', models.sequelize.col('bill_id')), 'total_bills']
      ]
    });

    res.json({
      success: true,
      data: {
        bills,
        summary: {
          total_amount: parseFloat(summary.get('total_amount')) || 0,
          paid_amount: parseFloat(summary.get('paid_amount')) || 0,
          insurance_covered: parseFloat(summary.get('insurance_covered')) || 0,
          total_bills: parseInt(summary.get('total_bills')) || 0,
          outstanding: (parseFloat(summary.get('total_amount')) || 0) - (parseFloat(summary.get('paid_amount')) || 0)
        }
      }
    });
  } catch (error) {
    console.error('Get financial reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};