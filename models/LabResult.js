import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LabResult = sequelize.define('LabResult', {
  lab_result_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'patient_id'
    }
  },
  doctor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'doctors',
      key: 'doctor_id'
    }
  },
  appointment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'appointment_id'
    }
  },
  test_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  test_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  test_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  result_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  results: {
    type: DataTypes.JSON,
    allowNull: true
  },
  normal_range: {
    type: DataTypes.JSON,
    allowNull: true
  },
  interpretation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lab_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'abnormal', 'critical'),
    defaultValue: 'pending'
  },
  is_urgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'lab_results',
  timestamps: true
});

export default LabResult;