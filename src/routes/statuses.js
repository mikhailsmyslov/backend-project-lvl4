import buildFormObj from '../../lib/formObjectBuilder';
import ensureAuth from '../../lib/ensureAuth';
import { Status } from '../../db/models';

const ensureEditable = async (ctx, next) => {
  const { id } = ctx.params;
  const status = await Status.findByPk(id);
  if (!status.isDefault) {
    await next();
    return;
  }
  ctx.flash('warning', ctx.t('flash:statuses.defaultStatusModifiactionForbidden'));
  ctx.redirect('back');
};

export default router => {
  router
    .use('/statuses', ensureAuth, async (ctx, next) => {
      const statuses = await Status.findAll();
      ctx.state.statuses = statuses;
      await next();
    })

    .get('statuses', '/statuses', async ctx => ctx.render('statuses'))

    .get('newStatus', '/statuses/new', async ctx =>
      ctx.render('statuses/new', { formObj: buildFormObj({ color: '#fff' }) })
    )

    .get('editStatus', '/statuses/:id', async ctx => {
      const { id } = ctx.params;
      const status = await Status.findByPk(id);
      const formObj = buildFormObj(status);
      await ctx.render('statuses/edit', { formObj, selectedStatusId: Number(id) });
    })

    .post('createStatus', '/statuses', async ctx => {
      const form = ctx.request.body;
      const status = await Status.build({ ...form });
      try {
        await status.save();
        ctx.flash('info', ctx.t('flash:statuses.created'));
        ctx.redirect(router.url('editStatus', status.id));
      } catch (error) {
        const formObj = buildFormObj(status, error);
        await ctx.render('statuses/edit', { formObj });
      }
    })

    .patch('updateStatus', '/statuses/:id', ensureEditable, async ctx => {
      const { id } = ctx.params;
      const form = ctx.request.body;
      const { name, color } = form;
      const status = await Status.findByPk(id);
      try {
        await status.update({ name, color });
        ctx.flash('info', ctx.t('flash:statuses.updated'));
        ctx.redirect(router.url('editStatus', id));
      } catch (error) {
        const formObj = buildFormObj({ ...status.dataValues, ...form }, error);
        await ctx.render('statuses/edit', { formObj });
      }
    })

    .delete('deleteStatus', '/statuses/:id', ensureEditable, async ctx => {
      const { id } = ctx.params;
      await Status.destroy({ where: { id } });
      ctx.flash('info', ctx.t('flash:statuses.deleted'));
      ctx.redirect(router.url('statuses'));
    });
};
