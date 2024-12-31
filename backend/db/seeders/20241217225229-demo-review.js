'use strict';

const { Review } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        spotId: 1,  // Assuming spotId 1 exists
        userId: 1,  // Assuming userId 1 exists
        review: 'This was an awesome spot!',
        stars: 4,
      },
      {
        spotId: 2,  // Assuming spotId 2 exists
        userId: 2,  // Assuming userId 2 exists
        review: 'Perfect space for collaboration.',
        stars: 4,
      },
      {
        spotId: 3,  // Assuming spotId 3 exists
        userId: 3,  // Assuming userId 3 exists
        review: 'Nice spot but a bit crowded.',
        stars: 3,
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      review: { [Op.in]: ['This was an awesome spot!', 'Perfect space for collaboration.', 'Nice spot but a bit crowded.'] }
    }, {});
  }
};
