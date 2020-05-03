export const up = (queryInterface, Sequelize) => queryInterface.createTable('clubs', {
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

  name: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: true,
  },

  slug: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: true,
  },

  location: {
    type: Sequelize.GEOMETRY('POINT', 4326),
    allowNull: false,
  },

  type: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
}, { charset: 'utf-8' });

export const down = (queryInterface) => queryInterface.dropTable('clubs');
