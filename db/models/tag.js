module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    'Tag',
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          notEmpty: true
        }
      }
    },
    {}
  );
  //  Tag.associate = models => {
  // associations can be defined here
  //  };
  return Tag;
};
