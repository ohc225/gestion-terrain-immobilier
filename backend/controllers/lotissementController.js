const Lotissement = require('../models/Lotissement');

// Get all lotissements
exports.getAllLotissements = async (req, res) => {
  try {
    const lotissements = await Lotissement.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(lotissements);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des lotissements',
      error: error.message
    });
  }
};

// Get single lotissement
exports.getLotissementById = async (req, res) => {
  try {
    const lotissement = await Lotissement.findByPk(req.params.id, {
      include: ['ilotsLots']
    });
    
    if (!lotissement) {
      return res.status(404).json({ message: 'Lotissement non trouvé' });
    }
    
    res.json(lotissement);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération du lotissement',
      error: error.message
    });
  }
};

// Create new lotissement
exports.createLotissement = async (req, res) => {
  try {
    const lotissement = await Lotissement.create(req.body);
    res.status(201).json({
      message: 'Lotissement créé avec succès',
      data: lotissement
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({
      message: 'Erreur lors de la création du lotissement',
      error: error.message
    });
  }
};

// Update lotissement
exports.updateLotissement = async (req, res) => {
  try {
    const lotissement = await Lotissement.findByPk(req.params.id);
    
    if (!lotissement) {
      return res.status(404).json({ message: 'Lotissement non trouvé' });
    }

    await lotissement.update(req.body);
    
    res.json({
      message: 'Lotissement mis à jour avec succès',
      data: lotissement
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({
      message: 'Erreur lors de la mise à jour du lotissement',
      error: error.message
    });
  }
};

// Delete lotissement
exports.deleteLotissement = async (req, res) => {
  try {
    const lotissement = await Lotissement.findByPk(req.params.id);
    
    if (!lotissement) {
      return res.status(404).json({ message: 'Lotissement non trouvé' });
    }

    await lotissement.destroy();
    
    res.json({ message: 'Lotissement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la suppression du lotissement',
      error: error.message
    });
  }
};

// Search lotissements
exports.searchLotissements = async (req, res) => {
  try {
    const { query } = req.query;
    const lotissements = await Lotissement.findAll({
      where: {
        [Op.or]: [
          { nomLotissement: { [Op.like]: `%${query}%` } },
          { localite: { [Op.like]: `%${query}%` } },
          { village: { [Op.like]: `%${query}%` } }
        ]
      }
    });
    res.json(lotissements);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la recherche des lotissements',
      error: error.message
    });
  }
};
