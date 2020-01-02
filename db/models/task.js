import Sequelize from 'sequelize';

const buildScope = association => (id = null, currentUserId = null) => {
  switch (id) {
    case 'all':
      return { include: [{ association, where: null }] };
    case 'unassigned':
      return {
        where: {
          id: { [Sequelize.Op.notIn]: [Sequelize.literal('SELECT "taskId" FROM "TaskAssignees"')] }
        }
      };
    case 'me':
      return { include: [{ association, where: { id: currentUserId } }] };
    default:
      return { include: [{ association, where: { id } }] };
  }
};

const mapScopesToAssociations = {
  byCreator: 'Creator',
  byAssignee: 'Assignees',
  byTag: 'Tags',
  byStatus: 'Status'
};

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    'Task',
    {
      name: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      description: DataTypes.TEXT,
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }
      }
    },
    {}
  );
  Task.associate = models => {
    Task.belongsTo(models.Status, { as: 'Status', foreignKey: 'statusId' });
    Task.belongsToMany(models.Tag, {
      as: 'Tags',
      through: 'TaskTags',
      foreignKey: 'taskId',
      otherKey: 'tagId'
    });
    Task.belongsTo(models.User, { as: 'Creator', foreignKey: 'creatorId' });
    Task.belongsToMany(models.User, {
      as: 'Assignees',
      through: 'TaskAssignees',
      foreignKey: 'taskId',
      otherKey: 'assigneeId'
    });
  };

  Object.entries(mapScopesToAssociations).forEach(([scopeName, association]) =>
    Task.addScope(scopeName, buildScope(association))
  );
  return Task;
};
