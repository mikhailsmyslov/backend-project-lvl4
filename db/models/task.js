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
        validate: {
          isDate: true
        }
      },
      endDate: {
        type: DataTypes.DATE,
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
  return Task;
};
