const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Lotissement = require('./Lotissement');

const IlotsLots = sequelize.define('IlotsLots', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ilot: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le numéro d\'ilot est requis' }
    }
  },
  lot: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le numéro de lot est requis' }
    }
  },
  idUFCI: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'L\'IDUFCI est requis' }
    }
  },
  superficieEnM2: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'La superficie doit être positive' }
    }
  },
  usage: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'L\'usage est requis' }
    }
  },
  nombreTotalAttributaires: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Le nombre d\'attributaires doit être positif' }
    }
  },
  numTitreFoncier: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateTitreFoncier: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: { msg: 'Format de date invalide' }
    }
  },
  numParcelleCadastrale: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numSection: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lotissementId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Lotissement,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'ilots_lots',
  indexes: [
    {
      unique: true,
      fields: ['ilot', 'lot', 'lotissementId']
    }
  ]
});

// Définir la relation avec Lotissement
IlotsLots.belongsTo(Lotissement, {
  foreignKey: 'lotissementId',
  as: 'lotissement'
});

Lotissement.hasMany(IlotsLots, {
  foreignKey: 'lotissementId',
  as: 'ilotsLots'
});

module.exports = IlotsLots;
