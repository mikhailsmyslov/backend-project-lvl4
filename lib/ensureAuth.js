export default (ctx, next) => {
  if (ctx.isAuthenticated()) return next();
  ctx.flash('error', 'Please, Log In first');
  return ctx.redirect('back');
};
