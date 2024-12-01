const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true },
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('SuperAdmin', 'Validador', 'Gestor', 'Consultor'),
    allowNull: false,
  },
  estatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

// Hook para cifrar contraseñas antes de guardar
Usuario.beforeCreate(async (usuario) => {
  usuario.password_hash = await bcrypt.hash(usuario.password_hash, 10);
});

module.exports = Usuario;
