import jwt from 'jsonwebtoken';
import models from '../models/index.js';

const generateToken = (user_id) => {
  return jwt.sign(
    { user_id }, 
    process.env.JWT_SECRET || 'mediconnect_secret', 
    { expiresIn: '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const { email, password, name, phone, date_of_birth, role, ...additionalData } = req.body;

    // Check if user already exists
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await models.User.create({
      email,
      password,
      name,
      phone,
      date_of_birth,
      role
    });

    // Create role-specific profile
    if (role === 'patient') {
      await models.Patient.create({
        user_id: user.user_id,
        ...additionalData
      });
    } else if (role === 'doctor') {
      await models.Doctor.create({
        user_id: user.user_id,
        ...additionalData
      });
    } else if (role === 'nurse') {
      await models.Nurse.create({
        user_id: user.user_id,
        ...additionalData
      });
    }

    const token = generateToken(user.user_id);

    // Update last login
    await user.update({ last_login: new Date() });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await models.User.findOne({ 
      where: { email },
      include: [
        { model: models.Patient },
        { model: models.Doctor },
        { model: models.Nurse }
      ]
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const token = generateToken(user.user_id);

    // Update last login
    await user.update({ last_login: new Date() });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          profile: user.Patient || user.Doctor || user.Nurse
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.user_id, {
      include: [
        { model: models.Patient },
        { model: models.Doctor },
        { model: models.Nurse }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, date_of_birth, ...additionalData } = req.body;
    const user = req.user;

    // Update user basic info
    await user.update({
      name: name || user.name,
      phone: phone || user.phone,
      date_of_birth: date_of_birth || user.date_of_birth
    });

    // Update role-specific profile
    let profile;
    if (user.role === 'patient' && user.Patient) {
      profile = await models.Patient.findByPk(user.Patient.patient_id);
    } else if (user.role === 'doctor' && user.Doctor) {
      profile = await models.Doctor.findByPk(user.Doctor.doctor_id);
    } else if (user.role === 'nurse' && user.Nurse) {
      profile = await models.Nurse.findByPk(user.Nurse.nurse_id);
    }

    if (profile && Object.keys(additionalData).length > 0) {
      await profile.update(additionalData);
    }

    const updatedUser = await models.User.findByPk(user.user_id, {
      include: [
        { model: models.Patient },
        { model: models.Doctor },
        { model: models.Nurse }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};