const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const IlotsLots = require('./IlotsLots');

const Attributaires = sequelize.define('Attributaires', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  typePersonne: {
    type: DataTypes.ENUM('Physique', 'Morale'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le type de personne est requis' }
    }
  },
  genre: {
    type: DataTypes.ENUM('Masculin', 'Féminin', 'Autre'),
    allowNull: true
  },
  civilite: {
    type: DataTypes.ENUM('M.', 'Mme', 'Mlle', 'Dr', 'Pr'),
    allowNull: true
  },
  denomination: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Pour les personnes morales uniquement'
  },
  numRegistreCommerce: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Pour les sociétés uniquement'
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom est requis' }
    }
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateNaissance: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: { msg: 'Format de date invalide' }
    }
  },
  lieuNaissance: {
    type: DataTypes.STRING,
    allowNull: true
  },
  typePieceIdentite: {
    type: DataTypes.ENUM('CNI', 'Passeport', 'Permis', 'Autre'),
    allowNull: false
  },
  numPieceIdentite: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le numéro de pièce d\'identité est requis' }
    }
  },
  dateDelivrancePieceIdentite: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: { msg: 'Format de date invalide' }
    }
  },
  telephoneMobile: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le numéro de téléphone est requis' },
      is: {
        args: /^\+225\s\d{2}\s\d{2}\s\d{2}\s\d{4}$/,
        msg: 'Format de téléphone invalide (+225 XX XX XX XXXX)'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: { msg: 'Format d\'email invalide' }
    }
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'L\'adresse est requise' }
    }
  },
  paysResidence: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Côte d\'Ivoire'
  },
  nationalite: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ilotsLotsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: IlotsLots,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'attributaires',
  indexes: [
    {
      unique: true,
      fields: ['numPieceIdentite']
    }
  ]
});

// Définir la relation avec IlotsLots
Attributaires.belongsTo(IlotsLots, {
  foreignKey: 'ilotsLotsId',
  as: 'ilotsLots'
});

IlotsLots.hasMany(Attributaires, {
  foreignKey: 'ilotsLotsId',
  as: 'attributaires'
});

module.exports = Attributaires;
