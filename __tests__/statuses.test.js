import request from 'supertest';
import Router from 'koa-router';
import { generateFakeStatus, generateFakeUser } from './utils';
import app from '../src/server';
import { Status, User, sequelize } from '../db/models';
import setRoutes from '../src/routes';

let server;
let authenticatedAgent;
let customStatus;
let registeredUser;
let router;

beforeAll(() => {
  router = new Router();
  registeredUser = generateFakeUser();
  setRoutes(router);
});

beforeEach(async () => {
  await sequelize.sync({ force: true, logging: false });
  await User.create(registeredUser, { logging: false });
  customStatus = await Status.create({ ...generateFakeStatus() });
  server = await app().listen();
  authenticatedAgent = request.agent(server);
  await authenticatedAgent.post(router.url('createSession')).send(registeredUser);
});

afterEach(async () => {
  await server.close();
});

test('Protected routes', async () => {
  const failRes = await request.agent(server).get(router.url('statuses'));
  expect(failRes.status).toBe(302);
});

test('Create status', async () => {
  const status = generateFakeStatus();
  const res = await authenticatedAgent.post(router.url('createStatus')).send(status);
  const { count } = await Status.findAndCountAll({ where: { name: status.name } });
  expect(res.status).toBe(302);
  expect(count).not.toBe(0);
});

test('Show status', async () => {
  const res = await authenticatedAgent.get(router.url('showStatus', customStatus.id));
  expect(res.status).toBe(200);
  expect(res.text).toEqual(expect.stringContaining('Status details'));
});

test('Update status', async () => {
  const expectedColor = 'black';
  const res = await authenticatedAgent
    .patch(router.url('updateStatus', customStatus.id))
    .send({ color: expectedColor });
  expect(res.status).toBe(302);
  const updatedStatus = await Status.findByPk(customStatus.id);
  expect(updatedStatus.color).toEqual(expectedColor);
});

test('Delete status', async () => {
  const res = await authenticatedAgent.delete(router.url('deleteStatus', customStatus.id));
  expect(res.status).toBe(302);
  const { count } = await Status.findAndCountAll({ where: { id: customStatus.id } });
  expect(count).toEqual(0);
});

test('Should not modify default status', async () => {
  const defaultStatus = await Status.create({ ...generateFakeStatus(), state: 'default' });
  const res = await authenticatedAgent.delete(router.url('deleteStatus', defaultStatus.id));
  expect(res.status).toBe(302);
  const { count } = await Status.findAndCountAll({ where: { id: defaultStatus.id } });
  expect(count).not.toBe(0);
});
