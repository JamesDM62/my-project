'use strict';

const { SpotImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await SpotImage.bulkCreate([
      {
        spotId: 1,
        url: 'https://res.cloudinary.com/duv814uve/image/upload/v1734745343/DALL_E_2024-12-20_19.41.59_-_A_beautiful_vacation_rental_house_in_Southern_California._The_house_has_a_modern_stylish_design_with_large_windows_and_a_spacious_patio._It_s_surroun_dreudy.webp',
        previewImage: true
      },
      {
        spotId: 2,
        url: 'https://res.cloudinary.com/duv814uve/image/upload/v1738695352/pexels-binyaminmellish-106399_ta2a1l.jpg',
        previewImage: true
      },
      {
        spotId: 3,
        url: 'https://res.cloudinary.com/duv814uve/image/upload/v1738695516/pexels-thgusstavo-2102587_iqyojy.jpg',
        previewImage: true
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
