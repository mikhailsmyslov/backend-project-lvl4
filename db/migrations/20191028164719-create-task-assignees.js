module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('TaskAssignees', {
        taskId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Tasks',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        assigneeId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
      .then(() => {
        return queryInterface.addConstraint('TaskAssignees', ['taskId', 'assigneeId'], {
          type: 'primary key'
        });
      });
  },
  down: queryInterface => queryInterface.dropTable('TaskAssignees')
};
