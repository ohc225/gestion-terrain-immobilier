const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/db');
const lotissementRoutes = require('./routes/lotissementRoutes');
const ilotsLotsRoutes = require('./routes/ilotsLotsRoutes');
const attributairesRoutes = require('./routes/attributairesRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/lotissements', lotissementRoutes);
app.use('/api/ilots-lots', ilotsLotsRoutes);
app.use('/api/attributaires', attributairesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue!' });
});

const PORT = process.env.PORT || 5000;

// Database connection and server start
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}).catch(err => {
  console.error('Erreur de connexion à la base de données:', err);
});
