import faker from 'faker';

export const generateFakeUser = () => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password()
});

export const generateFaketask = () => ({
  name: faker.lorem.sentence(),
  description: faker.lorem.sentences(),
  state: 'active'
});

export const generateFakeStatus = () => ({
  name: faker.lorem.word(),
  color: 'white',
  protected: 'custom'
});
