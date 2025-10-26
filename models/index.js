import sequelize from '../config/database.js';
import User from './User.js';
import Patient from './Patient.js';
import Doctor from './Doctor.js';
import Nurse from './Nurse.js';
import Appointment from './Appointment.js';
import Prescription from './Prescription.js';
import LabResult from './LabResult.js';
import Bill from './Bill.js';
import MedicalRecord from './MedicalRecord.js';

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasOne(Patient, { foreignKey: 'user_id' });
  User.hasOne(Doctor, { foreignKey: 'user_id' });
  User.hasOne(Nurse, { foreignKey: 'user_id' });
  
  Patient.belongsTo(User, { foreignKey: 'user_id' });
  Doctor.belongsTo(User, { foreignKey: 'user_id' });
  Nurse.belongsTo(User, { foreignKey: 'user_id' });

  // Appointment associations
  Appointment.belongsTo(Patient, { foreignKey: 'patient_id' });
  Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id' });
  Appointment.belongsTo(User, { foreignKey: 'created_by' });
  
  Patient.hasMany(Appointment, { foreignKey: 'patient_id' });
  Doctor.hasMany(Appointment, { foreignKey: 'doctor_id' });

  //  Prescription associations
  Prescription.belongsTo(Patient, { foreignKey: 'patient_id' });
  Prescription.belongsTo(Doctor, { foreignKey: 'doctor_id' });
  Prescription.belongsTo(Appointment, { foreignKey: 'appointment_id' });
  
  Patient.hasMany(Prescription, { foreignKey: 'patient_id' });
  Doctor.hasMany(Prescription, { foreignKey: 'doctor_id' });
  Appointment.hasMany(Prescription, { foreignKey: 'appointment_id' });

  // Lab Result associations
  LabResult.belongsTo(Patient, { foreignKey: 'patient_id' });
  LabResult.belongsTo(Doctor, { foreignKey: 'doctor_id' });
  LabResult.belongsTo(Appointment, { foreignKey: 'appointment_id' });
  
  Patient.hasMany(LabResult, { foreignKey: 'patient_id' });
  Doctor.hasMany(LabResult, { foreignKey: 'doctor_id' });

  // Bill associations
  Bill.belongsTo(Patient, { foreignKey: 'patient_id' });
  Bill.belongsTo(Appointment, { foreignKey: 'appointment_id' });
  
  Patient.hasMany(Bill, { foreignKey: 'patient_id' });
  Appointment.hasOne(Bill, { foreignKey: 'appointment_id' });

  // Medical Record associations
  MedicalRecord.belongsTo(Patient, { foreignKey: 'patient_id' });
  MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctor_id' });
  
  Patient.hasMany(MedicalRecord, { foreignKey: 'patient_id' });
  Doctor.hasMany(MedicalRecord, { foreignKey: 'doctor_id' });

  // Nurse assists appointments
  Nurse.belongsToMany(Appointment, { 
    through: 'NurseAppointments',
    foreignKey: 'nurse_id',
    otherKey: 'appointment_id'
  });
  
  Appointment.belongsToMany(Nurse, { 
    through: 'NurseAppointments',
    foreignKey: 'appointment_id',
    otherKey: 'nurse_id'
  });
};

const models = {
  User,
  Patient,
  Doctor,
  Nurse,
  Appointment,
  Prescription,
  LabResult,
  Bill,
  MedicalRecord,
  sequelize
};

defineAssociations();

export default models;