const Patient = require("./model");
const { Op } = require("sequelize");

exports.create = async data => {
  return Patient.create(data);
};

exports.get = async condition => {
  return Patient.findAll(condition);
};

exports.findOne = async condition => {
  return Patient.findOne(condition);
};

exports.update = async (data, condition) => {
  return Patient.update(data, condition);
};

exports.remove = async condition => {
  return Patient.destroy(condition);
};

exports.count = async data => {
  return Patient.count(data);
};

exports.search = async ({ clinicId, query, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  const where = { clinicId };

  if (query) {
    where[Op.or] = [
      { name: { [Op.like]: `%${query}%` } },
      { phone: { [Op.like]: `%${query}%` } },
      { email: { [Op.like]: `%${query}%` } },
    ];
  }

  const { count, rows } = await Patient.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
  });

  return {
    patients: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  };
};

exports.getPatientStats = async clinicId => {
  const total = await Patient.count({ where: { clinicId } });
  const thisMonth = await Patient.count({
    where: {
      clinicId,
      createdAt: {
        [Op.gte]: new Date(new Date().setDate(1)),
      },
    },
  });
  return { total, thisMonth };
};
