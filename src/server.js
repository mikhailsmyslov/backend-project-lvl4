import '../lib/initEnvVars';
import Koa from 'koa';
import session from 'koa-session';
import flash from 'koa-better-flash';
import Router from 'koa-router';
import Rollbar from 'rollbar';
import Pug from 'koa-pug';
import path from 'path';
import _ from 'lodash';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import methodOverride from 'koa-methodoverride';
import passport from 'koa-passport';
import logger from 'koa-logger';
import moment from 'moment';
import configRouting from './routes';
import configAuth from './auth';

const app = new Koa();
const router = new Router();
const rollbar = new Rollbar({
  accessToken: process.env.PORTPOST_SERVER_ITEM_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true
});
const pug = new Pug({
  viewPath: path.resolve(__dirname, '../views'),
  noCache: process.env.NODE_ENV === 'development',
  debug: false,
  pretty: true,
  compileDebug: false,
  locals: {
    bsAlertClasses: ['info', 'success', 'danger', 'warning']
  },
  basedir: path.resolve(__dirname, '../views'),
  helperPath: [{ _ }, { urlFor: (...args) => router.url(...args) }, { moment }]
});

export default () => {
  app.use(logger()).use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      rollbar.error(err, ctx.request);
    }
  });
  app.keys = [process.env.SECRET_HMAC_KEY];
  app.use(session({}, app));
  app.use(bodyParser());
  app.use(flash());
  configAuth(passport);
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(async (ctx, next) => {
    ctx.state = {
      ...ctx.state,
      flashMessages: ctx.flash(),
      isSignedIn: () => ctx.isAuthenticated()
    };
    await next();
  });
  app.use(methodOverride(({ body }) => _.get(body, '_method', null)));
  app.use(serve(path.resolve(__dirname, '../public')));

  configRouting(router);
  app.use(router.routes()).use(router.allowedMethods());

  pug.use(app);

  return app;
};
