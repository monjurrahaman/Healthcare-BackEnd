import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Prescription = sequelize.define('Prescription', {
  prescription_id: {
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
    allowNull: false,
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
  medication_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  dosage: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  frequency: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  refills: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'prescriptions',
  timestamps: true
});

export default Prescription;