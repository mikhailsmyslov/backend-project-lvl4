import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../src/app';


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

afterEach((done) => {
  server.close();
  done();
});
