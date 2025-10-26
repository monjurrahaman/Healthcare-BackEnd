// admin.js
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import db from './config/database.js'; // your Sequelize instance
import models from './models/index.js';

// Register Sequelize adapter
AdminJS.registerAdapter(AdminJSSequelize);

const adminJs = new AdminJS({
  databases: [db], // pass the Sequelize instance
  rootPath: '/admin',
  resources: [
    models.User,
    models.Patient,
    models.Doctor,
    models.Nurse,
    models.Appointment,
    models.Prescription,
    models.LabResult,
    models.Bill,
    models.MedicalRecord,
  ], // you can list your Sequelize models here
  branding: {
    companyName: 'Admin dashboard',
    logo: false,
    softwareBrothers: false,
  },
});

const adminRouter = AdminJSExpress.buildRouter(adminJs);

export { adminJs, adminRouter };
