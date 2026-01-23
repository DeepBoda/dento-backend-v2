const Clinic = require("./model");
const { Op } = require("sequelize");

exports.create = async data => {
  return Clinic.create(data);
};

exports.get = async condition => {
  return Clinic.findAll(condition);
};

exports.findOne = async condition => {
  return Clinic.findOne(condition);
};

exports.update = async (data, condition) => {
  return Clinic.update(data, condition);
};

exports.remove = async condition => {
  return Clinic.destroy(condition);
};

exports.count = async data => {
  return await Clinic.count(data);
};

exports.getClinicWithDetails = async (clinicId, userId) => {
  return Clinic.findOne({
    where: { id: clinicId, userId },
    attributes: [
      "id", "name", "address", "phone", "email",
      "workingHours", "logo", "isActive", "createdAt",
    ],
  });
};

exports.getUserClinics = async userId => {
  return Clinic.findAll({
    where: { userId, isActive: true },
    order: [["createdAt", "ASC"]],
  });
};

exports.updateWorkingHours = async (clinicId, workingHours) => {
  return Clinic.update(
    { workingHours },
    { where: { id: clinicId } }
  );
};
