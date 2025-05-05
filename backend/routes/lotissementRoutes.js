const express = require('express');
const router = express.Router();
const {
  getAllLotissements,
  getLotissementById,
  createLotissement,
  updateLotissement,
  deleteLotissement,
  searchLotissements
} = require('../controllers/lotissementController');

// Route pour rechercher des lotissements
router.get('/search', searchLotissements);

// Route pour obtenir tous les lotissements
router.get('/', getAllLotissements);

// Route pour obtenir un lotissement spécifique
router.get('/:id', getLotissementById);

// Route pour créer un nouveau lotissement
router.post('/', createLotissement);

// Route pour mettre à jour un lotissement
router.put('/:id', updateLotissement);

// Route pour supprimer un lotissement
router.delete('/:id', deleteLotissement);

module.exports = router;
