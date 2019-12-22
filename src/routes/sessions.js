import passport from 'koa-passport';
import buildFormObj from '../../lib/formObjectBuilder';
import ensureAuth from '../../lib/ensureAuth';

export default router => {
  router
    .get('newSession', '/session/new', async ctx => {
      const formObj = buildFormObj({});
      await ctx.render('sessions/new', { formObj });
    })

    .post(
      'createSession',
      '/session',
      passport.authenticate('local', {
        successRedirect: router.url('root'),
        failureRedirect: router.url('newSession'),
        failureFlash: 'Invalid email or password',
        successFlash: 'Successfuly signed in'
      })
    )

    .delete('deleteSession', '/session', ensureAuth, ctx => {
      ctx.logout();
      ctx.redirect(router.url('root'));
    });
};
