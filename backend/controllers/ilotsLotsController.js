const IlotsLots = require('../models/IlotsLots');
const Lotissement = require('../models/Lotissement');
const { Op } = require('sequelize');

// Get all ilots-lots
exports.getAllIlotsLots = async (req, res) => {
  try {
    const ilotsLots = await IlotsLots.findAll({
      include: [{
        model: Lotissement,
        as: 'lotissement',
        attributes: ['nomLotissement', 'localite']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(ilotsLots);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des ilots et lots',
      error: error.message
    });
  }
};

// Get single ilot-lot
exports.getIlotLotById = async (req, res) => {
  try {
    const ilotLot = await IlotsLots.findByPk(req.params.id, {
      include: [
        {
          model: Lotissement,
          as: 'lotissement',
          attributes: ['nomLotissement', 'localite']
        },
        {
          model: Attributaires,
          as: 'attributaires'
        }
      ]
    });
    
    if (!ilotLot) {
      return res.status(404).json({ message: 'Ilot/Lot non trouvé' });
    }
    
    res.json(ilotLot);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération de l\'ilot/lot',
      error: error.message
    });
  }
};

// Get ilots-lots by lotissement
exports.getIlotsLotsByLotissement = async (req, res) => {
  try {
    const { lotissementId } = req.params;
    const ilotsLots = await IlotsLots.findAll({
      where: { lotissementId },
      include: [{
        model: Lotissement,
        as: 'lotissement',
        attributes: ['nomLotissement', 'localite']
      }],
      order: [['ilot', 'ASC'], ['lot', 'ASC']]
    });
    res.json(ilotsLots);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des ilots et lots',
      error: error.message
    });
  }
};

// Create new ilot-lot
exports.createIlotLot = async (req, res) => {
  try {
    // Vérifier si le lotissement existe
    const lotissement = await Lotissement.findByPk(req.body.lotissementId);
    if (!lotissement) {
      return res.status(404).json({ message: 'Lotissement non trouvé' });
    }

    const ilotLot = await IlotsLots.create(req.body);
    
    res.status(201).json({
      message: 'Ilot/Lot créé avec succès',
      data: ilotLot
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Cet ilot/lot existe déjà dans ce lotissement'
      });
    }
    res.status(500).json({
      message: 'Erreur lors de la création de l\'ilot/lot',
      error: error.message
    });
  }
};

// Update ilot-lot
exports.updateIlotLot = async (req, res) => {
  try {
    const ilotLot = await IlotsLots.findByPk(req.params.id);
    
    if (!ilotLot) {
      return res.status(404).json({ message: 'Ilot/Lot non trouvé' });
    }

    await ilotLot.update(req.body);
    
    res.json({
      message: 'Ilot/Lot mis à jour avec succès',
      data: ilotLot
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({
      message: 'Erreur lors de la mise à jour de l\'ilot/lot',
      error: error.message
    });
  }
};

// Delete ilot-lot
exports.deleteIlotLot = async (req, res) => {
  try {
    const ilotLot = await IlotsLots.findByPk(req.params.id);
    
    if (!ilotLot) {
      return res.status(404).json({ message: 'Ilot/Lot non trouvé' });
    }

    await ilotLot.destroy();
    
    res.json({ message: 'Ilot/Lot supprimé avec succès' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la suppression de l\'ilot/lot',
      error: error.message
    });
  }
};

// Search ilots-lots
exports.searchIlotsLots = async (req, res) => {
  try {
    const { query } = req.query;
    const ilotsLots = await IlotsLots.findAll({
      where: {
        [Op.or]: [
          { ilot: { [Op.like]: `%${query}%` } },
          { lot: { [Op.like]: `%${query}%` } },
          { idUFCI: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [{
        model: Lotissement,
        as: 'lotissement',
        attributes: ['nomLotissement', 'localite']
      }]
    });
    res.json(ilotsLots);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la recherche des ilots et lots',
      error: error.message
    });
  }
};
