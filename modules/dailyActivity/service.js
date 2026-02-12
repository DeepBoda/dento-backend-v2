const DailyActivity = require("./model");
const { Op } = require("sequelize");

exports.create = async (data) => {
  return DailyActivity.create(data);
};

exports.get = async (condition) => {
  return DailyActivity.findAll(condition);
};

exports.findOne = async (condition) => {
  return DailyActivity.findOne(condition);
};

exports.update = async (data, condition) => {
  return DailyActivity.update(data, condition);
};

exports.remove = async (condition) => {
  return DailyActivity.destroy(condition);
};

exports.findOrCreate = async (where, defaults) => {
  return DailyActivity.findOrCreate({ where, defaults });
};

exports.getActivityByDateRange = async (clinicId, startDate, endDate) => {
  return DailyActivity.findAll({
    where: {
      clinicId,
      date: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    },
    order: [["date", "ASC"]],
  });
};

exports.getDailySummary = async (clinicId, date) => {
  const activity = await DailyActivity.findOne({
    where: { clinicId, date },
  });
  return activity || { clinicId, date, patientCount: 0, revenue: 0 };
};

exports.getWeeklySummary = async (clinicId) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  return DailyActivity.findAll({
    where: {
      clinicId,
      date: { [Op.between]: [startDate, endDate] },
    },
    order: [["date", "ASC"]],
  });
};
