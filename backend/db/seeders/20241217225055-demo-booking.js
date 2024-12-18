'use strict';

const { Booking } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Booking.bulkCreate([
      {
        spotId: 1,
        userId: 2,
        startDate: '2021-11-19',
        endDate: '2021-11-20'
      },
      {
        spotId: 2,
        userId: 3,
        startDate: '2021-12-10',
        endDate: '2021-12-12'
      },
      {
        spotId: 3,
        userId: 1,
        startDate: '2021-12-15',
        endDate: '2021-12-18'
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      userId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
