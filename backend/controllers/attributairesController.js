const Attributaires = require('../models/Attributaires');
const IlotsLots = require('../models/IlotsLots');
const { Op } = require('sequelize');

// Get all attributaires
exports.getAllAttributaires = async (req, res) => {
  try {
    const attributaires = await Attributaires.findAll({
      include: [{
        model: IlotsLots,
        as: 'ilotsLots',
        include: ['lotissement']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(attributaires);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des attributaires',
      error: error.message
    });
  }
};

// Get single attributaire
exports.getAttributaireById = async (req, res) => {
  try {
    const attributaire = await Attributaires.findByPk(req.params.id, {
      include: [{
        model: IlotsLots,
        as: 'ilotsLots',
        include: ['lotissement']
      }]
    });
    
    if (!attributaire) {
      return res.status(404).json({ message: 'Attributaire non trouvé' });
    }
    
    res.json(attributaire);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération de l\'attributaire',
      error: error.message
    });
  }
};

// Get attributaires by ilot-lot
exports.getAttributairesByIlotLot = async (req, res) => {
  try {
    const { ilotsLotsId } = req.params;
    const attributaires = await Attributaires.findAll({
      where: { ilotsLotsId },
      include: [{
        model: IlotsLots,
        as: 'ilotsLots',
        include: ['lotissement']
      }],
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });
    res.json(attributaires);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des attributaires',
      error: error.message
    });
  }
};

// Create new attributaire
exports.createAttributaire = async (req, res) => {
  try {
    // Vérifier si l'ilot-lot existe
    const ilotLot = await IlotsLots.findByPk(req.body.ilotsLotsId);
    if (!ilotLot) {
      return res.status(404).json({ message: 'Ilot/Lot non trouvé' });
    }

    // Vérifier le nombre total d'attributaires pour cet ilot-lot
    const currentCount = await Attributaires.count({
      where: { ilotsLotsId: req.body.ilotsLotsId }
    });

    if (currentCount >= ilotLot.nombreTotalAttributaires) {
      return res.status(400).json({
        message: 'Le nombre maximum d\'attributaires pour cet ilot/lot est atteint'
      });
    }

    const attributaire = await Attributaires.create(req.body);
    
    // Mettre à jour le nombre d'attributaires de l'ilot-lot
    await ilotLot.update({
      nombreTotalAttributaires: currentCount + 1
    });

    res.status(201).json({
      message: 'Attributaire créé avec succès',
      data: attributaire
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
        message: 'Ce numéro de pièce d\'identité est déjà utilisé'
      });
    }
    res.status(500).json({
      message: 'Erreur lors de la création de l\'attributaire',
      error: error.message
    });
  }
};

// Update attributaire
exports.updateAttributaire = async (req, res) => {
  try {
    const attributaire = await Attributaires.findByPk(req.params.id);
    
    if (!attributaire) {
      return res.status(404).json({ message: 'Attributaire non trouvé' });
    }

    await attributaire.update(req.body);
    
    res.json({
      message: 'Attributaire mis à jour avec succès',
      data: attributaire
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({
      message: 'Erreur lors de la mise à jour de l\'attributaire',
      error: error.message
    });
  }
};

// Delete attributaire
exports.deleteAttributaire = async (req, res) => {
  try {
    const attributaire = await Attributaires.findByPk(req.params.id);
    
    if (!attributaire) {
      return res.status(404).json({ message: 'Attributaire non trouvé' });
    }

    const ilotLot = await IlotsLots.findByPk(attributaire.ilotsLotsId);
    
    await attributaire.destroy();
    
    // Mettre à jour le nombre d'attributaires de l'ilot-lot
    if (ilotLot) {
      const currentCount = await Attributaires.count({
        where: { ilotsLotsId: ilotLot.id }
      });
      await ilotLot.update({
        nombreTotalAttributaires: currentCount
      });
    }

    res.json({ message: 'Attributaire supprimé avec succès' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la suppression de l\'attributaire',
      error: error.message
    });
  }
};

// Search attributaires
exports.searchAttributaires = async (req, res) => {
  try {
    const { query } = req.query;
    const attributaires = await Attributaires.findAll({
      where: {
        [Op.or]: [
          { nom: { [Op.like]: `%${query}%` } },
          { prenom: { [Op.like]: `%${query}%` } },
          { numPieceIdentite: { [Op.like]: `%${query}%` } },
          { telephoneMobile: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [{
        model: IlotsLots,
        as: 'ilotsLots',
        include: ['lotissement']
      }]
    });
    res.json(attributaires);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la recherche des attributaires',
      error: error.message
    });
  }
};
