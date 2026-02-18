const PatientBill = require("./model");
const { Op } = require("sequelize");

exports.create = async data => {
  return PatientBill.create(data);
};

exports.get = async condition => {
  return PatientBill.findAll(condition);
};

exports.findOne = async condition => {
  return PatientBill.findOne(condition);
};

exports.update = async (data, condition) => {
  return PatientBill.update(data, condition);
};

exports.remove = async condition => {
  return PatientBill.destroy(condition);
};

exports.findOrCreate = async data => {
  return PatientBill.findOrCreate(data);
};

exports.getBillsByDateRange = async (clinicId, startDate, endDate) => {
  return PatientBill.findAll({
    where: {
      clinicId,
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    },
    order: [["createdAt", "DESC"]],
  });
};

exports.getTotalRevenue = async (clinicId, startDate, endDate) => {
  const bills = await PatientBill.findAll({
    where: {
      clinicId,
      status: "paid",
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    },
    attributes: ["totalAmount", "discountAmount"],
  });
  const total = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const discount = bills.reduce((sum, b) => sum + (b.discountAmount || 0), 0);
  return { total, discount, net: total - discount, count: bills.length };
};
