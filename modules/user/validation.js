const yup = require("yup");

const phoneRegExp = /^[6-9]\d{9}$/;

exports.registerValidation = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      name: yup.string().required("name is required"),
      phone: yup
        .string()
        .matches(phoneRegExp, "phone must be a valid 10-digit Indian mobile number")
        .required("phone is required"),
      password: yup
        .string()
        .min(6, "password must be at least 6 characters")
        .required("password is required"),
    });
    await schema.validate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ success: false, errors: error.errors[0] });
  }
};

exports.loginValidation = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      phone: yup
        .string()
        .matches(phoneRegExp, "phone must be a valid 10-digit Indian mobile number")
        .required("phone is required"),
      otp: yup.string().length(6, "OTP must be 6 digits"),
    });
    await schema.validate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ success: false, errors: error.errors[0] });
  }
};

exports.updateProfileValidation = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      name: yup.string(),
      email: yup.string().email("must be a valid email"),
      profileImage: yup.string().url("must be a valid URL"),
    });
    await schema.validate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ success: false, errors: error.errors[0] });
  }
};
