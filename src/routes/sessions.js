import passport from 'koa-passport';
import buildFormObj from '../../lib/formObjectBuilder';
import ensureAuth from '../../lib/ensureAuth';

export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      const formObj = buildFormObj({});
      await ctx.render('sessions/new', { formObj });
    })

    .post('createSession', '/session', async (ctx) => passport.authenticate('local', {
      successRedirect: router.url('root'),
      failureRedirect: router.url('newSession'),
      failureFlash: ctx.t('flash:auth.failure'),
      successFlash: ctx.t('flash:auth.success'),
    })(ctx))

    .delete('deleteSession', '/session', ensureAuth, (ctx) => {
      ctx.logout();
      ctx.redirect(router.url('root'));
    });
};
