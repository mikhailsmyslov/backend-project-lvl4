import _ from 'lodash';
import ensureAuth from '../../lib/ensureAuth';
import { User } from '../../db/models';
import buildFormObj from '../../lib/formObjectBuilder';
import encrypt from '../../lib/secure';

export default router => {
  router
    .get('users', '/users', async ctx => {
      const users = await User.findAll();
      await ctx.render('users', { users });
    })

    .get('newUser', '/users/new', async ctx => {
      const formObj = buildFormObj({});
      await ctx.render('users/new', { formObj });
    })

    .get('editUser', '/users/edit', ensureAuth, async ctx => {
      const formObj = buildFormObj(ctx.state.user);
      await ctx.render('users/edit', { formObj });
    })

    .get('showUser', '/users/:id', ensureAuth, async ctx => {
      const { id } = ctx.params;
      const userToShow = await User.findByPk(id);
      const users = await User.findAll();
      await ctx.render('users/show', { users, userToShow });
    })

    .post('createUser', '/users', async ctx => {
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
          await user.save();
        }
        ctx.flash('info', ctx.t('flash:users.created'));
        ctx.redirect(router.url('root'));
      } catch (error) {
        const formObj = buildFormObj(user, error);
        await ctx.render('users/new', { formObj });
      }
    })

    .put('editUser', '/users/edit', ensureAuth, async ctx => {
      const {
        request: { body: form }
      } = ctx;
      const { firstName, lastName, email: newEmail } = form;
      const { id, email: oldEmail } = ctx.state.user;
      try {
        await User.update({ firstName, lastName, email: newEmail }, { where: { id } });
        ctx.flash('info', ctx.t('flash:users.updated'));
        if (newEmail !== oldEmail) {
          ctx.flash('warning', ctx.t('flash:users.emailChanged'));
          ctx.logout();
          ctx.redirect(router.url('root'));
          return;
        }
        ctx.redirect('edit');
      } catch (error) {
        const formObj = buildFormObj(form, error);
        await ctx.render('users/edit', { formObj });
      }
    })

    .patch('editUser', '/users/edit', ensureAuth, async ctx => {
      const {
        request: { body: form }
      } = ctx;
      const { oldPassword, newPassword, confirmPassword } = form;
      const { passwordDigest, id } = ctx.state.user;
      const errors = [];
      if (encrypt(oldPassword) !== passwordDigest) {
        errors.push({
          path: 'oldPassword',
          message: ctx.t('errors:users.password')
        });
      }
      if (newPassword !== confirmPassword) {
        errors.push({
          path: 'confirmPassword',
          message: ctx.t('errors:users.passwordConfirmation')
        });
      }
      if (!_.isEmpty(errors)) {
        const formObj = buildFormObj({}, { errors });
        await ctx.render('users/edit', { formObj });
        return;
      }
      try {
        await User.update({ password: newPassword }, { where: { id } });
        ctx.flash('info', ctx.t('flash:users.passwordChanged'));
        ctx.logout();
        ctx.redirect(router.url('root'));
      } catch (error) {
        const formObj = buildFormObj({}, error);
        await ctx.render('users/edit', { formObj });
      }
    })

    .delete('editUser', '/users/edit', ensureAuth, async ctx => {
      const { user } = ctx.state;
      await user.softDelete();
      await user.setAssignedTasks([]);
      await user.save();
      ctx.flash('info', ctx.t('flash:users.deleted'));
      ctx.logout();
      ctx.redirect(router.url('root'));
    });
};
