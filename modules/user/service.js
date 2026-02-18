const User = require("./model");
const { Op } = require("sequelize");

exports.create = async (data) => {
  return User.create(data);
};

exports.get = async (condition) => {
  return User.findAll(condition);
};

exports.findOne = async (condition) => {
  return User.findOne(condition);
};

exports.update = async (id, data) => {
  return User.update(data, { where: { id } });
};

exports.remove = async (id) => {
  return User.destroy({ where: { id } });
};

exports.count = async (condition) => {
  return User.count(condition);
};

exports.hardRemove = async (id) => {
  return User.destroy({ where: { id }, force: true });
};

exports.restore = async (id) => {
  return User.restore({ where: { id } });
};

exports.findByPhone = async (phone) => {
  return User.findOne({ where: { phone } });
};

exports.getActiveUsers = async () => {
  return User.findAll({
    where: { isActive: true },
    order: [["createdAt", "DESC"]],
  });
};

exports.getUserStats = async () => {
  const [total, active] = await Promise.all([
    User.count(),
    User.count({ where: { isActive: true } }),
  ]);
  return { total, active, inactive: total - active };
};
