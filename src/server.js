import Koa from 'koa';
import Router from 'koa-router';
import Rollbar from 'rollbar';
import dotenv from 'dotenv';
import Pug from 'koa-pug';
import path from 'path';
import _ from 'lodash';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import setRoutes from './routes';

dotenv.config();

const app = new Koa();
const router = new Router();
const rollbar = new Rollbar({
  accessToken: process.env.PORTPOST_SERVER_ITEM_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

export default () => {
  setRoutes(router);
  app
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        rollbar.error(err, ctx.request);
      }
    })
    .use(bodyParser())
    .use(serve(path.resolve(__dirname, '../public')))
    .use(router.routes())
    .use(router.allowedMethods());

  const pug = new Pug({
    viewPath: path.resolve(__dirname, '../views'),
    noCache: process.env.NODE_ENV === 'development',
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    basedir: path.resolve(__dirname, '../views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
    ],
  });
  pug.use(app);

  return app;
};
