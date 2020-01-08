import request from 'supertest';
import Router from 'koa-router';
import { generateFakeUser } from './utils';
import app from '../src/server';
import { User, sequelize } from '../db/models';
import setRoutes from '../src/routes';
import encrypt from '../lib/secure';

let server;
let authenticatedAgent;
let registeredUser;
let router;

beforeAll(() => {
  router = new Router();
  setRoutes(router);
  registeredUser = generateFakeUser();
});

beforeEach(async () => {
  await sequelize.sync({ force: true, logging: false });
  await User.create(registeredUser, { logging: false });
  server = await app().listen();
  authenticatedAgent = request.agent(server);
  await authenticatedAgent.post(router.url('createSession')).send(registeredUser);
});

afterEach(async () => {
  await server.close();
});

describe('Authentication is not required', () => {
  test('User Create', async () => {
    const user = generateFakeUser();
    const res = await request
      .agent(server)
      .post(router.url('createUser'))
      .send(user);
    const dbUser = await User.findOne({ where: { email: user.email } });
    expect(res.status).toBe(302);
    expect(user.firstName).toEqual(dbUser.firstName);
  });

  test('Show users', async () => {
    const res = await request.agent(server).get(router.url('users'));
    expect(res.status).toBe(200);
    expect(res.text).toEqual(expect.stringContaining('data-table'));
  });

  test('User sign in', async () => {
    const successRes = await request
      .agent(server)
      .post(router.url('createSession'))
      .send(registeredUser);
    const failRes = await request
      .agent(server)
      .post(router.url('createSession'))
      .send(generateFakeUser());
    expect(successRes.get('location')).toEqual(router.url('root'));
    expect(failRes.get('location')).not.toEqual(router.url('root'));
  });
});

describe('Authentication required', () => {
  test('Show user profile', async () => {
    const res = await authenticatedAgent.get(router.url('editUser'));
    expect(res.status).toBe(200);
    expect(res.text).toEqual(expect.stringContaining('Profile Details'));
  });

  test('Update user e-mail', async () => {
    const modifiedUser = generateFakeUser();
    const res = await authenticatedAgent.put(router.url('editUser')).send(modifiedUser);
    const oldUser = await User.findOne({
      where: { email: registeredUser.email }
    });
    const newUser = await User.findOne({
      where: { email: modifiedUser.email }
    });
    expect(oldUser).toBe(null);
    expect(res.status).toBe(302);
    expect(newUser.lastName).toEqual(modifiedUser.lastName);
  });

  test('Update user password', async () => {
    const newPassword = 'newPassword';
    const newPasswordDigest = encrypt(newPassword);
    const passwordForm = {
      oldPassword: registeredUser.password,
      newPassword,
      confirmPassword: newPassword
    };
    await authenticatedAgent.patch(router.url('editUser')).send(passwordForm);
    const { passwordDigest } = await User.findOne({
      where: { email: registeredUser.email }
    });
    expect(passwordDigest).toEqual(newPasswordDigest);
  });

  test('User delete', async () => {
    const res = await authenticatedAgent.delete(router.url('editUser'));
    const user = await User.findOne({ where: { email: registeredUser.email } });
    expect(res.status).toBe(302);
    expect(user).toBe(null);
  });

  test('User log out', async () => {
    const beforeLogOut = await authenticatedAgent.get(router.url('root'));
    await authenticatedAgent.delete(router.url('deleteSession'));
    const afterLogout = await authenticatedAgent.get(router.url('root'));
    expect(beforeLogOut.text).toEqual(expect.not.stringContaining('avatar'));
    expect(afterLogout).toEqual(expect.not.stringContaining('avatar'));
  });
});
