module.exports = (sequelize, DataTypes) => {
  const TaskStatus = sequelize.define(
    'Status',
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      color: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      state: {
        type: DataTypes.STRING,
        defaultValue: 'custom'
      }
    },
    {
      getterMethods: {
        isDefault() {
          return this.state === 'default';
        }
      }
    }
  );
  //  TaskStatus.associate = models => {
  // associations can be defined here
  //  };
  return TaskStatus;
};
