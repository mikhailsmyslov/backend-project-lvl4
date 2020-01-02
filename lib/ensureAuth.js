export default (ctx, next) => {
  if (ctx.isAuthenticated()) return next();
  ctx.flash('error', ctx.t('flash:auth.logInFirst'));
  return ctx.redirect('back');
};
