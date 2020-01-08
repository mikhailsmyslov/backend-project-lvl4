import faker from 'faker';

export const generateFakeUser = () => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email().toLowerCase(),
  password: faker.internet.password(),
  state: 'active'
});

export const generateFaketask = () => ({
  name: faker.lorem.sentence(),
  description: faker.lorem.sentences()
});

export const generateFakeStatus = () => ({
  name: faker.lorem.word().toLowerCase(),
  color: 'white',
  state: 'custom'
});
