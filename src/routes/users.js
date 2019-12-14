import _ from 'lodash';
import ensureAuth from '../../lib/ensureAuth';
import { User } from '../../db/models';
import buildFormObj from '../../lib/formObjectBuilder';
import encrypt from '../../lib/secure';

export default router => {
  router
    .use('/users', async (ctx, next) => {
      ctx.state.currentPath = ctx.path;
      await next();
    })

    .get('users', '/users', async ctx => {
      const users = await User.findAll();
      await ctx.render('users', { users });
    })

    .get('newUser', '/users/new', async ctx => {
      const formObj = buildFormObj({});
      await ctx.render('users/new', { formObj });
    })

    .get('editUser', '/users/profile', ensureAuth, async ctx => {
      const formObj = buildFormObj(ctx.state.user);
      await ctx.render('users/profile', { formObj });
    })

    .get('showUser', '/users/:id', ensureAuth, async ctx => {
      const { id } = ctx.params;
      const userToShow = await User.findByPk(id);
      const users = await User.findAll();
      await ctx.render('users', { users, userToShow });
    })

    .post('users', '/users', async ctx => {
      const {
        request: { body: form }
      } = ctx;
      const { email } = form;
      const deletedUser = await User.scope('deleted').findOne({ where: { email } });
      const user = !deletedUser ? await User.build(form) : deletedUser;
      try {
        if (deletedUser) {
          user.restore();
          await user.save();
          await user.update(form);
        } else {
          user.save();
        }
        ctx.flash('info', 'User has been created');
        ctx.redirect(router.url('root'));
      } catch (error) {
        const formObj = buildFormObj(user, error);
        await ctx.render('users/new', { formObj });
      }
    })

    .put('editUser', '/users/profile', ensureAuth, async ctx => {
      const {
        request: { body: form }
      } = ctx;
      const { id, email } = ctx.state.user;
      try {
        await User.update({ ...form }, { where: { id } });
        ctx.flash('info', 'Profile successfuly updated');
        if (email !== form.email) {
          ctx.flash('warning', 'E-mail was changed, please, sign in using updated e-mail.');
          ctx.logout();
          ctx.redirect('/');
          return;
        }
        ctx.redirect('profile');
      } catch (error) {
        const formObj = buildFormObj(form, error);
        await ctx.render('users/profile', { formObj });
      }
    })

    .patch('editUser', '/users/profile', ensureAuth, async ctx => {
      const {
        request: { body: form }
      } = ctx;
      const { oldPassword, newPassword, confirmPassword } = form;
      const { passwordDigest, id } = ctx.state.user;
      const errors = [];
      if (encrypt(oldPassword) !== passwordDigest) {
        errors.push({
          path: 'oldPassword',
          message: 'Wrong password'
        });
      }
      if (newPassword !== confirmPassword) {
        errors.push({
          path: 'confirmPassword',
          message: 'Password confirmation wrong'
        });
      }
      if (!_.isEmpty(errors)) {
        const formObj = buildFormObj({}, { errors });
        await ctx.render('users/profile', { formObj });
        return;
      }
      try {
        await User.update({ password: newPassword }, { where: { id } });
        ctx.flash('info', 'Password successfuly changed. Please log in using new password');
        ctx.logout();
        ctx.redirect('/');
      } catch (error) {
        const formObj = buildFormObj({}, error);
        await ctx.render('users/profile', { formObj });
      }
    })

    .delete('editUser', '/users/profile', ensureAuth, async ctx => {
      const { user } = ctx.state;
      await user.softDelete();
      await user.setAssignedTasks([]);
      await user.save();
      ctx.flash('info', 'Account has been successfully deleted');
      ctx.logout();
      ctx.redirect('/');
    });
};
