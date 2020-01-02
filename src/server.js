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
import koaI18next from 'koa-i18next';
import moment from 'moment';
import i18next from 'i18next';
import Backend from 'i18next-sync-fs-backend';
import configAuth from './auth';
import configRouting from './routes';

i18next.use(Backend).init({
  debug: process.env.NODE_ENV === 'development',
  backend: {
    loadPath: path.resolve(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    addPath: path.resolve(__dirname, '../locales/{{lng}}/{{ns}}.missing.json')
  },
  interpolation: {
    format: (value, format) => {
      if (value instanceof Date) return moment(value).format(format);
      return value;
    }
  },
  preload: ['en', 'ru'],
  fallbackLng: 'en',
  lng: 'en',
  ns: ['common', 'flash', 'errors', 'forms', 'statuses', 'tasks', 'users', 'wellcome'],
  initImmediate: false
});
i18next.on('languageChanged', lng => moment.locale(lng));

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
  helperPath: [{ _ }, { urlFor: (...args) => router.url(...args) }]
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
  app.use(
    koaI18next(i18next, {
      lookupCookie: 'lang',
      order: ['cookie'],
      next: true
    })
  );
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
      isSignedIn: () => ctx.isAuthenticated(),
      t: ctx.t
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
