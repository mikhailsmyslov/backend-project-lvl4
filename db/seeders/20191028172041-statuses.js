module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'Statuses',
      [
        {
          name: 'Active',
          color: '#80bfff',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Completed',
          color: '#b3ffb3',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Canceled',
          color: '#eaeae1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'In progress',
          color: '#ffffb3',
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
