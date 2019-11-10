import encrypt from '../../lib/secure';

module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'demo@demo.com',
          passwordDigest: encrypt('password'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          firstName: 'Vasya',
          lastName: 'Pupkin',
          email: 'vasya@pupkin.com',
          passwordDigest: encrypt('password'),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
