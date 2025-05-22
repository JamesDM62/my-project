'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spotId: {
        type: Sequelize.INTEGER,
        references: { model: 'Spots', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      review: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      stars: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);

    await queryInterface.addConstraint(
      process.env.NODE_ENV === 'production' ? `${process.env.SCHEMA}.Reviews` : 'Reviews',
      {
        fields: ['userId', 'spotId'],
        type: 'unique',
        name: 'user_spot_unique_constraint'
      }
    );
    

    // await queryInterface.addConstraint('my_project_schema.Reviews', {
    //   fields: ['userId', 'spotId'],
    //   type: 'unique',
    //   name: 'user_spot_unique_constraint'
    // }, options);
  },

  // async down(queryInterface, Sequelize) {
  //   options.tableName = "Reviews";
  //   if (process.env.NODE_ENV === 'production') {
  //     options.schema = process.env.SCHEMA;  // Ensure correct schema
  //   }
  //   return queryInterface.dropTable(options);
  // }

  async down(queryInterface, Sequelize) {
    options.tableName = "Reviews";
    // await queryInterface.removeConstraint('my_project_schema.Reviews', 'Reviews_spotId_fkey');
    // await queryInterface.removeConstraint('my_project_schema.Reviews', 'Reviews_userId_fkey');
    return queryInterface.dropTable(options);
  }
};
