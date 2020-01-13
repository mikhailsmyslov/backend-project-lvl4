module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert(
    'Statuses',
    [
      {
        name: 'active',
        color: '#80bfff',
        state: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'completed',
        color: '#b3ffb3',
        state: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'canceled',
        color: '#eaeae1',
        state: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'in progress',
        color: '#ffffb3',
        state: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {},
  ),

  down: (queryInterface) => queryInterface.bulkDelete('Statuses', null, {}),
};
