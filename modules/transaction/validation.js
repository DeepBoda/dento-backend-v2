const yup = require("yup");

exports.createTransactionValidation = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      patientId: yup.number().required("patientId is required"),
      clinicId: yup.number().required("clinicId is required"),
      amount: yup
        .number()
        .positive("amount must be positive")
        .required("amount is required"),
      paymentMode: yup
        .mixed()
        .oneOf(["cash", "card", "upi", "online", "other"])
        .required("paymentMode is required"),
      note: yup.string(),
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

exports.updateTransactionValidation = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      amount: yup.number().positive("amount must be positive"),
      paymentMode: yup
        .mixed()
        .oneOf(["cash", "card", "upi", "online", "other"]),
      note: yup.string(),
      status: yup.mixed().oneOf(["pending", "partial", "paid", "refunded"]),
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

exports.revenueQueryValidation = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      clinicId: yup.number().required("clinicId is required"),
      startDate: yup.date().required("startDate is required"),
      endDate: yup.date().required("endDate is required"),
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
