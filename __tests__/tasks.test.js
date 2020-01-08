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
  await authenticatedAgent.post(router.url('createSession')).send(registeredUser);
});

afterEach(async () => {
  await server.close();
});

test('Protected routes', async () => {
  const failRes = await request.agent(server).get(router.url('editTask', initialTask.id));
  expect(failRes.status).toBe(302);
  const successRes = await authenticatedAgent.get(router.url('tasks'));
  expect(successRes.status).toBe(200);
});

test('Create task', async () => {
  const task = generateFaketask();
  const res = await authenticatedAgent.post(router.url('createTask')).send(task);
  const { description } = await Task.findOne({ where: { name: task.name } });
  expect(res.status).toBe(302);
  expect(description).toEqual(task.description);
});

test('Show task', async () => {
  const res = await authenticatedAgent.get(router.url('editTask', initialTask.id));
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
  const task = await Task.findByPk(initialTask.id);
  expect(task).toBe(null);
});
