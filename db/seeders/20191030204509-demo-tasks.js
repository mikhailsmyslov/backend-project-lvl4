import faker from 'faker';
import models from '../models';

module.exports = {
  up: () => Promise.all([
    models.Task.create(
      {
        name: faker.lorem.sentence(),
        description: faker.lorem.sentences(),
        statusId: 1,
        creatorId: 1,
        Tags: [
          {
            name: faker.lorem.word(),
          },
          {
            name: faker.lorem.word(),
          },
        ],
      },
      {
        include: ['Tags'],
      },
    ),
    models.Task.create(
      {
        name: faker.lorem.sentence(),
        description: faker.lorem.sentences(),
        statusId: 2,
        creatorId: 2,
        Tags: [
          {
            name: faker.lorem.word(),
          },
          {
            name: faker.lorem.word(),
          },
        ],
      },
      {
        include: ['Tags'],
      },
    ),
  ]),

  down: (queryInterface) => Promise.all([
    queryInterface.bulkDelete('Tasks', null, {}),
    queryInterface.bulkDelete('Tags', null, {}),
    queryInterface.bulkDelete('TaskTags', null, {}),
    queryInterface.bulkDelete('TasksAssignees', null, {}),
  ]),
};
