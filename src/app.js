import Koa from 'koa';
import Router from 'koa-router';
import setRoutes from './routes';

const app = new Koa();
const router = new Router();

export default () => {
  setRoutes(router);
  app
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
};
