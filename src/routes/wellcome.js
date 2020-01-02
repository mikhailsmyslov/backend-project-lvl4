export default router => {
  router
    .get('root', '/', async ctx => ctx.render('wellcome'))
    .get('lang', '/lang/:lng', async ctx => {
      const { lng } = ctx.params;
      ctx.cookies.set('lang', lng, { maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
      await ctx.redirect('back');
    });
};
