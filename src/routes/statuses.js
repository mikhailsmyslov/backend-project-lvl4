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
  ctx.flash('warning', 'Defaut statuses can not be edited or updated');
  ctx.redirect('back');
};

export default router => {
  router
    .use('/statuses', ensureAuth)
    .use('/statuses', async (ctx, next) => {
      const statuses = await Status.findAll();
      ctx.state.statuses = statuses;
      await next();
    })
    .use('/statuses', async (ctx, next) => {
      ctx.state.currentPath = ctx.path;
      await next();
    })

    .get('statuses', '/statuses', async ctx => ctx.render('statuses'))

    .get('newStatus', '/statuses/new', async ctx =>
      ctx.render('statuses', { formObj: buildFormObj({ color: '#fff' }) })
    )

    .get('showStatus', '/statuses/:id', async ctx => {
      const { id } = ctx.params;
      const status = await Status.findByPk(id);
      const formObj = buildFormObj(status);
      await ctx.render('statuses', { formObj });
    })

    .post('createStatus', '/statuses', async ctx => {
      const form = ctx.request.body;
      const status = await Status.build({ ...form });
      try {
        await status.save();
        ctx.flash('info', 'Status has been created');
        ctx.redirect(router.url('showStatus', status.id));
      } catch (error) {
        const formObj = buildFormObj(status, error);
        await ctx.render('statuses', { formObj });
      }
    })

    .patch('updateStatus', '/statuses/:id', ensureEditable, async ctx => {
      const { id } = ctx.params;
      const form = ctx.request.body;
      const status = await Status.findByPk(id);
      try {
        await status.update({ ...form });
        ctx.flash('info', 'Status has been updated');
        ctx.redirect(router.url('showStatus', id));
      } catch (error) {
        const formObj = buildFormObj({ ...status.dataValues, ...form }, error);
        await ctx.render('statuses', { formObj });
      }
    })

    .delete('deleteStatus', '/statuses/:id', ensureEditable, async ctx => {
      const { id } = ctx.params;
      await Status.destroy({ where: { id } });
      ctx.flash('info', 'Status has been deleted');
      ctx.redirect(router.url('statuses'));
    });
};
