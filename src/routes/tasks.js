import _ from 'lodash';
import ensureAuth from '../../lib/ensureAuth';
import { User, Task, Status, Tag } from '../../db/models';
import buildFormObj from '../../lib/formObjectBuilder';

const defaultFilters = {
  creatorId: 'all',
  assigneeId: 'all',
  statusId: 'active',
  tagId: 'all'
};

const getTagsInstances = async tagsString => {
  if (!tagsString) return [];
  const tagsPromises = tagsString.split(',').map(t => Tag.findOrCreate({ where: { name: t } }));
  const tagList = await Promise.all(tagsPromises);
  return tagList.map(([tagInstance]) => tagInstance);
};

const getFilteredData = async ctx => {
  const { query } = ctx.request;
  const { user } = ctx.state;
  const { creatorId, assigneeId, statusId, tagId } = { ...defaultFilters, ...query };
  const tasks = await Task.scope(
    { method: ['byStatus', statusId] },
    { method: ['byCreator', creatorId === 'me' ? user.id : creatorId] },
    { method: ['byAssignee', assigneeId === 'me' ? user.id : assigneeId] },
    { method: ['byTag', tagId] }
  ).findAll();

  const users = await User.findAll();
  const statuses = await Status.findAll();
  const tags = await Tag.findAll();
  const filters = buildFormObj({ statusId, creatorId, assigneeId, tagId });
  return { users, statuses, tasks, tags, filters, query };
};

export default router => {
  router
    .use('/tasks', ensureAuth)

    .get('tasks', '/tasks', async ctx => {
      const filteredData = await getFilteredData(ctx);
      await ctx.render('tasks', { ...filteredData });
    })

    .get('newTask', '/tasks/new', async ctx => {
      const formObj = buildFormObj({ statusId: defaultFilters.statusId });
      const filteredData = await getFilteredData(ctx);
      await ctx.render('tasks/new', { formObj, creator: ctx.state.user, ...filteredData });
    })

    .get('editTask', '/tasks/:id', async ctx => {
      const task = await Task.findByPk(ctx.params.id);
      const taskTags = await task.getTags();
      const creator = await task.getCreator({ scope: null });
      const assignees = await task.getAssignees();
      const assigneeId = assignees.map(({ id: byId }) => byId);
      const taskTagsString = taskTags.map(t => t.name).join();
      const formObj = buildFormObj({ ...task.dataValues, tags: taskTagsString, assigneeId });
      const filteredData = await getFilteredData(ctx);
      await ctx.render('tasks/edit', {
        formObj,
        creator,
        ...filteredData
      });
    })

    .post('createTask', '/tasks', async ctx => {
      const form = _.omitBy(ctx.request.body, _.isEmpty);
      const task = await Task.build({ creatorId: ctx.state.user.id, ...form });
      const tags = await getTagsInstances(form.tags);
      const { query } = ctx.request;
      try {
        await task.save();
        await task.addAssignees(form.assigneeId);
        await task.addTags(tags);
        ctx.flash('info', ctx.t('flash:tasks.created'));
        ctx.redirect(router.url('editTask', task.id, { query }));
      } catch (error) {
        const formObj = buildFormObj(form, error);
        await ctx.render('tasks/new', {
          formObj,
          creator: ctx.state.user
        });
      }
    })

    .patch('updateTask', '/tasks/:id', async ctx => {
      const form = _.omitBy(ctx.request.body, _.isEmpty);
      const { name, description, startDate, endDate, statusId } = form;
      const { id } = ctx.params;
      const task = await Task.findByPk(id);
      const tags = await getTagsInstances(form.tags);
      const { query } = ctx.request;
      try {
        await task.update({ name, description, startDate, endDate, statusId });
        await task.setTags(tags);
        await task.setAssignees(form.assigneeId || null);
        ctx.flash('info', ctx.t('flash:tasks.updated'));
        ctx.redirect(router.url('editTask', task.id, { query }));
      } catch (error) {
        const formObj = buildFormObj({ ...task.dataValues, ...form }, error);
        const creator = await task.getCreator();
        await ctx.render('tasks/edit', { formObj, creator, selectedTaskId: Number(id) });
      }
    })

    .delete('deleteTask', '/tasks/:id', async ctx => {
      const { id } = ctx.params;
      await Task.destroy({ where: { id } });
      ctx.flash('info', ctx.t('flash:tasks.deleted'));
      ctx.redirect(router.url('tasks', ctx.request.query));
    });
};
