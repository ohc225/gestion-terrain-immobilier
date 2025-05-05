const express = require('express');
const router = express.Router();
const {
  getAllIlotsLots,
  getIlotLotById,
  getIlotsLotsByLotissement,
  createIlotLot,
  updateIlotLot,
  deleteIlotLot,
  searchIlotsLots
} = require('../controllers/ilotsLotsController');

// Route pour rechercher des ilots/lots
router.get('/search', searchIlotsLots);

// Route pour obtenir tous les ilots/lots
router.get('/', getAllIlotsLots);

// Route pour obtenir les ilots/lots d'un lotissement spécifique
router.get('/lotissement/:lotissementId', getIlotsLotsByLotissement);

// Route pour obtenir un ilot/lot spécifique
router.get('/:id', getIlotLotById);

// Route pour créer un nouveau ilot/lot
router.post('/', createIlotLot);

// Route pour mettre à jour un ilot/lot
router.put('/:id', updateIlotLot);

// Route pour supprimer un ilot/lot
router.delete('/:id', deleteIlotLot);

module.exports = router;
