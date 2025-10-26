import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MedicalRecord = sequelize.define('MedicalRecord', {
  record_id: {
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
  record_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  record_type: {
    type: DataTypes.ENUM('diagnosis', 'treatment', 'surgery', 'allergy', 'immunization', 'vital_signs', 'progress_note'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  medications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vital_signs: {
    type: DataTypes.JSON,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true
  },
  is_confidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'medical_records',
  timestamps: true
});

export default MedicalRecord;