const yup = require("yup");

exports.analyzeAppointmentValidation = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      clinicId: yup.number().required("clinicId is required"),
      startDate: yup.date().required("startDate is required"),
      endDate: yup.date().required("endDate is required"),
      question: yup.string().min(5, "question must be at least 5 characters"),
    });
    await schema.validate(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      errors: error.errors[0],
    });
  }
};

exports.analyzeTreatmentValidation = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      clinicId: yup.number().required("clinicId is required"),
      patientId: yup.number(),
      treatmentType: yup.string(),
      question: yup.string().min(5, "question must be at least 5 characters"),
    });
    await schema.validate(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      errors: error.errors[0],
    });
  }
};

exports.dashboardQueryValidation = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      clinicId: yup.number().required("clinicId is required"),
      period: yup.mixed().oneOf(["daily", "weekly", "monthly"]).default("monthly"),
    });
    await schema.validate(req.query);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      errors: error.errors[0],
    });
  }
};
