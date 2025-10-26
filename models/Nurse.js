import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Nurse = sequelize.define('Nurse', {
  nurse_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  license_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  years_of_experience: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  shift: {
    type: DataTypes.ENUM('morning', 'evening', 'night'),
    allowNull: true
  }
}, {
  tableName: 'nurses',
  timestamps: true
});

export default Nurse;