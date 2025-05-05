const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lotissement = sequelize.define('Lotissement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nomLotissement: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom du lotissement est requis' }
    }
  },
  localite: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La localité est requise' }
    }
  },
  typeLotissement: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le type de lotissement est requis' }
    }
  },
  circonscriptionFonciere: {
    type: DataTypes.STRING,
    allowNull: false
  },
  superficieEnHectare: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'La superficie doit être positive' }
    }
  },
  nombreIlotsTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Le nombre d\'ilots doit être positif' }
    }
  },
  nombreLotsTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Le nombre de lots doit être positif' }
    }
  },
  village: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nomChefVillage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nomPresidentComiteGestionFonciere: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numArreteNominationChefVillage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numArreteApprobationLotissement: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateApprobationLotissement: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: { msg: 'Format de date invalide' }
    }
  }
}, {
  timestamps: true,
  tableName: 'lotissements'
});

module.exports = Lotissement;
