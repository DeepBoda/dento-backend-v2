const Transaction = require("./model");
const { Op } = require("sequelize");

exports.create = async (data) => {
  return Transaction.create(data);
};

exports.get = async (condition) => {
  return Transaction.findAll(condition);
};

exports.findOne = async (condition) => {
  return Transaction.findOne(condition);
};

exports.sum = async (data, query) => {
  return await Transaction.sum(data, query);
};

exports.update = async (data, condition) => {
  return Transaction.update(data, condition);
};

exports.remove = async (condition) => {
  return Transaction.destroy(condition);
};

exports.getTransactionHistory = async (patientId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await Transaction.findAndCountAll({
    where: { patientId },
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
  return {
    transactions: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  };
};

exports.getRevenueByDateRange = async (clinicId, startDate, endDate) => {
  const result = await Transaction.sum("amount", {
    where: {
      clinicId,
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    },
  });
  return result || 0;
};

exports.getPendingPayments = async (clinicId) => {
  return Transaction.findAll({
    where: {
      clinicId,
      status: { [Op.in]: ["pending", "partial"] },
    },
    order: [["createdAt", "DESC"]],
  });
};
