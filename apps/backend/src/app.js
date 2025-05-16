const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const excelRoutes = require('./routes/excel');
const inversionesRoutes = require('./routes/inversiones.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/inversiones', inversionesRoutes);

module.exports = app; 