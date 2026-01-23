const Treatment = require("./model");
const { Op } = require("sequelize");

exports.create = async (data) => {
  return Treatment.create(data);
};

exports.get = async (condition) => {
  return Treatment.findAll(condition);
};

exports.findOne = async (condition) => {
  return Treatment.findOne(condition);
};

exports.getSum = async (condition) => {
  return Treatment.sum(condition);
};

exports.update = async (data, condition) => {
  return Treatment.update(data, condition);
};

exports.remove = async (condition) => {
  return Treatment.destroy(condition);
};

exports.sum = async (data, query) => {
  return await Treatment.sum(data, query);
};

exports.getByStatus = async (treatmentPlanId, status) => {
  return Treatment.findAll({
    where: { treatmentPlanId, status },
    order: [["createdAt", "ASC"]],
  });
};

exports.getTreatmentStats = async (patientId) => {
  const [total, completed, pending] = await Promise.all([
    Treatment.count({
      include: [{ association: "treatmentPlan", where: { patientId }, attributes: [] }],
    }),
    Treatment.count({
      where: { status: "completed" },
      include: [{ association: "treatmentPlan", where: { patientId }, attributes: [] }],
    }),
    Treatment.count({
      where: { status: { [Op.in]: ["pending", "in-progress"] } },
      include: [{ association: "treatmentPlan", where: { patientId }, attributes: [] }],
    }),
  ]);
  return { total, completed, pending };
};
