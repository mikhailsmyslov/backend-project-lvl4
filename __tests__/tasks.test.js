import request from 'supertest';
import Router from 'koa-router';
import { generateFaketask, generateFakeUser } from './utils';
import app from '../src/server';
import { Task, sequelize } from '../db/models';
import setRoutes from '../src/routes';

let server;
let authenticatedAgent;
let initialTask;
let registeredUser;
let router;

beforeAll(() => {
  router = new Router();
  registeredUser = generateFakeUser();
  setRoutes(router);
});

beforeEach(async () => {
  await sequelize.sync({ force: true, logging: false });
  initialTask = await Task.create(
    {
      ...generateFaketask(),
      Status: {
        name: 'Active',
        color: 'blue'
      },
      Creator: registeredUser
    },
    {
      include: ['Status', 'Creator'],
      logging: false
    }
  );
  server = await app().listen();
  authenticatedAgent = request.agent(server);
  await authenticatedAgent.post('/session').send(registeredUser);
});

afterEach(async () => {
  await server.close();
});

test('Protected routes', async () => {
  const failRes = await request.agent(server).get(router.url('showTask', initialTask.id));
  expect(failRes.status).toBe(302);
  const successRes = await authenticatedAgent.get(router.url('tasks'));
  expect(successRes.status).toBe(200);
});

test('Create task', async () => {
  const task = generateFaketask();
  const res = await authenticatedAgent.post(router.url('newTask')).send(task);
  const { count } = await Task.findAndCountAll({ where: { name: task.name } });
  expect(res.status).toBe(302);
  expect(count).not.toBe(0);
});

test('Show task', async () => {
  const res = await authenticatedAgent.get(router.url('showTask', initialTask.id));
  expect(res.status).toBe(200);
  expect(res.text).toEqual(expect.stringContaining('Task Details'));
});

test('Update task', async () => {
  const expectedTaskName = 'updatedTask';
  const res = await authenticatedAgent
    .patch(router.url('updateTask', initialTask.id))
    .send({ name: expectedTaskName });
  expect(res.status).toBe(302);
  const updatedTask = await Task.findByPk(initialTask.id);
  expect(updatedTask.name).toEqual(expectedTaskName);
});

test('Delete task', async () => {
  const res = await authenticatedAgent.delete(router.url('deleteTask', initialTask.id));
  expect(res.status).toBe(302);
  const { count } = await Task.findAndCountAll({ where: { id: initialTask.id } });
  expect(count).toEqual(0);
});
