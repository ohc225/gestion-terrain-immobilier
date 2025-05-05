const express = require('express');
const router = express.Router();
const {
  getAllAttributaires,
  getAttributaireById,
  getAttributairesByIlotLot,
  createAttributaire,
  updateAttributaire,
  deleteAttributaire,
  searchAttributaires
} = require('../controllers/attributairesController');

// Route pour rechercher des attributaires
router.get('/search', searchAttributaires);

// Route pour obtenir tous les attributaires
router.get('/', getAllAttributaires);

// Route pour obtenir les attributaires d'un ilot/lot spécifique
router.get('/ilot-lot/:ilotsLotsId', getAttributairesByIlotLot);

// Route pour obtenir un attributaire spécifique
router.get('/:id', getAttributaireById);

// Route pour créer un nouvel attributaire
router.post('/', createAttributaire);

// Route pour mettre à jour un attributaire
router.put('/:id', updateAttributaire);

// Route pour supprimer un attributaire
router.delete('/:id', deleteAttributaire);

module.exports = router;
