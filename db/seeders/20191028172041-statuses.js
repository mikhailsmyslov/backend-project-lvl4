module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'Statuses',
      [
        {
          name: 'Active',
          color: '#80bfff',
          state: 'default',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Completed',
          color: '#b3ffb3',
          state: 'default',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Canceled',
          color: '#eaeae1',
          state: 'default',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'In progress',
          color: '#ffffb3',
          state: 'default',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('Statuses', null, {});
  }
};
