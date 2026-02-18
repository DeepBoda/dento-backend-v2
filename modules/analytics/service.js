const { Op } = require("sequelize");
const sequelize = require("../../config/db");

/**
 * Analytics service — aggregates data across models for reporting.
 */

exports.getRevenueByPeriod = async (clinicId, period = "monthly") => {
    const Transaction = require("../transaction/model");
    const groupFormat =
        period === "daily"
            ? sequelize.fn("DATE", sequelize.col("createdAt"))
            : period === "weekly"
                ? sequelize.fn("WEEK", sequelize.col("createdAt"))
                : sequelize.fn("MONTH", sequelize.col("createdAt"));

    return Transaction.findAll({
        attributes: [
            [groupFormat, "period"],
            [sequelize.fn("SUM", sequelize.col("amount")), "totalRevenue"],
            [sequelize.fn("COUNT", sequelize.col("id")), "transactionCount"],
        ],
        where: { clinicId },
        group: [groupFormat],
        order: [[groupFormat, "ASC"]],
        raw: true,
    });
};

exports.getPatientGrowth = async (clinicId, months = 6) => {
    const Patient = require("../patient/model");
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return Patient.findAll({
        attributes: [
            [sequelize.fn("MONTH", sequelize.col("createdAt")), "month"],
            [sequelize.fn("YEAR", sequelize.col("createdAt")), "year"],
            [sequelize.fn("COUNT", sequelize.col("id")), "newPatients"],
        ],
        where: {
            clinicId,
            createdAt: { [Op.gte]: startDate },
        },
        group: [
            sequelize.fn("YEAR", sequelize.col("createdAt")),
            sequelize.fn("MONTH", sequelize.col("createdAt")),
        ],
        order: [
            [sequelize.fn("YEAR", sequelize.col("createdAt")), "ASC"],
            [sequelize.fn("MONTH", sequelize.col("createdAt")), "ASC"],
        ],
        raw: true,
    });
};

exports.getAppointmentStats = async (clinicId, startDate, endDate) => {
    const Visitor = require("../visitor/model");
    const [total, visited, scheduled] = await Promise.all([
        Visitor.count({ where: { clinicId, date: { [Op.between]: [startDate, endDate] } } }),
        Visitor.count({ where: { clinicId, isVisited: true, date: { [Op.between]: [startDate, endDate] } } }),
        Visitor.count({ where: { clinicId, isSchedule: true, date: { [Op.between]: [startDate, endDate] } } }),
    ]);
    const completionRate = total > 0 ? Math.round((visited / total) * 100) : 0;
    return { total, visited, scheduled, completionRate };
};

exports.getTopTreatments = async (clinicId, limit = 10) => {
    const Treatment = require("../treatment/model");
    const TreatmentPlan = require("../treatmentPlan/model");
    return Treatment.findAll({
        attributes: [
            "name",
            [sequelize.fn("COUNT", sequelize.col("treatments.id")), "count"],
            [sequelize.fn("SUM", sequelize.col("amount")), "totalRevenue"],
        ],
        include: [{ model: TreatmentPlan, where: { clinicId }, attributes: [] }],
        group: ["treatments.name"],
        order: [[sequelize.fn("COUNT", sequelize.col("treatments.id")), "DESC"]],
        limit,
        raw: true,
    });
};
