import encrypt from '../../lib/secure';

export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      lastName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      passwordDigest: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      password: {
        type: DataTypes.VIRTUAL,
        set(value) {
          this.setDataValue('passwordDigest', encrypt(value));
          this.setDataValue('password', value);
          return value;
        },
        validate: {
          len: [1, +Infinity]
        }
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active'
      }
    },
    {
      getterMethods: {
        fullName() {
          return `${this.firstName} ${this.lastName}`;
        },
        isActive() {
          return this.state === 'active';
        }
      },
      defaultScope: {
        where: {
          state: 'active'
        }
      }
    }
  );
  User.associate = models => {
    User.hasMany(models.Task, { as: 'CreatedTasks', foreignKey: 'creatorId' });
    User.belongsToMany(models.Task, {
      as: 'AssignedTasks',
      through: 'TaskAssignees',
      foreignKey: 'assigneeId',
      otherKey: 'taskId'
    });
  };
  return User;
};
