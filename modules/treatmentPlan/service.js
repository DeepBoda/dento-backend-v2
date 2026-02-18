const treatmentPlan = require("./model");
const { Op } = require("sequelize");

exports.create = async data => {
  return treatmentPlan.create(data);
};

exports.get = async condition => {
  return treatmentPlan.findAll(condition);
};

exports.findOne = async condition => {
  return treatmentPlan.findOne(condition);
};

exports.update = async (data, condition) => {
  return treatmentPlan.update(data, condition);
};

exports.remove = async condition => {
  return treatmentPlan.destroy(condition);
};

exports.findOrCreate = async data => {
  return treatmentPlan.findOrCreate(data);
};

exports.count = async (data, condition) => {
  return treatmentPlan.count(data, condition);
};

exports.sum = async (data, condition) => {
  return treatmentPlan.sum(data, condition);
};

exports.getActivePlans = async patientId => {
  return treatmentPlan.findAll({
    where: {
      patientId,
      deletedAt: null,
    },
    order: [["createdAt", "ASC"]],
  });
};

exports.getPlanSummary = async patientId => {
  const plans = await treatmentPlan.findAll({
    where: { patientId },
    attributes: ["id", "name", "discount", "createdAt"],
  });
  const totalDiscount = plans.reduce((sum, p) => sum + (p.discount || 0), 0);
  return { plans, totalDiscount, planCount: plans.length };
};
