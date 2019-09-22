import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../src/server';


let server;

beforeAll(() => {
  expect.extend(matchers);
});

beforeEach(() => {
  server = app().listen();
});

test('GET 200', async () => {
  const res = await request.agent(server).get('/');
  expect(res).toHaveHTTPStatus(200);
});

test('GET 404', async () => {
  const res = await request.agent(server)
    .get('/wrong-path');
  expect(res).toHaveHTTPStatus(404);
});

afterEach((done) => {
  server.close();
  done();
});
