export const up = (queryInterface, Sequelize) => queryInterface.createTable('users', {
  uuid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },

  created: {
    type: Sequelize.DATE,
  },
  updated: {
    type: Sequelize.DATE,
  },

  email: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: true,
  },

  hashed_password: Sequelize.STRING,
  salt: Sequelize.STRING,

  type: {
    type: Sequelize.STRING,
    defaultValue: 'user',
    allowNull: false,
  },

  first_name: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },

  last_name: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },

  phone: {
    type: Sequelize.STRING(30),
    allowNull: true,
  },

  last_login: Sequelize.DATE,
}, { charset: 'utf-8' });

export const down = (queryInterface) => queryInterface.dropTable('users');
