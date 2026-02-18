const Admin = require("./model");

exports.create = async (data) => {
  return Admin.create(data);
};

exports.get = async (conditions) => {
  return Admin.findAll(conditions);
};

exports.findOne = async (conditions) => {
  return Admin.findOne(conditions);
};

exports.update = async (data, conditions) => {
  return Admin.update(data, conditions);
};

exports.remove = async (conditions) => {
  return Admin.destroy(conditions);
};

exports.findByEmail = async (email) => {
  return Admin.findOne({ where: { email } });
};

exports.getAdminStats = async () => {
  const total = await Admin.count();
  return { total };
};
