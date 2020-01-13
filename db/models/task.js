import Sequelize from 'sequelize';

const { Op } = Sequelize;

const unassignedTasksSelector = {
  id: { [Sequelize.Op.notIn]: [Sequelize.literal('SELECT "taskId" FROM "TaskAssignees"')] },
};

const slugColName = 'name';

const buildFinderObj = (association) => (selector) => {
  switch (selector) {
    case 'all':
      return { include: [{ association, where: null }] };
    case 'unassigned':
      return { where: unassignedTasksSelector };
    default:
      if (RegExp(/^\D*$/).test(selector)) {
        return {
          include: [
            {
              association,
              where: Sequelize.where(
                Sequelize.fn('lower', Sequelize.col([association, slugColName].join('.'))),
                {
                  [Op.in]: [selector].flat(),
                },
              ),
            },
          ],
        };
      }
      return { include: [{ association, where: { id: selector } }] };
  }
};

const mapScopesToAssociations = {
  byCreator: 'Creator',
  byAssignee: 'Assignees',
  byTag: 'Tags',
  byStatus: 'Status',
};

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    'Task',
    {
      name: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      description: DataTypes.TEXT,
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: true,
        },
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: true,
        },
      },
    },
    {},
  );
  Task.associate = (models) => {
    Task.belongsTo(models.Status, { as: 'Status', foreignKey: 'statusId' });
    Task.belongsToMany(models.Tag, {
      as: 'Tags',
      through: 'TaskTags',
      foreignKey: 'taskId',
      otherKey: 'tagId',
    });
    Task.belongsTo(models.User, { as: 'Creator', foreignKey: 'creatorId' });
    Task.belongsToMany(models.User, {
      as: 'Assignees',
      through: 'TaskAssignees',
      foreignKey: 'taskId',
      otherKey: 'assigneeId',
    });
  };

  Object.entries(mapScopesToAssociations)
    .forEach(([scopeName, association]) => Task.addScope(scopeName, buildFinderObj(association)));
  return Task;
};
