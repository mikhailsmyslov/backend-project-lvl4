import ensureAuth from '../../lib/ensureAuth';
import { User, Task, Status, Tag } from '../../db/models';
import buildFormObj from '../../lib/formObjectBuilder';
import parseFormData from '../../lib/parseFormData';

const defaultStatusId = 1;
const defaultCreatorId = 'all';
const defaultAssigneeId = 'all';
const defaultTagId = 'all';

const getTagsInstances = async tagsString => {
  if (!tagsString) return [];
  const tagsPromises = tagsString.split(',').map(t => Tag.findOrCreate({ where: { name: t } }));
  const tagList = await Promise.all(tagsPromises);
  return tagList.map(([tagInstance]) => tagInstance);
};

const applyTaskFilters = async (ctx, next) => {
  const { query } = ctx.request;
  const {
    user: { id: currentUserId }
  } = ctx.state;
  const {
    creatorId = defaultCreatorId,
    assigneeId = defaultAssigneeId,
    statusId = defaultStatusId,
    tagId = defaultTagId
  } = query;

  const tasks = await Task.scope(
    { method: ['byStatus', statusId, currentUserId] },
    { method: ['byCreator', creatorId, currentUserId] },
    { method: ['byAssignee', assigneeId, currentUserId] },
    { method: ['byTag', tagId, currentUserId] }
  ).findAll();

  const users = await User.findAll();
  const statuses = await Status.findAll();
  const tags = await Tag.findAll();
  const filters = buildFormObj({ statusId, creatorId, assigneeId, tagId });
  ctx.state.query = query;
  ctx.state.filteredData = { users, statuses, tasks, tags, filters };
  await next();
};

export default router => {
  router
    .use('/tasks', ensureAuth, applyTaskFilters)

    .get('tasks', '/tasks', async ctx => ctx.render('tasks'))

    .get('newTask', '/tasks/new', async ctx => {
      const formObj = buildFormObj({ statusId: defaultStatusId });
      await ctx.render('tasks/new', { formObj, creator: ctx.state.user });
    })

    .get('editTask', '/tasks/:id', async ctx => {
      const { id } = ctx.params;
      const task = await Task.findByPk(ctx.params.id);
      const taskTags = await task.getTags();
      const creator = await task.getCreator({ scope: null });
      const assignees = await task.getAssignees();
      const assigneeId = assignees.map(({ id: byId }) => byId);
      const taskTagsString = taskTags.map(t => t.name).join();
      const formObj = buildFormObj({ ...task.dataValues, tags: taskTagsString, assigneeId });
      await ctx.render('tasks/edit', { formObj, creator, selectedTaskId: Number(id) });
    })

    .post('createTask', '/tasks', async ctx => {
      const form = parseFormData(ctx.request.body);
      const task = await Task.build({ creatorId: ctx.state.user.id, ...form });
      const tags = await getTagsInstances(form.tags);
      const { query } = ctx.request;
      try {
        await task.save();
        await task.addAssignees(form.assigneeId);
        await task.addTags(tags);
        ctx.flash('info', 'Task has been created');
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
      const form = parseFormData(ctx.request.body);
      const { name, description, startDate, endDate, statusId } = form;
      const { id } = ctx.params;
      const task = await Task.findByPk(id);
      const tags = await getTagsInstances(form.tags);
      const { query } = ctx.request;
      try {
        await task.update({ name, description, startDate, endDate, statusId });
        await task.setTags(tags);
        await task.setAssignees(form.assigneeId || null);
        ctx.flash('info', 'Task has been updated');
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
      ctx.flash('info', 'Task has been deleted');
      ctx.redirect(router.url('tasks', { ...ctx.request.query }));
    });
};
