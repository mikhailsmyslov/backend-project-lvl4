import ensureAuth from '../../lib/ensureAuth';
import { User, Task, Status, Tag } from '../../db/models';
import buildFormObj from '../../lib/formObjectBuilder';

const getTagsInstances = async tagsString => {
  if (!tagsString) return [];
  const tagsPromises = tagsString.split(',').map(t => Tag.findOrCreate({ where: { name: t } }));
  const tagList = await Promise.all(tagsPromises);
  return tagList.map(([tagInstance]) => tagInstance);
};

const applyTaskFilters = async (ctx, next) => {
  const filters = {
    creatorId: null,
    assigneeId: null,
    statusId: null,
    tagId: null,
    ...ctx.request.query
  };
  const tasks = await Task.findAll({
    include: [
      {
        association: 'Status',
        where: filters.statusId ? { id: filters.statusId } : null
      },
      {
        association: 'Assignees',
        where: filters.assigneeId ? { id: filters.assigneeId } : null
      },
      {
        association: 'Creator',
        where: filters.creatorId ? { id: filters.creatorId } : null
      },
      {
        association: 'Tags',
        where: filters.tagId ? { id: filters.tagId } : null
      }
    ]
  });
  const users = await User.findAll();
  const statuses = await Status.findAll();
  const tags = await Tag.findAll();
  ctx.state.query = ctx.request.query;
  ctx.state.filteredData = { users, statuses, tasks, tags, filters: buildFormObj(filters) };
  await next();
};

export default router => {
  router
    .use('/tasks', ensureAuth)
    .use('/tasks', applyTaskFilters)
    .use('/tasks', async (ctx, next) => {
      ctx.state.currentPath = ctx.path;
      await next();
    })
    .use('/tasks', async (ctx, next) => {
      const form = ctx.request.body;
      if (!form) {
        await next();
        return;
      }
      Object.entries(form).forEach(([key, value]) => {
        if (value === '') form[key] = null;
      });
      await next();
    })

    .get('tasks', '/tasks', async ctx => ctx.render('tasks'))

    .get('newTask', '/tasks/new', async ctx => {
      const formObj = buildFormObj({ statusId: 1 });
      await ctx.render('tasks', { formObj, creator: ctx.state.user });
    })

    .get('showTask', '/tasks/:id', async ctx => {
      const task = await Task.findByPk(ctx.params.id);
      const taskTags = await task.getTags();
      const creator = await task.getCreator();
      const assignees = await task.getAssignees();
      const assigneeId = assignees.map(({ id }) => id);
      const taskTagsString = taskTags.map(t => t.name).join();
      const formObj = buildFormObj({ ...task.dataValues, tags: taskTagsString, assigneeId });
      await ctx.render('tasks', { formObj, creator });
    })

    .post('newTask', '/tasks/new', async ctx => {
      const form = ctx.request.body;
      const task = await Task.build({ creatorId: ctx.state.user.id, ...form });
      const tags = await getTagsInstances(form.tags);
      try {
        await task.save();
        await task.addAssignees(form.assigneeId);
        await task.addTags(tags);
        ctx.flash('info', 'Task has been created');
        ctx.redirect(router.url('showTask', task.id));
      } catch (error) {
        const formObj = buildFormObj(form, error);
        await ctx.render('tasks', { formObj, creator: ctx.state.user });
      }
    })

    .patch('updateTask', '/tasks/:id', async ctx => {
      const form = ctx.request.body;
      const { id } = ctx.params;
      const task = await Task.findByPk(id);
      const tags = await getTagsInstances(form.tags);
      try {
        await task.update({ ...form });
        await task.setTags(tags);
        await task.setAssignees(form.assigneeId || []);
        ctx.flash('info', 'Task has been updated');
        ctx.redirect(router.url('showTask', task.id));
      } catch (error) {
        const formObj = buildFormObj({ ...task.dataValues, ...form }, error);
        const creator = await task.getCreator();
        await ctx.render('tasks', { formObj, creator });
      }
    })

    .delete('deleteTask', '/tasks/:id', async ctx => {
      const { id } = ctx.params;
      await Task.destroy({ where: { id } });
      ctx.flash('info', 'Task has been deleted');
      ctx.redirect(router.url('tasks'));
    });
};
