module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('TaskTags', {
      taskId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Tasks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tagId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Tags',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
    .then(() => queryInterface.addConstraint('TaskTags', ['taskId', 'tagId'], {
      type: 'primary key',
    })),
  down: (queryInterface) => queryInterface.dropTable('TaskTags'),
};
